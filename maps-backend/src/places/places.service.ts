import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlaceDto } from './dto/create-place.dto';

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
}