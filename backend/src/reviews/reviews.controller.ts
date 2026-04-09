import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { QueryReviewsDto } from './dto/query-reviews.dto';

@Controller('products/:id/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  /** Đăng ký trước route `list` để `/reviews/summary` không bị nhầm với list */
  @Get('summary')
  summary(@Param('id') productId: string) {
    return this.reviewsService.summary(+productId);
  }

  @Get()
  list(@Param('id') productId: string, @Query() query: QueryReviewsDto) {
    return this.reviewsService.listByProduct(+productId, query);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  upsertMy(
    @CurrentUser() user,
    @Param('id') productId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.upsertMyReview(
      user.id as number,
      +productId,
      dto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMy(
    @CurrentUser() user,
    @Param('id') productId: string,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviewsService.updateMyReview(
      user.id as number,
      +productId,
      dto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me')
  deleteMy(@CurrentUser() user, @Param('id') productId: string) {
    return this.reviewsService.deleteMyReview(user.id as number, +productId);
  }
}
