import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.users.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        full_name: dto.full_name,
        role_id: dto.role_id,
      },
    });

    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role_id: user.role_id,
      created_at: user.created_at,
    };
  }

  async findAll() {
    return this.prisma.users.findMany({
      select: {
        id: true,
        email: true,
        full_name: true,
        created_at: true,
      },
    });
  }
}
