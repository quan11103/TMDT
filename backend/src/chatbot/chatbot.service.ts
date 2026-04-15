import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  APIError,
  ChatStatus,
  CozeAPI,
  COZE_CN_BASE_URL,
  COZE_COM_BASE_URL,
  RoleType,
} from '@coze/api';
import type { ChatV3Message, EnterMessage } from '@coze/api';
import { ChatbotMessageDto } from './dto/chatbot-message.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductsService } from 'src/products/products.service';

type SuggestedProduct = {
  id: number;
  name: string;
  slug: string;
  price: string;
  stock: number;
  categoryName: string;
  imageUrl: string | null;
};

type ProductSearchRow = {
  id: number;
  name: string;
  slug: string;
  price: { toString(): string } | string | number;
  stock: number;
  categories?: { name?: string | null } | null;
  product_images?: Array<{ image_url: string }>;
};

const VIETNAMESE_REPLY_INSTRUCTION =
  'Hãy luôn trả lời bằng tiếng Việt tự nhiên, rõ ràng và dễ hiểu. ' +
  'Không đổi sang ngôn ngữ khác nếu người dùng không yêu cầu.';

function resolveCozeBaseUrl(raw?: string): string {
  const v = raw?.trim();
  if (!v) return COZE_COM_BASE_URL;
  if (v === 'cn' || v === 'COZE_CN') return COZE_CN_BASE_URL;
  if (v === 'com' || v === 'COZE_COM') return COZE_COM_BASE_URL;
  return v;
}

