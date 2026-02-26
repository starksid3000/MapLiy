import { Controller, Query, Get, Post, Body, Delete, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { PlacesService } from './places.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { PaginationDto } from './dto/pagination.dto';
import { NearbyDto } from './dto/nearby.dto';
@Controller('places')
export class PlacesController {
    constructor(private readonly placesService: PlacesService) { }
    @Get('nearby')
    findNearby(@Query() nearbyDto: NearbyDto) {
        return this.placesService.findNearby(nearbyDto);
    }
    @Post()
    create(@Body() createPlaceDto: CreatePlaceDto) {
        return this.placesService.create(createPlaceDto);
    }
    @Get()
    findAll(@Query() paginationDto: PaginationDto) {
        return this.placesService.findAll(paginationDto);
    }
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: string) {
        return this.placesService.remove(+id);
    }
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string) {
        return this.placesService.findOne(+id);
    }
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: string, @Body() updatePlaceDto: UpdatePlaceDto) {
        return this.placesService.update(+id, updatePlaceDto);
    }
}