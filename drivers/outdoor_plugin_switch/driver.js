"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LutronDriver_1 = require("../../lib/driver/LutronDriver");
module.exports = class LutronOutdoorPluginSwitchDriver extends LutronDriver_1.LutronDriver {
    supportedDeviceTypes() {
        return ['OutdoorPlugInSwitch'];
    }
};
//# sourceMappingURL=driver.js.map