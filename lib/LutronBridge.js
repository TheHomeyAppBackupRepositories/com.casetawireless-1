"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const homey_1 = __importDefault(require("homey"));
const lutron_leap_1 = require("lutron-leap");
const node_forge_1 = require("node-forge");
const LutronClient_1 = __importDefault(require("./LutronClient"));
class LutronBridge {
    constructor(homey, id, address, serial) {
        this.homey = homey;
        this.id = id;
        this.address = address;
        this.serial = serial;
        // Retrieve the secrets, if already stored
        const jsonSecrets = this.homey.settings.get(this.getSecretsSettingsKey());
        if (jsonSecrets) {
            this.secrets = JSON.parse(jsonSecrets);
        }
        else {
            this.log('Secrets not found?');
        }
        // Build the client
        this.createClient();
    }
    /**
     * This method associates our client with the bridge.
     * Based on https://github.com/thenewwazoo/homebridge-lutron-caseta-leap/blob/4f596725d234920d45296bc98e5ad0415830eb02/homebridge-ui/server.js#L43.
     **/
    async associate() {
        if (this.isAssociated()) {
            this.log('Called associate while already associated');
            return;
        }
        // Generate a new RSA keypair
        const keys = await new Promise((resolve, reject) => {
            node_forge_1.pki.rsa.generateKeyPair({ bits: 2048 }, (err, keyPair) => {
                if (err !== undefined) {
                    resolve(keyPair);
                }
                else {
                    reject(err);
                }
            });
        });
        // Create a certification signing request (PKCS#10)
        const csr = node_forge_1.pki.createCertificationRequest();
        csr.publicKey = keys.publicKey;
        csr.setSubject([
            {
                name: 'commonName',
                value: 'homey-lutron-caseta',
            },
        ]);
        csr.sign(keys.privateKey);
        const csrText = node_forge_1.pki.certificationRequestToPem(csr);
        // Create a new pairing client with some default credentials
        this.log('Starting association');
        const pairClient = new lutron_leap_1.PairingClient(this.address, 8083);
        try {
            await pairClient.connect();
            this.log('Association connection made');
        }
        catch (e) {
            throw new Error('Association connection failed');
        }
        // Wait for a special message which indicates that the button has been pressed
        try {
            await new Promise((resolve, reject) => {
                const timeout = this.homey.setTimeout(() => reject(new Error('Button press timeout')), 30000);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                pairClient.once('message', (response) => {
                    this.debug('Received message', JSON.stringify(response));
                    if (response.Body.Status.Permissions.includes('PhysicalAccess')) {
                        this.debug('Button pressed');
                        this.homey.clearTimeout(timeout);
                        resolve();
                    }
                    else {
                        this.log('Invalid pairing result', JSON.stringify(response));
                        reject(response);
                    }
                });
            });
        }
        catch (e) {
            throw new Error('Button not pressed in time');
        }
        // Submit it to the bridge and wait for a special kind of response that includes the signed certificate
        let certResult;
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            certResult = await new Promise((resolve, reject) => {
                const timeout = this.homey.setTimeout(() => reject(new Error('CSR response timeout')), 5000);
                pairClient.once('message', response => {
                    this.log('Association cert request result received', JSON.stringify(response));
                    this.homey.clearTimeout(timeout);
                    resolve(response);
                });
                pairClient.requestPair(csrText);
            });
        }
        catch (e) {
            throw new Error('CSR Failed');
        }
        // @ts-ignore Force direct socket access to be able to close it now
        pairClient.socket?.end();
        if (certResult.Header.StatusCode !== '200 OK') {
            throw new Error('Invalid CSR response');
        }
        // Store the certificate
        this.secrets = {
            ca: certResult.Body.SigningResult.RootCertificate,
            cert: certResult.Body.SigningResult.Certificate,
            key: node_forge_1.pki.privateKeyToPem(keys.privateKey),
        };
        this.homey.settings.set(this.getSecretsSettingsKey(), JSON.stringify(this.secrets));
        // Create the client
        this.createClient();
        this.log('Association completed');
    }
    clearAssociation() {
        this.log('Clearing association');
        this.secrets = undefined;
        this.lutronClient?.close();
        this.leapBridge?.close();
        delete this.leapBridge;
        delete this.lutronClient;
        this.homey.settings.unset(this.getSecretsSettingsKey());
    }
    isAssociated() {
        return !!this.secrets;
    }
    getAddress() {
        return this.address;
    }
    getClient() {
        if (!this.lutronClient) {
            throw new Error('Missing lutron client');
        }
        return this.lutronClient;
    }
    async getHref(href) {
        if (!this.leapBridge) {
            throw new Error('Bridge not connected');
        }
        return this.leapBridge.getHref(href);
    }
    async getDevices() {
        if (!this.leapBridge) {
            throw new Error('Bridge not connected');
        }
        return this.leapBridge.getDeviceInfo();
    }
    updateAddress(address) {
        if (this.address === address) {
            return;
        }
        this.log(`Updating address from ${this.address} to ${address}`);
        this.address = address;
    }
    toString() {
        let s = `${this.id} @ ${this.address} [${this.serial ?? 'n/a'}]`;
        if (this.isAssociated()) {
            s += ' (associated)';
        }
        return s;
    }
    createClient() {
        if (!this.secrets) {
            // The secrets are required
            return;
        }
        this.lutronClient = new LutronClient_1.default(this.homey, this.address, this.secrets);
        this.leapBridge = new lutron_leap_1.SmartBridge(this.id, this.lutronClient.getClient());
        this.leapBridge.start();
        this.log('Client created');
    }
    getSecretsSettingsKey() {
        return `bridge-${this.id}-secret`;
    }
    log(...args) {
        this.homey.log(`[Bridge][${this.toString()}]`, ...args);
    }
    debug(...args) {
        if (homey_1.default.env.DEBUG !== '1') {
            return;
        }
        this.log(...args);
    }
}
exports.default = LutronBridge;
//# sourceMappingURL=LutronBridge.js.map