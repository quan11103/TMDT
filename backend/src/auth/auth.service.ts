import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { createHash, randomBytes } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import moment from 'moment';
import { ForgotPasswordDto } from './dto/forgot_password_dto';
import { EmailService } from 'src/email/email.service';
import { ResetPasswordDto } from './dto/reset_password_dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private email: EmailService,
  ) { }

  async oauthLogin(profile: {
    email: string | null;
    full_name: string;
    provider: string;
  }) {
    if (!profile.email) {
      throw new BadRequestException(
        `Không lấy được email từ ${profile.provider}`,
      );
    }

    let user = await this.prisma.users.findUnique({
      where: { email: profile.email },
    });

    if (!user) {
      const customerRole = await this.prisma.roles.findUnique({
        where: { role: 'customer' },
      });

      if (!customerRole) {
        throw new InternalServerErrorException('Không tồn tại role này');
      }

      const randomPassword = randomBytes(32).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await this.prisma.users.create({
        data: {
          email: profile.email ?? null,
          full_name: profile.full_name,
          password: hashedPassword,
          role_id: customerRole.id,
        },
      });
    }

    if (!user.is_active) {
      throw new BadRequestException('Tài khoản này đã bị khóa');
    }

    const payload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = await this.jwt.signAsync(payload);

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
      },
    };
  }

  async login(dto: LoginDto) {
    // 1. Tìm user kèm theo thông tin role
    const user = await this.prisma.users.findUnique({
      where: { email: dto.email },
      include: {
        roles: true, // Join với bảng roles để lấy tên role (admin/customer)
      },
    });

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu sai');
    }

    if (!user.is_active)
      throw new UnauthorizedException('Tài khoản đã bị khóa');

    // 2. So sánh password
    const isMatch = await bcrypt.compare(dto.password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Email hoặc mật khẩu sai');
    }

    // 3. Chuẩn bị payload cho JWT
    // Thêm role vào payload để các Guard ở Backend có thể kiểm tra quyền sau này
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.roles.role, // Ví dụ: "admin" hoặc "customer"
    };

    const accessToken = await this.jwt.signAsync(payload);

    // 4. Trả về token và thông tin user cho Frontend
    return {
      access_token: accessToken,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.roles.role, // Trả về role để Frontend (LoginCard) dùng để navigate
      },
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
        dob: dto.dob ? new Date(dto.dob) : null,
        phone: dto.phone,
        gender: dto.gender,
      },
    });

    return {
      id: newUser.id,
      email: newUser.email,
      full_name: newUser.full_name,
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const hasEmail = await this.prisma.users.findUnique({
      where: { email: dto.email },
      select: { id: true, email: true },
    });

    if (!hasEmail) {
      throw new NotFoundException('Email không tồn tại');
    }

    const token = randomBytes(32).toString('hex');

    const tokenHash = createHash('sha256').update(token).digest('hex');

    const expiredAt = moment()
      .add(this.config.getOrThrow('RESET_TOKEN_TTL_MINUTES'), 'minutes')
      .toDate();

    await this.prisma.reset_password_tokens.create({
      data: {
        token_hash: tokenHash,
        expired_at: expiredAt,
        user_id: hasEmail.id,
      },
    });

    const resetLink = `${this.config.getOrThrow('FRONTEND_URL')}?token=${token}`;
    await this.email.sendPasswordResetEmail(hasEmail.email, resetLink);

    return {
      message: 'Kiểm tra email',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = createHash('sha256').update(dto.token).digest('hex');
    const resetPassword = await this.prisma.reset_password_tokens.findFirst({
      where: {
        token_hash: tokenHash,
        expired_at: { gte: new Date() },
      },
    });

    if (!resetPassword) {
      throw new BadRequestException('Token không đúng hoặc đã hết hạn');
    }

    return this.prisma.$transaction(async (tx) => {
      const hashedPassword = await bcrypt.hash(dto.new_password, 10);
      await tx.users.update({
        where: { id: resetPassword.user_id },
        data: {
          password: hashedPassword,
        },
      });

      await tx.reset_password_tokens.deleteMany({
        where: { user_id: resetPassword.user_id },
      });

      return {
        message: 'Đặt lại mật khẩu thành công',
      };
    });
  }
}
