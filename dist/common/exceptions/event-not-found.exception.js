"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventNotFoundException = void 0;
const common_1 = require("@nestjs/common");
class EventNotFoundException extends common_1.NotFoundException {
    constructor() {
        super('Event not found');
    }
}
exports.EventNotFoundException = EventNotFoundException;
//# sourceMappingURL=event-not-found.exception.js.map