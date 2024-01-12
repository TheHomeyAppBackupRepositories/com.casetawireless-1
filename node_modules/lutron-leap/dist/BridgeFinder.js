"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BridgeFinder = void 0;
const debug_1 = require("debug");
const events_1 = require("events");
const ipaddress = require("ip-address");
const tinkerhub_mdns_1 = require("tinkerhub-mdns");
const logDebug = (0, debug_1.default)('leap:protocol:discovery');
class BridgeFinder extends events_1.EventEmitter {
    constructor() {
        super();
    }
    beginSearching() {
        this.discovery = new tinkerhub_mdns_1.MDNSServiceDiscovery({
            type: 'lutron',
            protocol: tinkerhub_mdns_1.Protocol.TCP,
        });
        this.discovery.onAvailable((svc) => {
            this.handleDiscovery(svc)
                .then((bridgeInfo) => {
                this.emit('discovered', bridgeInfo);
            })
                .catch((e) => {
                logDebug('failed to handle discovery:', e);
                this.emit('failed', e);
            });
        });
    }
    async handleDiscovery(svc) {
        const systype = svc.data.get('systype');
        if (typeof systype === 'boolean') {
            throw new Error(`got boolean systype with value ${systype}`);
        }
        const ipaddr = this.extractIp(svc.addresses);
        logDebug('got useful ipaddr', ipaddr);
        if (!ipaddr) {
            logDebug('thing without useful address:', svc);
            throw new Error('could not get a useful address');
        }
        const bridgeID = await this.getBridgeID(svc.id);
        logDebug('extracted bridge ID:', bridgeID);
        return {
            bridgeid: bridgeID,
            ipAddr: ipaddr,
            systype,
        };
    }
    destroy() {
        if (this.discovery) {
            this.discovery.destroy();
        }
    }
    extractIp(haps) {
        for (const hostandport of haps) {
            logDebug('checking', hostandport);
            // prefer the ipv6 address, but only if it's reachable
            //
            // FIXME: this code is untested in real life, as my home network is
            // ipv4 only.
            const _ip = hostandport.host;
            try {
                const addr = new ipaddress.Address6(_ip);
                if (!addr.isLinkLocal() && !addr.isLoopback()) {
                    // TODO is this sufficient?
                    return _ip;
                    break;
                }
            }
            catch (e) {
                // try again, but as ipv4
                logDebug('was not ipv6:', e);
                try {
                    const _ = new ipaddress.Address4(_ip);
                    return _ip;
                }
                catch (e) {
                    // okay, apparently it's some garbage. log it and move on
                    logDebug('could not parse HostAndPort', hostandport, 'because', e);
                }
            }
        }
        return undefined;
    }
    async getBridgeID(mdnsID) {
        // @ts-ignore: reaching into the serviceData private member lets us
        // avoid having to repeat a query for the SRV record. there's no
        // "official" way to get to it, but we can rely on it implicitly
        // existing.
        const tgt = this.discovery.serviceData.get(mdnsID).SRV._record.target;
        try {
            return tgt.match(/[Ll]utron-(?<id>\w+)\.local/).groups.id.toUpperCase();
        }
        catch (e) {
            throw new Error(`could not get bridge serial number from ${tgt}: ${e}`);
        }
    }
}
exports.BridgeFinder = BridgeFinder;
//# sourceMappingURL=BridgeFinder.js.map