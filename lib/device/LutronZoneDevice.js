"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const LutronDevice_1 = __importDefault(require("./LutronDevice"));
class LutronZoneDevice extends LutronDevice_1.default {
    async onLutronDeviceInit() {
        // Resolve zone
        this.myZone = this.deviceDefinition.LocalZones[0].href;
    }
    async onBridgeFound() {
        const client = this.getClient();
        // Register update handler
        client.on('zoneStatus', (zone, payload) => {
            if (zone !== this.myZone) {
                return;
            }
            if (this.isDeleted()) {
                // The device has been deleted, do not handle event
                return;
            }
            this.log('Zone status update', JSON.stringify(payload));
            this.onDeviceUpdate(payload).catch(this.error);
        });
        // Retrieve the current status
        client
            .getStatus(this.deviceDefinition)
            .then(responseBody => {
            this.debug('Initial update data');
            this.homey.setTimeout(() => this.onDeviceUpdate(responseBody.ZoneStatus).catch(this.error), 500);
        })
            .catch(e => {
            this.debug('Failed to retrieve status, marking unavailable');
            this.setUnavailable(e.message).catch(this.error);
        });
    }
}
exports.default = LutronZoneDevice;
//# sourceMappingURL=LutronZoneDevice.js.map