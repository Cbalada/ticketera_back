import { DataSource } from 'typeorm';
import { RealtimeService } from '../realtime/realtime.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { Purchase } from './entities/purchase.entity';
export declare class PurchasesService {
    private readonly dataSource;
    private readonly realtime;
    constructor(dataSource: DataSource, realtime: RealtimeService);
    create(userId: number, dto: CreatePurchaseDto): Promise<Purchase>;
}
