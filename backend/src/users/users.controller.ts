import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // -----USER ROUTES---------------------------------------

  // GET/users/me lấy thông tin bản thân
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMyInformation(@CurrentUser() me) {
    console.log(me.id);
    return this.usersService.findOne(me.id as number);
  }

  // PATCH/users/me cập nhật thông tin bản thân
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMyInformation(@CurrentUser() me, @Body() dto: UpdateUserDto) {
    return this.usersService.updateUser(me.id as number, dto);
  }

  // PATCH/users/me/password đổi mật khẩu
  @UseGuards(JwtAuthGuard)
  @Patch('me/password')
  changePassword(@CurrentUser() me, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(me.id as number, dto);
  }

  // -----ADMIN ROUTES--------------------------------------

  // GET/users lấy danh sách tất cả users
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('user.read')
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // GET/users/:id lấy thông tin user theo id
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('user.read')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  // POST/users admin tạo user
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('user.create')
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  // PATCH/users/:id admin cập nhật thông tin user
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('user.update')
  @Patch(':id')
  updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.updateUser(+id, dto);
  }

  // DELETE/users/:id admin xóa user
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('user.delete')
  @Delete(':id')
  removeUser(@Param('id') id: string) {
    return this.usersService.removeUser(+id);
  }
}
