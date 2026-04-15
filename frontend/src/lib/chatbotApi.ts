import axios from 'axios';

const API = 'http://localhost:3000/api';

export type ChatbotProduct = {
  id: number;
  name: string;
  slug: string;
  price: string;
  stock: number;
  categoryName: string;
  imageUrl: string | null;
};

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  products?: ChatbotProduct[];
};

export type ChatbotSendPayload = {
  message: string;
  history: ChatMessage[];
  conversationId?: string;
  userId?: string;
};

export type ChatbotSendResponse = {
  reply: string;
  conversationId: string;
  products?: ChatbotProduct[];
};

function getOrCreateUserId(): string {
  const key = 'coze_chat_user_id';
  let id = localStorage.getItem(key);
  if (!id) {
    id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `u_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(key, id);
  }
  return id;
}

export async function sendChatbotMessage(
  payload: ChatbotSendPayload,
): Promise<ChatbotSendResponse> {
  const { data } = await axios.post<ChatbotSendResponse>(
    `${API}/chatbot/message`,
    {
      message: payload.message,
      history: payload.history,
      conversationId: payload.conversationId,
      userId: payload.userId ?? getOrCreateUserId(),
    },
    { timeout: 120_000 },
  );
  return data;
}
