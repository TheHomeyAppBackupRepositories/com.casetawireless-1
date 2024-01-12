"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LutronDriver_1 = require("../../lib/driver/LutronDriver");
module.exports = class LutronPico2ButtonRaiseLowerDriver extends LutronDriver_1.LutronDriver {
    supportedDeviceTypes() {
        return ['Pico2ButtonRaiseLower'];
    }
};
//# sourceMappingURL=driver.js.map