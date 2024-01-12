"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const homey_1 = __importDefault(require("homey"));
const homey_log_1 = require("homey-log");
const source_map_support_1 = __importDefault(require("source-map-support"));
const LutronBridgeDiscovery_1 = require("./lib/LutronBridgeDiscovery");
source_map_support_1.default.install();
class LutronCasetaApp extends homey_1.default.App {
    async onInit() {
        try {
            await super.onInit();
            this.homeyLog = new homey_log_1.Log({ homey: this.homey });
            this.discovery = new LutronBridgeDiscovery_1.LutronBridgeDiscovery(this.homey);
            // Register flow actions
            this.homey.flow
                .getActionCard('lutron_fan_speed')
                .registerRunListener((args) => args.device.triggerCapabilityListener('lutron_fan_speed', args.speed));
            // Register flow conditions
            this.homey.flow
                .getConditionCard('lutron_fan_speed')
                .registerRunListener((args) => args.device.getCapabilityValue('lutron_fan_speed') === args.speed);
            // Register flow triggers
            this.homey.flow
                .getDeviceTriggerCard('lutron_fan_speed_changed_to')
                .registerRunListener((args, state) => args.speed === state.speed);
            this.log('Lutron Caseta has been initialized');
        }
        catch (e) {
            this.log('Lutron Caseta failed to initialize');
            this.error(e);
        }
    }
    getBridges() {
        return this.discovery.getBridges();
    }
    async getBridge(bridgeId) {
        return this.discovery.getBridge(bridgeId);
    }
}
module.exports = LutronCasetaApp;
//# sourceMappingURL=app.js.map