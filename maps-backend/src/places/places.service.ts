import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { PaginationDto } from './dto/pagination.dto';
@Injectable()
export class PlacesService {
    constructor(private prisma: PrismaService) { }

    create(createPlaceDto: CreatePlaceDto) {
        return this.prisma.place.create({
            data: createPlaceDto,
        });
    }

    async findAll(paginationDto: PaginationDto) {
        const { page, limit } = paginationDto;

        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.prisma.place.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.place.count(),
        ]);

        return {
            data,
            meta: {
                total,
                page,
                lastPage: Math.ceil(total / limit),
            },
        };
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