"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LutronDriver = void 0;
const homey_1 = __importDefault(require("homey"));
const Utils_1 = require("../Utils");
class LutronDriver extends homey_1.default.Driver {
    async onPair(session) {
        const bridges = this.homey.app.getBridges();
        const bridgeArray = Array.from(bridges.values());
        let selectedBridge;
        session.setHandler('list_devices', async () => {
            if (selectedBridge) {
                this.log('Showing bridge devices');
                // List the relevant bridge devices
                const devices = await selectedBridge.getDevices();
                this.log('Devices found', JSON.stringify(devices.map(d => ({
                    href: d.href,
                    name: d.Name,
                    type: d.DeviceType,
                    model: d.ModelNumber,
                    zone: d.LocalZones ? d.LocalZones[0].href : null,
                }))));
                return devices
                    .map(device => {
                    const mappedDevice = this.mapDevice(device);
                    if (mappedDevice === null) {
                        return null;
                    }
                    return {
                        ...mappedDevice,
                        name: device.Name,
                        data: {
                            id: device.href,
                            bridgeId: selectedBridge.id,
                        },
                        store: device,
                    };
                }).filter(device => !!device);
            }
            this.log('Showing bridges');
            return bridgeArray
                .map(bridge => ({
                name: `Smart Bridge (${bridge.serial ?? bridge.getAddress()})`,
                icon: 'bridge.svg',
                data: {
                    id: bridge.id,
                },
            }));
        });
        session.setHandler('list_bridges_selection', async ([selectedItem]) => {
            // This event is triggered when the selection on the `list_devices` template
            // with id `list_bridges` changes, which append `_selection` to the template id
            const bridge = bridges.get(selectedItem.data.id);
            if (!bridge) {
                throw new Error('Invalid bridge id');
            }
            selectedBridge = bridge;
            this.log('Selected bridge', selectedBridge.toString());
        });
        session.setHandler('showView', async (viewId) => {
            this.debug('Opening view', viewId);
            switch (viewId) {
                case 'check_associated_bridge':
                    await (0, Utils_1.wait)(1000); // This improves the flow
                    if (!selectedBridge && bridgeArray.length === 1) {
                        const firstBridge = bridgeArray[0];
                        if (firstBridge.isAssociated()) {
                            // Only one bridge found and associated, so select it
                            this.log('Automatically select only associated bridge', firstBridge.toString());
                            selectedBridge = firstBridge;
                            return await session.showView('list_devices');
                        }
                    }
                    return await session.showView('list_bridges');
                case 'check_authentication':
                    await (0, Utils_1.wait)(1000); // This improves the flow
                    if (selectedBridge && selectedBridge.isAssociated()) {
                        // Bridge authenticated, forward to devices
                        return await session.showView('list_devices');
                    }
                    // Start bridge authentication
                    return await session.showView('authenticate');
                case 'authenticate':
                    if (!selectedBridge) {
                        return await session.showView('list_bridges');
                    }
                    try {
                        await selectedBridge.associate();
                        await session.showView('list_devices');
                    }
                    catch (e) {
                        this.error(e);
                        session.emit('error', this.homey.__('pair.failed')).catch(this.error);
                    }
                    break;
                default:
                    break;
            }
        });
    }
    async onRepair(session, device) {
        const bridge = device.getBridge();
        if (!bridge) {
            throw new Error('Bridge not found');
        }
        session.setHandler('showView', async (viewId) => {
            if (viewId !== 'authenticate') {
                return;
            }
            try {
                bridge.clearAssociation();
                await bridge.associate();
                await session.done();
            }
            catch (e) {
                this.error(e);
                session.emit('error', this.homey.__('pair.failed')).catch(this.error);
            }
        });
    }
    mapDevice(device) {
        if (this.supportedDeviceTypes().includes(device.DeviceType)) {
            return {};
        }
        return null;
    }
    debug(...args) {
        if (homey_1.default.env.DEBUG !== '1') {
            return;
        }
        this.log(...args);
    }
}
exports.LutronDriver = LutronDriver;
//# sourceMappingURL=LutronDriver.js.map