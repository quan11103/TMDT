import { apiUrl } from './apiConfig';

/**
 * Chuẩn hóa URL ảnh/asset từ API: path `/uploads/...` → full URL máy chủ backend.
 */
export function mediaUrl(pathOrUrl: string | null | undefined): string {
    if (!pathOrUrl) return '';
    return apiUrl(pathOrUrl);
}
