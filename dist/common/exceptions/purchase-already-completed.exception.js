"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseAlreadyCompletedException = void 0;
const common_1 = require("@nestjs/common");
class PurchaseAlreadyCompletedException extends common_1.ConflictException {
    constructor() {
        super('Purchase already completed');
    }
}
exports.PurchaseAlreadyCompletedException = PurchaseAlreadyCompletedException;
//# sourceMappingURL=purchase-already-completed.exception.js.map