import { API_BASE } from './apiConfig';

const API_ORDER_PREVIEW = `${API_BASE}/order/preview`;

export const CHECKOUT_PROMO_STORAGE_KEY = 'checkout_promotion_code';

export type OrderPreviewResult = {
    subtotal: number;
    discount_amount: number;
    total_amount: number;
    promotion_id: number | null;
};

export async function previewOrderCheckout(
    token: string,
    cartItemIds: number[],
    promotionCode?: string,
): Promise<OrderPreviewResult> {
    const res = await fetch(API_ORDER_PREVIEW, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            cart_item_ids: cartItemIds,
            ...(promotionCode?.trim() ? { promotion_code: promotionCode.trim() } : {}),
        }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const msg = Array.isArray(data?.message) ? data.message.join(', ') : data?.message;
        throw new Error(msg || 'Không tính được giá đơn hàng');
    }
    return {
        subtotal: Number(data.subtotal),
        discount_amount: Number(data.discount_amount),
        total_amount: Number(data.total_amount),
        promotion_id: data.promotion_id ?? null,
    };
}
