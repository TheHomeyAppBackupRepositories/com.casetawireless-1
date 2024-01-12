"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LutronBridgeDiscovery = void 0;
const events_1 = require("events");
const homey_1 = __importDefault(require("homey"));
const LutronBridge_1 = __importDefault(require("./LutronBridge"));
class LutronBridgeDiscovery extends events_1.EventEmitter {
    constructor(homey) {
        super();
        this.homey = homey;
        this.bridges = new Map();
        // Use larger max listeners
        this.setMaxListeners(100);
        this.log('Starting discovery');
        this.discoveryStrategy = this.homey.discovery.getStrategy('lutron-bridge');
        // Register discovery handler
        this.discoveryStrategy.on('result', result => this.onMdnsDiscoveryResult(result));
        // Handle existing results
        Object.values(this.discoveryStrategy.getDiscoveryResults())
            .forEach(result => this.onMdnsDiscoveryResult(result));
    }
    onMdnsDiscoveryResult(result) {
        this.debug('Discovered bridge', JSON.stringify(result));
        // Add address changed handler on this particular result
        result.on('addressChanged', (result) => {
            this.onDiscoveryResult(result.id, result.address);
        });
        let serial = undefined;
        if (result.host) {
            serial = result.host.match(/[Ll]utron-(?<id>\w+)\.local/)?.groups?.id?.toUpperCase();
        }
        // Forward to registration
        this.onDiscoveryResult(result.id, result.address, serial);
    }
    onDiscoveryResult(id, address, serial) {
        const bridge = this.bridges.get(id);
        if (bridge) {
            this.log(`Re-discovered ${id} at ${address}`);
            bridge.updateAddress(address);
        }
        else {
            this.log(`Discovered ${id} at ${address}`);
            const bridge = new LutronBridge_1.default(this.homey, id, address, serial);
            this.bridges.set(id, bridge);
            this.emit(`bridge:${id}`, bridge);
            this.log(`Bridge initialized: ${bridge.toString()}`);
        }
    }
    getBridges() {
        return this.bridges;
    }
    async getBridge(bridgeId) {
        const bridge = this.bridges.get(bridgeId);
        if (bridge) {
            return bridge;
        }
        return new Promise(resolve => {
            this.once(`bridge:${bridgeId}`, bridge => resolve(bridge));
        });
    }
    log(...args) {
        this.homey.log('[Discovery]', ...args);
    }
    error(...args) {
        this.homey.error('[Discovery]', ...args);
    }
    debug(...args) {
        if (homey_1.default.env.DEBUG !== '1') {
            return;
        }
        this.log(...args);
    }
}
exports.LutronBridgeDiscovery = LutronBridgeDiscovery;
//# sourceMappingURL=LutronBridgeDiscovery.js.map