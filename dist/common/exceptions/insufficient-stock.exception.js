"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsufficientStockException = void 0;
const common_1 = require("@nestjs/common");
class InsufficientStockException extends common_1.ConflictException {
    constructor() {
        super('Insufficient stock');
    }
}
exports.InsufficientStockException = InsufficientStockException;
//# sourceMappingURL=insufficient-stock.exception.js.map