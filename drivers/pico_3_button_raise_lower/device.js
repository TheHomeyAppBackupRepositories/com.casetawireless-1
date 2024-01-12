"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const LutronButtonDevice_1 = __importDefault(require("../../lib/device/LutronButtonDevice"));
module.exports = class LutronPico3ButtonRaiseLowerDevice extends LutronButtonDevice_1.default {
    mapToFlowButton(buttonNumber) {
        switch (buttonNumber) {
            case 0:
                return 'on';
            case 1:
                return 'center';
            case 2:
                return 'off';
            case 3:
                return 'raise';
            case 4:
                return 'lower';
            default:
                return null;
        }
    }
};
//# sourceMappingURL=device.js.map