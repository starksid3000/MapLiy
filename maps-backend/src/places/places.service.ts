import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';

@Injectable()
export class PlacesService {
    constructor(private prisma: PrismaService) { }

    create(createPlaceDto: CreatePlaceDto) {
        return this.prisma.place.create({
            data: createPlaceDto,
        });
    }

    findAll() {
        return this.prisma.place.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id: number) {
        const place = await this.prisma.place.findUnique({
            where: { id }
        })
        if (!place) {
            throw new NotFoundException(`Place with ID ${id} not found`);
        }
        return place;
    }
    async remove(id: number) {
        const place = await this.prisma.place.delete({
            where: { id },
        });
        if (!place) {
            throw new NotFoundException(`Place with ID ${id} not found`);
        }
        return place;
    }
    async update(id: number, updatePlaceDto: UpdatePlaceDto) {
        const place = await this.prisma.place.findUnique({
            where: { id },
        });

        if (!place) {
            throw new NotFoundException(`Place with id ${id} not found`);
        }

        if (Object.keys(updatePlaceDto).length === 0) {
            throw new BadRequestException('No fields provided for update');
        }

        return this.prisma.place.update({
            where: { id },
            data: updatePlaceDto,
        });
    }
}