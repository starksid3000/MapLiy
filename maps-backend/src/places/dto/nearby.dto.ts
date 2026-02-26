import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class NearbyDto {
    @Type(() => Number)
    @IsNumber()
    lat: number;

    @Type(() => Number)
    @IsNumber()
    lng: number;

    @Type(() => Number)
    @IsNumber()
    radius: number; // in kilometers
}