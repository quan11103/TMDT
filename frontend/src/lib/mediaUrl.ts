/** Origin API (phục vụ file tĩnh /uploads). Trùng cấu hình fetch trong project. */
const API_ORIGIN = 'http://localhost:3000';

/**
 * Chuẩn hóa URL ảnh/asset từ API: path `/uploads/...` → full URL máy chủ backend.
 */
export function mediaUrl(pathOrUrl: string | null | undefined): string {
    if (!pathOrUrl) return '';
    const s = pathOrUrl.trim();
    if (s.startsWith('http://') || s.startsWith('https://')) return s;
    const path = s.startsWith('/') ? s : `/${s}`;
    return `${API_ORIGIN}${path}`;
}
