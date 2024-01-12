"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const LutronButtonDevice_1 = __importDefault(require("../../lib/device/LutronButtonDevice"));
module.exports = class LutronPico2ButtonDevice extends LutronButtonDevice_1.default {
    mapToFlowButton(buttonNumber) {
        switch (buttonNumber) {
            case 1:
                return '1';
            case 2:
                return '2';
            case 3:
                return '3';
            case 4:
                return '4';
            default:
                return null;
        }
    }
};
//# sourceMappingURL=device.js.map