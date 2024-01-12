"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const LutronZoneDevice_1 = __importDefault(require("./LutronZoneDevice"));
const CAP_ONOFF = 'onoff';
class LutronDimmableDevice extends LutronZoneDevice_1.default {
    async onLutronDeviceInit() {
        await super.onLutronDeviceInit();
        const dimCapability = this.getDimCapability();
        if (this.hasCapability(dimCapability)) {
            this.registerMultipleCapabilityListener([CAP_ONOFF, dimCapability], async (data) => {
                this.debug('Capability listener', data);
                const onOffValue = data.onoff;
                const dimCapabilityValue = data[dimCapability];
                const dimCapabilityNumericValue = this.dimValueAsNumber(dimCapabilityValue);
                if (dimCapabilityNumericValue > 0 && onOffValue === false) {
                    // Special case when both are given, just turn off
                    // Do not touch new dim value
                    await this.setOnOff(false);
                }
                else if (dimCapabilityNumericValue <= 0 && onOffValue === true) {
                    // Special case when both are given, just turn fully on
                    // And update the current dim value to match
                    await this.setCapabilityValue(dimCapability, this.getMaxValue());
                    await this.setOnOff(true);
                }
                else {
                    if (onOffValue === false) {
                        // Just turn off
                        await this.setOnOff(false);
                    }
                    else if (onOffValue === true) {
                        // Only turn on, use last dim value if not given
                        const actualDimValue = dimCapabilityValue ?? this.getCapabilityValue(dimCapability);
                        if (this.dimValueAsNumber(actualDimValue) > 0) {
                            // But only use it if it makes sense
                            await this.setDimValue(actualDimValue);
                        }
                        else {
                            // Otherwise, just turn on the bulb
                            await this.setOnOff(true);
                        }
                    }
                    else {
                        // Only the dim value was supplied
                        // Make sure to update onoff value
                        await this.setCapabilityValue(CAP_ONOFF, dimCapabilityNumericValue !== 0);
                        await this.setDimValue(dimCapabilityValue);
                    }
                }
            });
        }
        else {
            this.registerCapabilityListener(CAP_ONOFF, async (onOffValue) => await this.setOnOff(onOffValue));
        }
    }
}
exports.default = LutronDimmableDevice;
//# sourceMappingURL=LutronDimmableDevice.js.map