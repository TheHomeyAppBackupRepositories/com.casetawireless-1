"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const LutronDimmableDevice_1 = __importDefault(require("./LutronDimmableDevice"));
class LutronLightDevice extends LutronDimmableDevice_1.default {
    async onDeviceUpdate(payload) {
        const value = payload.Level;
        this.debug('Updated level', value);
        this
            .setCapabilityValue('onoff', value !== 0)
            .catch(this.error);
        if (this.hasCapability('dim')) {
            this
                .setCapabilityValue('dim', Math.round(value) / 100)
                .catch(this.error);
        }
    }
    async setOnOff(value) {
        await this.getClient().setLevel(this.deviceDefinition, value ? 100 : 0);
    }
    async setDimValue(value) {
        await this.getClient().setLevel(this.deviceDefinition, Math.round(value * 100));
    }
    getDimCapability() {
        return 'dim';
    }
    getMaxValue() {
        return 100;
    }
    dimValueAsNumber(value) {
        return value;
    }
}
exports.default = LutronLightDevice;
//# sourceMappingURL=LutronLightDevice.js.map