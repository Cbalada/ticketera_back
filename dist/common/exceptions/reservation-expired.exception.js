"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationExpiredException = void 0;
const common_1 = require("@nestjs/common");
class ReservationExpiredException extends common_1.BadRequestException {
    constructor() {
        super('Reservation expired');
    }
}
exports.ReservationExpiredException = ReservationExpiredException;
//# sourceMappingURL=reservation-expired.exception.js.map