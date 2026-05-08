import { API_BASE } from './apiConfig';

const API_URL = `${API_BASE}/store-settings`;

/** Trang mua hàng lắng nghe để refetch cấu hình sau khi admin lưu */
export const STORE_SETTINGS_UPDATED_EVENT = 'storeSettingsUpdated';

export type StoreSettings = {
    id: number;
    products_per_page: number;
    products_per_row: number;
};

export async function fetchStoreSettings(): Promise<StoreSettings> {
    const res = await fetch(API_URL);
    if (!res.ok) {
        throw new Error('Không tải được cấu hình cửa hàng');
    }
    return res.json();
}

export async function updateStoreSettings(
    token: string,
    body: { products_per_page?: number; products_per_row?: number },
): Promise<StoreSettings> {
    const res = await fetch(API_URL, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const msg = Array.isArray(data?.message) ? data.message.join(', ') : data?.message;
        throw new Error(msg || 'Không lưu được cấu hình');
    }
    return data as StoreSettings;
}
