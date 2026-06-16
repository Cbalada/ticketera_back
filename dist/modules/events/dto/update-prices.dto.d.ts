import { Sector } from '../../../common/enums/sector.enum';
export declare class SectorPriceDto {
    sector: Sector;
    price: number;
}
export declare class UpdatePricesDto {
    prices: SectorPriceDto[];
}
