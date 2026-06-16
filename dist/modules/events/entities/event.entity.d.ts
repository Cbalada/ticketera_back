import { EventSector } from './event-sector.entity';
export declare class Event {
    id: number;
    title: string;
    description: string;
    imageUrl: string;
    date: Date;
    sectors: EventSector[];
    createdAt: Date;
    updatedAt: Date;
}
