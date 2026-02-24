import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorater';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Lấy permission yêu cầu
    const requiredPermissions = this.reflector.get<string[]>(
      PERMISSIONS_KEY,
      context.getHandler(),
    );

    if (!requiredPermissions || requiredPermissions.length === 0) return true;

    //2. Lấy user từ JWT
    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (!user || !user.role_id) {
      throw new ForbiddenException('No role assigned');
    }

    // Lấy permissions từ user
    const rolePermissions = await this.prisma.role_permission.findMany({
      where: { role_id: user.role_id },
      include: { permissions: true },
    });

    const userPermissions = rolePermissions.map((rp) => rp.permissions.name);

    const hasPermission = requiredPermissions.every((p) =>
      userPermissions.includes(p),
    );

    if (!hasPermission) {
      throw new ForbiddenException('Permission denied');
    }

    return true;
  }
}
