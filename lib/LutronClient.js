"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const events_1 = require("events");
const homey_1 = __importDefault(require("homey"));
const lutron_leap_1 = require("lutron-leap");
const promise_queue_1 = __importDefault(require("promise-queue"));
const RECONNECT_INTERVAL = 30000;
class LutronClient extends events_1.EventEmitter {
    constructor(homey, address, secrets) {
        super();
        this.homey = homey;
        this.queue = new promise_queue_1.default(1, Infinity);
        // Register which zones are in use, as we need to subscribe to them when a reconnect happens
        this.registeredZones = new Set();
        this.registeredButtons = new Set();
        // Use larger max listeners
        this.setMaxListeners(100);
        if (homey_1.default.env.LEAP_DEBUG === '1') {
            // Enable LEAP client debug
            this.log('Enabling LEAP debug');
            debug_1.default.enable('leap:protocol:client');
            debug_1.default.log = this.homey.log.bind(this.homey);
        }
        this.leapClient = new lutron_leap_1.LeapClient(address, 8081, secrets.ca, secrets.key, secrets.cert);
        this.leapClient.on('unsolicited', response => this.handleEvent(response));
        this.leapClient.on('disconnected', () => {
            if (this.reconnectInterval) {
                return;
            }
            // Client has disconnected. It should reconnect automatically when a new request has been made,
            // so we try that for all currently registered zones after a couple of seconds. We also restore
            // the known button subscriptions
            this.reconnectInterval = this.homey.setInterval(async () => {
                try {
                    for (const zone of this.registeredZones.values()) {
                        const zoneData = await this.getZoneStatus(zone);
                        this.emit('zoneStatus', zone, zoneData.ZoneStatus);
                    }
                    for (const button of this.registeredButtons.values()) {
                        await this.subscribeToButton({ href: button });
                    }
                }
                catch (e) {
                    this.error('Reconnect failed', e);
                }
                // Clear interval when done
                this.homey.clearInterval(this.reconnectInterval);
                delete this.reconnectInterval;
            }, RECONNECT_INTERVAL);
        });
    }
    getClient() {
        return this.leapClient;
    }
    close() {
        this.leapClient.close();
        if (this.reconnectInterval) {
            this.homey.clearInterval(this.reconnectInterval);
            delete this.reconnectInterval;
        }
    }
    async getButtonGroups(device) {
        return Promise.all(device.ButtonGroups.map(buttonHref => {
            return this.queue.add(() => Promise.resolve()
                .then(async () => {
                return await this.leapClient.request('ReadRequest', buttonHref.href)
                    .then(response => {
                    this.debug('ButtonGroup response received', JSON.stringify(response));
                    if (this.isValidResponse(response) && response.Body) {
                        return response.Body.ButtonGroup;
                    }
                    throw new Error(this.homey.__('invalid-response'));
                });
            }));
        }));
    }
    async getDeviceDefinition(device) {
        return await this.queue.add(() => Promise.resolve()
            .then(async () => {
            return await this.leapClient
                .request('ReadRequest', device.href)
                .then(response => {
                this.debug('Device definition response received', JSON.stringify(response));
                if (this.isValidResponse(response) && response.Body) {
                    return response.Body;
                }
                throw new Error(this.homey.__('invalid-response'));
            });
        }));
    }
    async setLevel(device, value) {
        const zone = this.getDeviceZone(device);
        this.log('Set level', device.href, zone, value);
        await this.executeCommand(zone, {
            CommandType: 'GoToLevel',
            Parameter: [{ Type: 'Level', Value: value }],
        });
    }
    async setTilt(device, value) {
        const zone = this.getDeviceZone(device);
        this.log('Set tilt', device.href, zone, value);
        await this.executeCommand(zone, {
            CommandType: 'GoToTilt',
            TiltParameters: { Tilt: Math.round(value) },
        });
    }
    async setFanSpeed(device, speed) {
        const zone = this.getDeviceZone(device);
        this.log('Set fan speed', device.href, zone, speed);
        await this.executeCommand(zone, {
            CommandType: 'GoToFanSpeed',
            FanSpeedParameters: { FanSpeed: speed },
        });
    }
    async executeCommand(zone, command) {
        await this.queue.add(() => Promise.resolve()
            .then(async () => {
            await this.leapClient
                .request('CreateRequest', `${zone}/commandprocessor`, {
                Command: command,
            })
                .then(response => {
                this.debug('Response received', JSON.stringify(response));
                if (!this.isValidResponse(response)) {
                    throw new Error(this.homey.__('invalid-response'));
                }
            });
        }));
    }
    async getStatus(device) {
        const zone = this.getDeviceZone(device);
        this.log('Get zone status', device.href, zone);
        const response = await this.getZoneStatus(zone);
        this.log('Zone status', JSON.stringify(response));
        return response;
    }
    async subscribeToButton(button) {
        this.registeredButtons.add(button.href);
        await this.leapClient.subscribe(button.href + '/status/event', r => {
            if (r.Body) {
                const buttonEvent = r.Body.ButtonStatus;
                this.emit('buttonEvent', buttonEvent.Button.href, buttonEvent.ButtonEvent.EventType);
                return;
            }
            this.log('Unknown button event', JSON.stringify(r));
        });
    }
    async getZoneStatus(zone) {
        this.registeredZones.add(zone);
        return await this.queue.add(() => Promise.resolve()
            .then(async () => {
            return await this.leapClient
                .request('ReadRequest', `${zone}/status`)
                .then(response => {
                this.debug('Zone status response received', JSON.stringify(response));
                if (this.isValidResponse(response) && response.Body) {
                    return response.Body;
                }
                throw new Error(this.homey.__('invalid-response'));
            });
        }));
    }
    handleEvent(response) {
        this.debug('Received event', JSON.stringify(response));
        switch (response.CommuniqueType) {
            case 'ReadResponse':
                if (!response.Body) {
                    this.log('Missing response body?');
                    return;
                }
                this.handleReadResponse(response.Header, response.Body);
                break;
            case 'SubscribeResponse':
                // Triggered when reading from device
                break;
            default:
                this.debug('Unhandled event', response.CommuniqueType);
        }
    }
    handleReadResponse(header, body) {
        switch (header.MessageBodyType) {
            case 'OneZoneStatus': {
                const zoneStatus = body.ZoneStatus;
                this.emit('zoneStatus', zoneStatus.Zone.href, zoneStatus);
                break;
            }
        }
    }
    getDeviceZone(device) {
        const zone = device.LocalZones[0].href;
        if (!zone) {
            throw new Error('Zone not set');
        }
        return zone;
    }
    isValidResponse(response) {
        const code = response.Header.StatusCode?.code ?? 0;
        return code >= 200 && code < 300;
    }
    log(...args) {
        this.homey.log('[LutronClient]', ...args);
    }
    error(...args) {
        this.homey.error('[LutronClient]', ...args);
    }
    debug(...args) {
        if (homey_1.default.env.DEBUG !== '1') {
            return;
        }
        this.log(...args);
    }
}
exports.default = LutronClient;
//# sourceMappingURL=LutronClient.js.map