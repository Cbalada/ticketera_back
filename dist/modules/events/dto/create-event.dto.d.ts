import { CreateEventSectorDto } from './create-event-sector.dto';
export declare class CreateEventDto {
    title: string;
    description: string;
    imageUrl: string;
    date: string;
    sectors: CreateEventSectorDto[];
}
