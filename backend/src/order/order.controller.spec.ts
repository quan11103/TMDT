import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';

describe('OrderController', () => {
  let controller: OrderController;

  const mockOrderService = {
    previewCheckout: jest.fn(),
    createOrderDto: jest.fn(),
    getMyOrders: jest.fn(),
    getMyOrderDetail: jest.fn(),
    cancelOrder: jest.fn(),
    getAllOrders: jest.fn(),
    findOrderById: jest.fn(),
    updateOrderStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [{ provide: OrderService, useValue: mockOrderService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<OrderController>(OrderController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
