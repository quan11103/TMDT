import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

describe('ReviewsController', () => {
  let controller: ReviewsController;

  const mockService = {
    listByProduct: jest.fn(),
    summary: jest.fn(),
    upsertMyReview: jest.fn(),
    updateMyReview: jest.fn(),
    deleteMyReview: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewsController],
      providers: [{ provide: ReviewsService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ReviewsController>(ReviewsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
