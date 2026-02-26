import { IsString, IsNumber } from 'class-validator';

export class CreatePlaceDto {
    @IsString()
    name: string;

    @IsNumber()
    latitude: number;

    @IsNumber()
    longitude: number;
}