import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) { }

  async login(dto: LoginDto) {
    // 1. tìm user theo email
    const user = await this.prisma.users.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu sai');
    }

    if (!user.is_active)
      throw new UnauthorizedException('Tài khoản đã bị khóa');

    // 2. so sánh password
    const isMatch = await bcrypt.compare(dto.password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Email hoặc mật khẩu sai');
    }

    //sign JWT
    const payload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = await this.jwt.signAsync(payload);

    //3. trả user
    return {
      access_token: accessToken,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email
      }
    };
  }

  async register(dto: RegisterDto) {
    // 1. Kiểm tra email đã tồn tại chưa
    const existingEmail = await this.prisma.users.findUnique({
      where: { email: dto.email },
    });

    if (existingEmail) throw new ConflictException('Email đã tồn tại');

    const userRole = await this.prisma.roles.findUnique({
      where: { role: 'customer' },
    });

    if (!userRole) throw new InternalServerErrorException('Role không tồn tại');

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 3. Tạo user mới
    const newUser = await this.prisma.users.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        full_name: dto.full_name,
        role_id: userRole.id,
      },
    });

    return {
      id: newUser.id,
      email: newUser.email,
      full_name: newUser.full_name,
    };
  }
}
