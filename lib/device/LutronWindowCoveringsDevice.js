"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const LutronZoneDevice_1 = __importDefault(require("./LutronZoneDevice"));
const CAP_COVER = 'windowcoverings_set';
const CAP_TILT = 'windowcoverings_tilt_set';
class LutronWindowCoveringsDevice extends LutronZoneDevice_1.default {
    async onLutronDeviceInit() {
        await super.onLutronDeviceInit();
        if (this.hasCapability(CAP_COVER)) {
            this.registerCapabilityListener(CAP_COVER, async (coveringsValue) => await this.setCoveringValue(coveringsValue));
        }
        if (this.hasCapability(CAP_TILT)) {
            this.registerCapabilityListener(CAP_TILT, async (coveringsValue) => await this.setTiltValue(coveringsValue));
        }
    }
    async onDeviceUpdate(payload) {
        if (this.hasCapability(CAP_COVER)) {
            const level = payload.Level;
            this.debug('Updated level', level);
            this.setCapabilityValue(CAP_COVER, level).catch(this.error);
        }
        if (this.hasCapability(CAP_TILT)) {
            const tilt = payload.Tilt;
            this.debug('Updated tilt', tilt);
            this.setCapabilityValue(CAP_TILT, tilt).catch(this.error);
        }
    }
    async setCoveringValue(value) {
        await this.getClient().setLevel(this.deviceDefinition, value);
    }
    async setTiltValue(value) {
        await this.getClient().setTilt(this.deviceDefinition, value);
    }
}
exports.default = LutronWindowCoveringsDevice;
//# sourceMappingURL=LutronWindowCoveringsDevice.js.map