function tokenize(text: string): string[] {
  return text
    .trim()
    .split(/\s+/)
    .map((v) => v.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function extractSearchKeywords(text: string): string[] {
  const stopwords = new Set([
    'la',
    'là',
    'co',
    'có',
    'khong',
    'không',
    'toi',
    'tôi',
    'minh',
    'mình',
    'ban',
    'bạn',
    'cho',
    'xin',
    'hoi',
    'hỏi',
    've',
    'về',
    'san',
    'sản',
    'pham',
    'phẩm',
    'thi',
    'thì',
    'sao',
    'nao',
    'nào',
    'voi',
    'với',
    'duoc',
    'được',
    'khong',
    'nhu',
    'như',
    'the',
    'thế',
  ]);

  const normalized = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const words = tokenize(normalized).filter(
    (w) => w.length >= 2 && !stopwords.has(w),
  );
  return Array.from(new Set(words)).slice(0, 8);
}

function normalizeContextSize(text: string, maxLength = 4000): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}\n... (đã rút gọn ngữ cảnh)`;
}

function buildVietnamesePromptContent(
  userMessage: string,
  storeContext: string,
): string {
  return [
    VIETNAMESE_REPLY_INSTRUCTION,
    'Chỉ dùng dữ liệu trong mục "NGU CANH CUA HANG" để trả lời.',
    'Nếu không có dữ liệu liên quan, hãy nói rõ "Hiện tôi chưa có dữ liệu phù hợp trong hệ thống".',
    '',
    'NGU CANH CUA HANG:',
    storeContext,
    '',
    `Câu hỏi người dùng: ${userMessage}`,
  ].join('\n');
}

function toEnterMessages(dto: ChatbotMessageDto): EnterMessage[] {
  const out: EnterMessage[] = [];
  const history = dto.history ?? [];
  for (const h of history) {
    out.push({
      role: h.role === 'user' ? RoleType.User : RoleType.Assistant,
      content: h.content,
      content_type: 'text',
    });
  }
  out.push({
    role: RoleType.User,
    content: dto.message,
    content_type: 'text',
  });
  return out;
}

/** Khi đã có conversation Coze, chỉ gửi tin nhắn user mới nhất. */
function toSingleUserMessage(dto: ChatbotMessageDto): EnterMessage[] {
  return [
    {
      role: RoleType.User,
      content: dto.message,
      content_type: 'text',
    },
  ];
}

function extractAssistantReply(messages: ChatV3Message[] | undefined): string {
  if (!messages?.length) return '';
  const answers = messages.filter(
    (m) => m.role === RoleType.Assistant && m.type === 'answer',
  );
  const parts = (
    answers.length
      ? answers
      : messages.filter((m) => m.role === RoleType.Assistant)
  )
    .map((m) => (typeof m.content === 'string' ? m.content : ''))
    .filter(Boolean);
  return parts.join('\n').trim();
}

@Injectable()
export class ChatbotService {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly productsService: ProductsService,
  ) {}

  private async buildStoreContext(userMessage: string): Promise<{
    context: string;
    products: SuggestedProduct[];
  }> {
    const keywords = extractSearchKeywords(userMessage);
    const search =
      keywords.length > 0 ? keywords.join(' ') : userMessage.trim();
    const productResult = await this.productsService.findAll({
      search,
      page: 1,
      limit: 8,
      sort: 'newest',
    });
    const productRows = (
      Array.isArray((productResult as { data?: unknown[] }).data)
        ? (productResult as { data: unknown[] }).data
        : []
    ) as ProductSearchRow[];

    const activePromotions = await this.prisma.promotions.findMany({
      where: {
        is_active: true,
        starts_at: { lte: new Date() },
        ends_at: { gte: new Date() },
      },
      select: {
        code: true,
        discount_type: true,
        discount_value: true,
        product_scope: true,
        ends_at: true,
      },
      orderBy: { created_at: 'desc' },
      take: 5,
    });

    const suggestedProducts: SuggestedProduct[] = productRows.map((p) => {
      return {
        id: p.id,
        name: p.name,
        slug: p.slug ?? '',
        price: String(p.price),
        stock: p.stock,
        categoryName: p.categories?.name ?? 'N/A',
        imageUrl: p.product_images?.[0]?.image_url ?? null,
      };
    });

    const productBlock =
      suggestedProducts.length === 0
        ? '- Không tìm thấy sản phẩm liên quan trực tiếp trong DB.'
        : suggestedProducts
            .map(
              (p) =>
                `- [#${p.id}] ${p.name} | Giá: ${p.price} | Tồn kho: ${p.stock} | Danh mục: ${p.categoryName}`,
            )
            .join('\n');

    const promoBlock =
      activePromotions.length === 0
        ? '- Hiện không có mã giảm giá đang hoạt động.'
        : activePromotions
            .map(
              (x) =>
                `- Mã ${x.code} | Kiểu: ${x.discount_type} | Giá trị: ${x.discount_value.toString()} | Phạm vi: ${x.product_scope} | Hết hạn: ${x.ends_at.toISOString()}`,
            )
            .join('\n');

    const rawContext = [
      '[SAN PHAM LIEN QUAN]',
      productBlock,
      '',
      '[KHUYEN MAI DANG HOAT DONG]',
      promoBlock,
    ].join('\n');

    return {
      context: normalizeContextSize(rawContext),
      products: suggestedProducts.slice(0, 4),
    };
  }

  async reply(dto: ChatbotMessageDto): Promise<{
    reply: string;
    conversationId: string;
    products: SuggestedProduct[];
  }> {
    const token = this.config.get<string>('COZE_API_TOKEN')?.trim();
    const botId = this.config.get<string>('COZE_BOT_ID')?.trim();
    if (!token || !botId) {
      throw new ServiceUnavailableException(
        'Chatbot Coze chưa cấu hình (COZE_API_TOKEN, COZE_BOT_ID).',
      );
    }

    const baseURL = resolveCozeBaseUrl(
      this.config.get<string>('COZE_BASE_URL'),
    );
    const userId =
      dto.userId?.trim() ||
      this.config.get<string>('COZE_DEFAULT_USER_ID') ||
      'anonymous';

    const client = new CozeAPI({ token, baseURL });
    const { context: storeContext, products: suggestedProducts } =
      await this.buildStoreContext(dto.message);
    const promptMessage = buildVietnamesePromptContent(
      dto.message,
      storeContext,
    );

    const additional_messages = dto.conversationId
      ? toSingleUserMessage({ ...dto, message: promptMessage })
      : toEnterMessages({ ...dto, message: promptMessage });

    try {
      const result = await client.chat.createAndPoll({
        bot_id: botId,
        user_id: userId,
        conversation_id: dto.conversationId || undefined,
        additional_messages,
        auto_save_history: true,
      });

      const { chat, messages } = result;

      if (chat.status === ChatStatus.FAILED) {
        const errMsg = chat.last_error?.msg || 'Coze chat failed';
        throw new ServiceUnavailableException(errMsg);
      }

      if (chat.status !== ChatStatus.COMPLETED) {
        throw new ServiceUnavailableException(
          `Trạng thái Coze không hoàn tất: ${chat.status}`,
        );
      }

      const text = extractAssistantReply(messages);
      if (!text) {
        throw new ServiceUnavailableException(
          'Bot không trả lời nội dung (kiểm tra bot đã publish và PAT có quyền).',
        );
      }

      return {
        reply: text,
        conversationId: chat.conversation_id,
        products: suggestedProducts,
      };
    } catch (e) {
      if (e instanceof ServiceUnavailableException) throw e;
      if (e instanceof APIError) {
        throw new ServiceUnavailableException(e.message || 'Lỗi API Coze');
      }
      const msg = e instanceof Error ? e.message : 'Lỗi không xác định';
      throw new ServiceUnavailableException(`Chatbot Coze: ${msg}`);
    }
  }
}
