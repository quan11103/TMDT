import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(dto: LoginDto) {
    // 1. tìm user theo email
    const user = await this.prisma.users.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu sai');
    }

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
    };
  }
}
