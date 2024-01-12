"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const LutronDimmableDevice_1 = __importDefault(require("./LutronDimmableDevice"));
const fanSpeedMap = {
    High: 4,
    MediumHigh: 3,
    Medium: 2,
    Low: 1,
    Off: 0,
};
class LutronFanDevice extends LutronDimmableDevice_1.default {
    async onInit() {
        await super.onInit();
        this.fanSpeedTrigger = this.homey.flow.getDeviceTriggerCard('lutron_fan_speed_changed_to');
    }
    async onDeviceUpdate(payload) {
        const value = payload.FanSpeed;
        this.debug('Updated level', value);
        this
            .setCapabilityValue('onoff', value !== 'Off')
            .catch(this.error);
        const dimCapability = this.getDimCapability();
        const oldCapabilityValue = this.getCapabilityValue(dimCapability);
        this
            .setCapabilityValue(dimCapability, value)
            .catch(this.error);
        if (oldCapabilityValue !== value) {
            this.triggerFanSpeedChangedToTrigger(value);
        }
    }
    async setOnOff(value) {
        await this.getClient().setFanSpeed(this.deviceDefinition, value ? 'High' : 'Off');
    }
    async setDimValue(value) {
        await this.getClient().setFanSpeed(this.deviceDefinition, value);
    }
    getMaxValue() {
        return 'High';
    }
    getDimCapability() {
        return 'lutron_fan_speed';
    }
    dimValueAsNumber(value) {
        return fanSpeedMap[value];
    }
    triggerFanSpeedChangedToTrigger(value) {
        this.log('Trigger fan speed change to', value);
        this.fanSpeedTrigger?.trigger(this, { speed: value }, { speed: value }).catch(this.error);
    }
}
exports.default = LutronFanDevice;
//# sourceMappingURL=LutronFanDevice.js.map