"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LutronDriver_1 = require("../../lib/driver/LutronDriver");
module.exports = class LutronPico2ButtonDriver extends LutronDriver_1.LutronDriver {
    supportedDeviceTypes() {
        return ['PaddleSwitchPico'];
    }
};
//# sourceMappingURL=driver.js.map