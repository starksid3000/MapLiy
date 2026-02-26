import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface NearbyPlace {
    id: string;
    name: string;
    distance: number;
}

@Injectable()
export class PlacesService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Create a place with latitude and longitude
     */
    async createPlace(name: string, latitude: number, longitude: number) {
        await this.prisma.$executeRaw`
      INSERT INTO "Place"(id, name, location, "createdAt")
      VALUES (
        gen_random_uuid(),
        ${name},
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326),
        NOW()
      )
    `;
        return { success: true };
    }

    /**
     * Get all places (with lat/lng extracted)
     */
    async findAll() {
        const places = await this.prisma.$queryRaw`
      SELECT 
        id,
        name,
        ST_X(location::geometry) AS longitude,
        ST_Y(location::geometry) AS latitude,
        "createdAt"
      FROM "Place"
    `;
        return places;
    }

    /**
     * Find nearby places within a radius (meters)
     */
    async findNearbyPlaces(
        latitude: number,
        longitude: number,
        radius = 5000,
    ): Promise<NearbyPlace[]> {
        const places = await this.prisma.$queryRaw<{
            id: string;
            name: string;
            distance: string;
        }[]>`
      SELECT 
        id,
        name,
        ST_Distance(
          location,
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
        )::double precision AS distance
      FROM "Place"
      WHERE ST_DWithin(
        location,
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326),
        ${radius}
      )
      ORDER BY distance
    `;

        // Convert distance to number
        return places.map((p) => ({
            id: p.id,
            name: p.name,
            distance: Number(p.distance),
        }));
    }
    async deletePlace(id: string) {
        const result = await this.prisma.$executeRaw`
      DELETE FROM "Place" WHERE id = ${id}
    `;
        if (result === 0) {
            throw new NotFoundException(`Place with ID ${id} not found`);
        }
        return { success: true };
    }
    
}