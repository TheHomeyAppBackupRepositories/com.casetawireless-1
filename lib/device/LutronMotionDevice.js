"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const LutronDevice_1 = __importDefault(require("./LutronDevice"));
class LutronMotionDevice extends LutronDevice_1.default {
    async onLutronDeviceInit() {
        return Promise.resolve();
    }
    async onBridgeFound() {
        const client = this.getClient();
        client.on('occupancyEvent', (occupancyStatus) => {
            if (occupancyStatus.OccupancyGroup.href !== this.deviceDefinition.href) {
                // Not for this device
                return;
            }
            if (this.isDeleted()) {
                // The device has been deleted, do not handle event
                return;
            }
            this.handleOccupancyEvent(occupancyStatus.OccupancyStatus).catch(this.error);
        });
        // Tell the client to listen for occupancy updates
        await client.subscribeToOccupancy();
    }
    async handleOccupancyEvent(status) {
        this.debug('Incoming status', status);
        let value = null;
        switch (status) {
            case 'Occupied':
                value = true;
                break;
            case 'Unoccupied':
                value = false;
                break;
            default:
                break;
        }
        await this.setCapabilityValue('alarm_motion', value).catch(this.error);
    }
}
exports.default = LutronMotionDevice;
//# sourceMappingURL=LutronMotionDevice.js.map