"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePricesDto = exports.SectorPriceDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const sector_enum_1 = require("../../../common/enums/sector.enum");
class SectorPriceDto {
}
exports.SectorPriceDto = SectorPriceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: sector_enum_1.Sector }),
    (0, class_validator_1.IsEnum)(sector_enum_1.Sector),
    __metadata("design:type", String)
], SectorPriceDto.prototype, "sector", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 45000 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], SectorPriceDto.prototype, "price", void 0);
class UpdatePricesDto {
}
exports.UpdatePricesDto = UpdatePricesDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [SectorPriceDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SectorPriceDto),
    __metadata("design:type", Array)
], UpdatePricesDto.prototype, "prices", void 0);
//# sourceMappingURL=update-prices.dto.js.map