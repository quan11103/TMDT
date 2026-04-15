import React, { useCallback, useState } from 'react';
import axios from 'axios';
import { sendChatbotMessage, type ChatMessage } from '../../lib/chatbotApi';
import { mediaUrl } from '../../lib/mediaUrl';
import './ChatWidget.css';

const CONV_KEY = 'coze_chat_conversation_id';

const ChatWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const conversationId = sessionStorage.getItem(CONV_KEY) ?? undefined;

  const setConversationId = (id: string | null) => {
    if (id) sessionStorage.setItem(CONV_KEY, id);
    else sessionStorage.removeItem(CONV_KEY);
  };

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setError(null);
    const nextHistory = [...messages, { role: 'user' as const, content: text }];
    setMessages(nextHistory);
    setLoading(true);

    try {
      const normalizedHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const { reply, conversationId: nextConv, products } =
        await sendChatbotMessage({
        message: text,
        history: normalizedHistory,
        conversationId,
      });
      setConversationId(nextConv);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: reply, products },
      ]);
    } catch (e: unknown) {
      const msg =
        axios.isAxiosError(e) && e.response?.data?.message
          ? String(e.response.data.message)
          : e instanceof Error
            ? e.message
            : 'Không gửi được tin nhắn.';
      setError(msg);
      setMessages(messages);
    } finally {
      setLoading(false);
    }
  }, [conversationId, input, loading, messages]);

  const handleNewChat = () => {
    setConversationId(null);
    setMessages([]);
    setError(null);
    setInput('');
  };

  return (
    <div className="chat-widget-root">
      {open && (
        <div className="chat-widget-panel" role="dialog" aria-label="Trợ lý Coze">
          <div className="chat-widget-header">
            <span>Trợ lý</span>
            <div className="chat-widget-header-actions">
              <button type="button" className="chat-widget-link" onClick={handleNewChat}>
                Đoạn mới
              </button>
              <button
                type="button"
                className="chat-widget-close"
                onClick={() => setOpen(false)}
                aria-label="Đóng"
              >
                ×
              </button>
            </div>
          </div>
          <div className="chat-widget-messages">
            {messages.length === 0 && (
              <p className="chat-widget-hint">
                Hỏi về cửa hàng, sản phẩm hoặc đơn hàng. Bot chạy trên nền tảng Coze.
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`chat-widget-bubble ${m.role === 'user' ? 'is-user' : 'is-assistant'}`}
              >
                {m.content}
                {m.role === 'assistant' && m.products && m.products.length > 0 && (
                  <div className="chat-widget-products">
                    {m.products.map((p) => (
                      <a
                        key={p.id}
                        className="chat-widget-product-card"
                        href={`/product/${p.id}`}
                        title={`Xem chi tiết ${p.name}`}
                      >
                        {p.imageUrl ? (
                          <img
                            className="chat-widget-product-image"
                            src={mediaUrl(p.imageUrl)}
                            alt={p.name}
                          />
                        ) : (
                          <div className="chat-widget-product-image chat-widget-product-image-placeholder">
                            No image
                          </div>
                        )}
                        <div className="chat-widget-product-meta">
                          <div className="chat-widget-product-name">{p.name}</div>
                          <div className="chat-widget-product-line">
                            Giá: {p.price} | Tồn: {p.stock}
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && <div className="chat-widget-bubble is-assistant">Đang trả lời…</div>}
            {error && <div className="chat-widget-error">{error}</div>}
          </div>
          <form
            className="chat-widget-form"
            onSubmit={(e) => {
              e.preventDefault();
              void handleSend();
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi…"
              disabled={loading}
              autoComplete="off"
            />
            <button type="submit" disabled={loading || !input.trim()}>
              Gửi
            </button>
          </form>
        </div>
      )}
      <button
        type="button"
        className="chat-widget-fab"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Mở chat Coze"
      >
        💬
      </button>
    </div>
  );
};

export default ChatWidget;
