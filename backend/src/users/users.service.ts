import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { users } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Tạo user mới
  async create(dto: CreateUserDto) {
    const existingEmail = await this.prisma.users.findUnique({
      where: { email: dto.email },
    });

    if (existingEmail) throw new ConflictException('Email đã tồn tại');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.users.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        full_name: dto.full_name,
        dob: dto.dob ? new Date(dto.dob) : null,
        phone: dto.phone,
        gender: dto.gender,
        role_id: dto.role_id,
      },
    });

    return this.excludePassword(user);
  }

  // Admin tìm tất cả user
  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.users.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          full_name: true,
          phone: true,
          is_active: true,
          created_at: true,
          roles: { select: { role: true } },
          _count: { select: { orders: true } },
        },
      }),
      this.prisma.users.count(),
    ]);

    return [data, total, page, limit];
  }

  // Tìm người dùng theo id
  async findOne(id: number) {
    const user = await this.prisma.users.findUnique({
      where: { id: id },
      select: {
        id: true,
        email: true,
        full_name: true,
        phone: true,
        dob: true,
        gender: true,
        created_at: true,
        updated_at: true,
        is_active: true,
        roles: { select: { role: true } },
        _count: { select: { orders: true } },
      },
    });

    if (!user) throw new NotFoundException(`Không tìm thấy user id ${id}`);

    return user;
  }

  // Update thông tin người dùng
  async updateUser(id: number, dto: UpdateUserDto) {
    // Kiểm tra user có tồn tại
    await this.findOne(id);

    const data: {
      full_name?: string | null;
      is_active?: boolean;
      phone?: string | null;
      gender?: string | null;
      dob?: Date | null;
    } = {};

    if (dto.full_name !== undefined) data.full_name = dto.full_name;
    if (dto.is_active !== undefined) data.is_active = dto.is_active;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.gender !== undefined) data.gender = dto.gender;
    if (dto.dob !== undefined) {
      data.dob = dto.dob ? new Date(dto.dob) : null;
    }

    const updated = await this.prisma.users.update({
      where: { id },
      data,
      select: {
        id: true,
        full_name: true,
        email: true,
        phone: true,
        gender: true,
        dob: true,
        is_active: true,
        updated_at: true,
      },
    });

    return updated;
  }

  // Đổi mật khẩu người dùng
  async changePassword(id: number, dto: ChangePasswordDto) {
    // Lấy user kèm password để so sánh
    const user = await this.prisma.users.findUnique({
      where: { id: id },
    });

    if (!user) throw new NotFoundException('Người dùng không tồn tại');

    // Kiểm tra mật khẩu hiện tại có đúng không
    const isMatch = await bcrypt.compare(dto.current_password, user.password);
    if (!isMatch) throw new BadRequestException('Mật khẩu hiện tại không đúng');

    // Kiểm tra mật khẩu mới có trùng với mật khẩu cũ không
    const isSame = await bcrypt.compare(dto.new_password, user.password);
    if (isSame)
      throw new BadRequestException(
        'Mật khẩu mới không được trùng với mật khẩu cũ',
      );

    // Hash và lưu lại mật khẩu mới
    const hashedPassword = await bcrypt.hash(dto.new_password, 10);

    await this.prisma.users.update({
      where: { id },
      data: {
        password: hashedPassword,
      },
    });

    return { message: 'Đổi mật khẩu thành công' };
  }

  // Xóa người dùng
  async removeUser(id: number) {
    // Kiểm tra user có tồn tại không ?
    await this.findOne(id);

    await this.prisma.users.delete({
      where: { id },
    });

    return { message: `Đã xóa user ${id}` };
  }

  // Helper loại bỏ password mỗi khi trả về
  private excludePassword(user: users) {
    const { password, ...rest } = user;
    return rest;
  }
}
