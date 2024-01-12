"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const homey_1 = __importDefault(require("homey"));
class LutronDevice extends homey_1.default.Device {
    constructor() {
        super(...arguments);
        this.bridge = null;
        this.deviceDeleted = false;
    }
    async onInit() {
        await super.onInit();
        this.data = this.getData();
        this.deviceDefinition = this.getStore();
        // Set settings from data
        this.setSettings({
            model: String(this.deviceDefinition.ModelNumber),
            serial: String(this.deviceDefinition.SerialNumber),
        }).catch(this.error);
        // Load bridge instance
        this.homey.app.getBridge(this.data.bridgeId).then(bridge => {
            this.debug('Bridge found');
            this.bridge = bridge;
            if (this.deviceDeleted) {
                // Do not continue when the device is deleted
                return;
            }
            // Let device do stuff if needed
            this.onBridgeFound().catch(this.error);
        }).catch(this.error);
        await this.onLutronDeviceInit();
        this.log('Initialized device', JSON.stringify(this.data), JSON.stringify(this.deviceDefinition));
    }
    onDeleted() {
        this.deviceDeleted = true;
    }
    isDeleted() {
        return this.deviceDeleted;
    }
    getBridge() {
        return this.bridge;
    }
    getClient() {
        if (!this.bridge) {
            throw new Error(this.homey.__('bridge-not-available'));
        }
        return this.bridge.getClient();
    }
    log(...args) {
        // Use driver log to override path
        this.driver.log(`[${this.data.id}]`, ...args);
    }
    debug(...args) {
        if (homey_1.default.env.DEBUG !== '1') {
            return;
        }
        this.log(...args);
    }
}
exports.default = LutronDevice;
//# sourceMappingURL=LutronDevice.js.map