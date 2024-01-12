"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wait = void 0;
async function wait(ms) {
    await new Promise(resolve => setTimeout(() => resolve(), ms));
}
exports.wait = wait;
//# sourceMappingURL=Utils.js.map