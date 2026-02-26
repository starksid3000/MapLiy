import { Controller, Get, Query, Post, Body, Delete, Param } from '@nestjs/common';
import { PlacesService, NearbyPlace } from './places.service';

@Controller('places')
export class PlacesController {
    constructor(private readonly placesService: PlacesService) { }

    /**
     * GET /places/nearby?latitude=..&longitude=..&radius=..
     */
    @Get('nearby')
    async getNearby(
        @Query('latitude') latitude: string,
        @Query('longitude') longitude: string,
        @Query('radius') radius?: string,
    ): Promise<NearbyPlace[]> {
        return this.placesService.findNearbyPlaces(
            parseFloat(latitude),
            parseFloat(longitude),
            radius ? parseFloat(radius) : 5000,
        );
    }

    /**
     * GET /places/all
     */
    @Get('all')
    async getAllPlaces() {
        return this.placesService.findAll();
    }

    /**
     * POST /places
     * Body: { name: string, latitude: number, longitude: number }
     */
    @Post()
    async createPlace(
        @Body('name') name: string,
        @Body('latitude') latitude: number,
        @Body('longitude') longitude: number,
    ) {
        return this.placesService.createPlace(name, latitude, longitude);
    }

    // Add this inside the class
    /**
     * DELETE /places/:id
     */
    @Delete(':id')
    async deletePlace(@Param('id') id: string) {
        return this.placesService.deletePlace(id);
    }
}