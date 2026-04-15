import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class ChatHistoryMessageDto {
  @IsIn(['user', 'assistant'])
  role: 'user' | 'assistant';

  @IsString()
  content: string;
}

export class ChatbotMessageDto {
  @IsString()
  message: string;

  /** Lịch sử phía client (OpenAI-style). Dùng khi chưa có conversationId từ Coze. */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatHistoryMessageDto)
  history?: ChatHistoryMessageDto[];

  /** Trả về từ lần gọi trước để tiếp tục cùng session Coze. */
  @IsOptional()
  @IsString()
  conversationId?: string;

  /** Định danh người dùng phía Coze (khuyến nghị ổn định theo phiên/tài khoản). */
  @IsOptional()
  @IsString()
  userId?: string;
}
