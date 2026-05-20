import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class CartService {
  constructor(
    private prisma: PrismaService,
    private productsService: ProductsService,
  ) {}

  async addToCart(userId: number, dto: AddToCartDto) {
    const product = await this.prisma.products.findUnique({
      where: { id: dto.product_id },
    });

    if (!product || !product.is_active)
      throw new NotFoundException('Sản phẩm không tồn tại');

    const exsitingItem = await this.prisma.cart_items.findUnique({
      where: {
        user_id_product_id: {
          user_id: userId,
          product_id: dto.product_id,
        },
      },
    });

    if (exsitingItem) {
      const newQuantity = exsitingItem.quantity + dto.quantity;

      if (newQuantity > product.stock)
        throw new BadRequestException(
          `Chỉ còn ${product.stock} sản phẩm trong kho`,
        );

      return this.prisma.cart_items.update({
        where: { id: exsitingItem.id },
        data: { quantity: newQuantity },
        include: {
          products: { select: { id: true, name: true, price: true } },
        },
      });
    }

    if (dto.quantity > product.stock)
      throw new BadRequestException(
        `Chỉ còn ${product.stock} sản phẩm trong kho`,
      );

    return this.prisma.cart_items.create({
      data: {
        user_id: userId,
        product_id: dto.product_id,
        quantity: dto.quantity,
      },
      include: { products: { select: { id: true, name: true, price: true } } },
    });
  }

  async getMyCart(userId: number) {
    const items = await this.prisma.cart_items.findMany({
      where: { user_id: userId },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            price: true,
            stock: true,
            category_id: true,
            product_images: {
              where: { is_main: true },
              select: { image_url: true },
              take: 1,
            },
          },
        },
      },
    });

    // Apply sales to products
    const productsWithSale = await this.productsService.applySalesToProducts(
      items.map((item) => item.products),
    );

    // Map products back into items and compute totalAmount
    const itemsWithSale = items.map((item, index) => {
      return {
        ...item,
        products: productsWithSale[index],
      };
    });

    const totalAmount = itemsWithSale.reduce((sum, item) => {
      return sum + Number(item.products.sale_price) * item.quantity;
    }, 0);

    return {
      items: itemsWithSale,
      totalAmount,
      totalItems: itemsWithSale.length,
    };
  }

  async updateItem(userId: number, itemId: number, dto: UpdateCartDto) {
    const item = await this.prisma.cart_items.findUnique({
      where: { id: itemId },
      include: {
        products: { select: { stock: true, is_active: true } },
      },
    });

    if (!item) throw new NotFoundException('Không tìm thấy sản phẩm trong giỏ');

    if (item.user_id !== userId)
      throw new ForbiddenException('Bạn không có quyền thực hiện thao tác này');

    if (item.products.stock < dto.quantity)
      throw new BadRequestException(
        `Sản phẩm chỉ còn lại ${item.products.stock}`,
      );

    return this.prisma.cart_items.update({
      where: { id: item.id },
      data: { quantity: dto.quantity },
      include: { products: { select: { name: true, price: true } } },
    });
  }

  async removeItem(userId: number, itemId: number) {
    const item = await this.prisma.cart_items.findUnique({
      where: { id: itemId },
      include: { products: { select: { name: true } } },
    });

    if (!item)
      throw new NotFoundException('Không xuất hiện item này trong giỏ hàng');

    if (item.user_id !== userId)
      throw new ForbiddenException('Người dùng không có quyền xóa item');

    await this.prisma.cart_items.delete({
      where: { id: itemId },
    });
    return {
      message: `Đã xóa thành công ${item.products.name} ra khỏi giỏ hàng`,
    };
  }

  async clearCart(userId: number) {
    const items = await this.prisma.cart_items.deleteMany({
      where: { user_id: userId },
    });

    return { message: `Đã xóa ${items.count} sản phẩm ra khỏi giỏ hàng ` };
  }

  async clearCartAfterOrder(userId: number) {
    return this.prisma.cart_items.deleteMany({
      where: { user_id: userId },
    });
  }
}
