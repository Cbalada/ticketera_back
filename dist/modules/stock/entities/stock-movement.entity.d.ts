import { StockMovementType } from '../../../common/enums/stock-movement-type.enum';
import { EventSector } from '../../events/entities/event-sector.entity';
export declare class StockMovement {
    id: number;
    eventSectorId: number;
    eventSector: EventSector;
    type: StockMovementType;
    quantity: number;
    createdAt: Date;
}
