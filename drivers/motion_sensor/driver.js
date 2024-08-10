"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LutronDriver_1 = require("../../lib/driver/LutronDriver");
module.exports = class LutronMotionSensorDriver extends LutronDriver_1.LutronDriver {
    supportedDeviceTypes() {
        return ['RPSOccupancySensor'];
    }
    /**
     * So, motion sensors in the Lutron world are weird. They are bound to an occupancy group, which
     * seems to have a one-on-one relation with the area they are in. So, we need to retrieve the
     * supported sensors, and then convert them to occupancy groups for the actual driver.
     */
    async collapseDeviceOptions(bridge, devices) {
        // Map the found devices to their respective areas
        const areaMap = {};
        devices.map(device => {
            const area = device.store.AssociatedArea?.href;
            if (!area) {
                return;
            }
            areaMap[area] ??= [];
            areaMap[area].push(device);
        });
        const result = [];
        for (const areaHref of Object.keys(areaMap)) {
            const devices = areaMap[areaHref];
            const area = await bridge
                .getHref(devices[0].store.AssociatedArea)
                .catch(this.error);
            if (!area) {
                continue;
            }
            const occupancyGroupHref = area.Area.AssociatedOccupancyGroups[0].href;
            if (!occupancyGroupHref) {
                continue;
            }
            result.push({
                name: `${area.Area.Name} motion sensors`,
                data: {
                    id: occupancyGroupHref,
                    bridgeId: devices[0].data.bridgeId,
                },
                store: {
                    href: occupancyGroupHref,
                    AssociatedArea: devices[0].store.AssociatedArea,
                    ModelNumber: devices.map(d => d.store.ModelNumber).join(' / '),
                    SerialNumber: devices.map(d => d.store.SerialNumber).join(' / '),
                },
            });
        }
        return result;
    }
};
//# sourceMappingURL=driver.js.map