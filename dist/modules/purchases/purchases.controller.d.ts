import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { PurchasesService } from './purchases.service';
export declare class PurchasesController {
    private readonly purchases;
    constructor(purchases: PurchasesService);
    create(user: JwtPayload, dto: CreatePurchaseDto): Promise<import("./entities/purchase.entity").Purchase>;
}
