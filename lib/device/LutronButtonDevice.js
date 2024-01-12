"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const LutronDevice_1 = __importDefault(require("./LutronDevice"));
class LutronButtonDevice extends LutronDevice_1.default {
    constructor() {
        super(...arguments);
        this.buttonMap = {};
        this.longPressTimeouts = {};
    }
    onLutronDeviceInit() {
        return Promise.resolve();
    }
    async onBridgeFound() {
        const client = this.getClient();
        client.on('buttonEvent', (d, e) => {
            const device = this.buttonMap[d];
            if (!device) {
                // Not for this device
                return;
            }
            if (this.isDeleted()) {
                // The device has been deleted, do not handle event
                return;
            }
            this.handleButtonEvent(device, e).catch(this.error);
        });
        // Retrieve button group information to find the buttons
        const buttonGroups = await client.getButtonGroups(this.deviceDefinition);
        this.debug('ButtonGroups', JSON.stringify(buttonGroups));
        const buttons = buttonGroups
            .map(bg => bg.Buttons)
            .reduce((previousValue, currentValue) => {
            previousValue.push(...currentValue);
            return previousValue;
        }, []);
        this.debug('Buttons', JSON.stringify(buttons));
        for (const button of buttons) {
            const deviceInfo = await client.getDeviceDefinition(button);
            this.debug('DeviceInfo', JSON.stringify(deviceInfo));
            if (!deviceInfo.Button) {
                this.error('Invalid device info', JSON.stringify(deviceInfo));
                return;
            }
            // Register the button information
            this.buttonMap[button.href] = deviceInfo.Button;
            // Register the event handler
            await client.subscribeToButton(button);
        }
    }
    async handleButtonEvent(device, event) {
        this.debug('Incoming event', event, JSON.stringify(device));
        const buttonId = this.mapToFlowButton(device.ButtonNumber);
        if (!buttonId) {
            this.log('Event not handled', event, JSON.stringify(device));
            return;
        }
        // Clear any pending timeout
        if (this.longPressTimeouts[buttonId]) {
            this.homey.clearTimeout(this.longPressTimeouts[buttonId]);
        }
        // Build flow id and trigger it
        const flowId = `button_${buttonId}_${event.toLowerCase()}`;
        this.triggerFlow(flowId).catch(this.error);
        if (event !== 'Press') {
            // Not a normal press, so stop processing
            return;
        }
        // Start timeout for the long flow
        this.longPressTimeouts[buttonId] = this.homey.setTimeout(() => {
            // Clear timeout registration
            this.longPressTimeouts[buttonId] = null;
            // Trigger the flow
            this.triggerFlow(flowId + '_long').catch(this.error);
        }, this.getSetting('long_press_time'));
    }
    async triggerFlow(flowId) {
        const triggerCard = this.homey.flow.getDeviceTriggerCard(flowId);
        if (!triggerCard) {
            this.log('Flow trigger not found', flowId);
            return;
        }
        // Trigger the flow
        this.log('Triggering flow', flowId);
        await triggerCard.trigger(this).catch(this.error);
    }
}
exports.default = LutronButtonDevice;
//# sourceMappingURL=LutronButtonDevice.js.map