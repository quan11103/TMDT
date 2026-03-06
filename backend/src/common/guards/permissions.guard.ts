import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../../common/decorators/permissions.decorator';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class PermissionsGuard implements CanActivate {
  // Cache lưu trong RAM - key: role_id, value: mảng permissions
  private permissionCache = new Map<number, string[]>();

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
      throw new ForbiddenException('Không có role nào được giao');
    }

    // Lấy permissions từ user với kiểm tra cache để tránh n + 1 query problem
    if (!this.permissionCache.has(user.role_id as number)) {
      // Chỉ query DB khi chưa có trong cache
      const rolesPermissions = await this.prisma.role_permission.findMany({
        where: { role_id: user.role_id },
        select: { permissions: true },
      });

      const permissions = rolesPermissions.map((rp) => rp.permissions.name);
      this.permissionCache.set(user.role_id as number, permissions);
    }

    const userPermissions = this.permissionCache.get(user.role_id as number);

    if (!userPermissions)
      throw new ForbiddenException('Không tìm thấy quyền cho role này');

    const hasPermission = requiredPermissions.every((p) =>
      userPermissions.includes(p),
    );

    if (!hasPermission) throw new ForbiddenException('Quyền bị từ chối');

    return true;
  }

  //Gọi hàm này khi admin thay đổi permissions
  clearCache(roleId?: number) {
    if (roleId) {
      this.permissionCache.delete(roleId);
    } else {
      this.permissionCache.clear();
    }
  }
}
