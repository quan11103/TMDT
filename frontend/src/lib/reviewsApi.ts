import { jwtDecode } from 'jwt-decode';

import { API_BASE } from './apiConfig';

export type ReviewSummary = {
    product_id: number;
    count: number;
    avg_rating: number;
};

export type ReviewListItem = {
    id: number;
    rating: number;
    comment: string | null;
    created_at: string;
    users: { id: number; full_name: string | null };
};

export type ReviewsListResponse = {
    data: ReviewListItem[];
    meta: { total: number; page: number; limit: number; total_page: number };
};

export function getJwtUserId(): number | null {
    const t = localStorage.getItem('access_token');
    if (!t) return null;
    try {
        const d = jwtDecode<{ sub: number }>(t);
        return typeof d.sub === 'number' ? d.sub : null;
    } catch {
        return null;
    }
}

async function parseError(res: Response): Promise<string> {
    const data = await res.json().catch(() => ({}));
    const msg = data?.message;
    return Array.isArray(msg) ? msg.join(', ') : msg || `Lỗi ${res.status}`;
}

export async function fetchReviewSummary(productId: number): Promise<ReviewSummary> {
    const res = await fetch(`${API_BASE}/products/${productId}/reviews/summary`);
    if (!res.ok) throw new Error(await parseError(res));
    return res.json();
}

export async function fetchReviewsPage(
    productId: number,
    page: number,
    limit = 10,
): Promise<ReviewsListResponse> {
    const q = new URLSearchParams({ page: String(page), limit: String(limit) });
    const res = await fetch(`${API_BASE}/products/${productId}/reviews?${q}`);
    if (!res.ok) throw new Error(await parseError(res));
    return res.json();
}

export async function upsertMyReview(
    productId: number,
    body: { rating: number; comment?: string },
): Promise<{ id: number; rating: number; comment: string | null }> {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('Cần đăng nhập để đánh giá');

    const payload: { rating: number; comment?: string } = { rating: body.rating };
    const c = body.comment?.trim();
    if (c) payload.comment = c;

    const res = await fetch(`${API_BASE}/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await parseError(res));
    return res.json();
}

export async function deleteMyReview(productId: number): Promise<void> {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('Cần đăng nhập');

    const res = await fetch(`${API_BASE}/products/${productId}/reviews/me`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(await parseError(res));
}
