import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './AdminBanner.css';
import { API_BASE, apiUrl } from '../../lib/apiConfig';

interface BannerApi {
    id: number;
    title: string;
    link_url: string | null;
    image_url: string;
    sort_order: number;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

const imgFullUrl = (imageUrl: string) => {
    if (!imageUrl) return '';
    return apiUrl(imageUrl);
};

const AdminBanner: React.FC = () => {
    const [banners, setBanners] = useState<BannerApi[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [savingOrder, setSavingOrder] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [mode, setMode] = useState<'create' | 'edit'>('create');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [title, setTitle] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [sortOrder, setSortOrder] = useState(0);
    const [isActive, setIsActive] = useState(true);
    const [file, setFile] = useState<File | null>(null);

    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    const token = useMemo(() => localStorage.getItem('access_token') || '', []);
    const authJsonHeaders = useMemo(
        () => ({
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        }),
        [token],
    );
    const authHeaders = useMemo(
        () => ({
            Authorization: `Bearer ${token}`,
        }),
        [token],
    );

    const loadBanners = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const res = await fetch(`${API_BASE}/banners`, { headers: authHeaders });
            const data = await res.json().catch(() => null);
            if (!res.ok) {
                setError((data && data.message) || 'Không tải được danh sách banner');
                setBanners([]);
                return;
            }
            setBanners(Array.isArray(data) ? data : []);
        } catch {
            setError('Lỗi kết nối khi tải banner');
            setBanners([]);
        } finally {
            setLoading(false);
        }
    }, [authHeaders]);

    useEffect(() => {
        loadBanners();
    }, [loadBanners]);

    const resetForm = () => {
        setMode('create');
        setEditingId(null);
        setTitle('');
        setLinkUrl('');
        setSortOrder(0);
        setIsActive(true);
        setFile(null);
    };

    const openCreate = () => {
        resetForm();
        const nextOrder = banners.length > 0 ? Math.max(...banners.map((b) => b.sort_order)) + 1 : 0;
        setSortOrder(nextOrder);
        setFormOpen(true);
    };

    const openEdit = (b: BannerApi) => {
        setMode('edit');
        setEditingId(b.id);
        setTitle(b.title);
        setLinkUrl(b.link_url ?? '');
        setSortOrder(b.sort_order);
        setIsActive(b.is_active);
        setFile(null);
        setFormOpen(true);
    };

    const appendBannerFields = (fd: FormData) => {
        fd.append('title', title.trim());
        const link = linkUrl.trim();
        if (link) fd.append('link_url', link);
        fd.append('sort_order', String(Number.isFinite(sortOrder) ? sortOrder : 0));
        fd.append('is_active', String(isActive));
    };

    const onSubmit = async () => {
        if (!title.trim()) {
            alert('Vui lòng nhập tiêu đề');
            return;
        }
        if (mode === 'create' && !file) {
            alert('Vui lòng chọn ảnh banner');
            return;
        }

        try {
            setSubmitting(true);
            if (mode === 'create') {
                const fd = new FormData();
                appendBannerFields(fd);
                fd.append('file', file!);
                const res = await fetch(`${API_BASE}/banners`, {
                    method: 'POST',
                    headers: authHeaders,
                    body: fd,
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                    const msg = Array.isArray(data?.message) ? data.message.join(', ') : data?.message;
                    alert(msg || 'Không tạo được banner');
                    return;
                }
            } else if (editingId != null) {
                const fd = new FormData();
                appendBannerFields(fd);
                if (file) fd.append('file', file);
                const res = await fetch(`${API_BASE}/banners/${editingId}`, {
                    method: 'PATCH',
                    headers: authHeaders,
                    body: fd,
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                    const msg = Array.isArray(data?.message) ? data.message.join(', ') : data?.message;
                    alert(msg || 'Không cập nhật được banner');
                    return;
                }
            }
            await loadBanners();
            setFormOpen(false);
            resetForm();
        } catch {
            alert('Lỗi kết nối khi lưu banner');
        } finally {
            setSubmitting(false);
        }
    };

    const onDelete = async (b: BannerApi) => {
        if (!window.confirm(`Xóa banner "${b.title}"?`)) return;
        try {
            const res = await fetch(`${API_BASE}/banners/${b.id}`, {
                method: 'DELETE',
                headers: authHeaders,
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                alert(data?.message || 'Không xóa được banner');
                return;
            }
            await loadBanners();
        } catch {
            alert('Lỗi kết nối khi xóa');
        }
    };

    const onToggleActive = async (b: BannerApi) => {
        try {
            const fd = new FormData();
            fd.append('is_active', String(!b.is_active));
            const res = await fetch(`${API_BASE}/banners/${b.id}`, {
                method: 'PATCH',
                headers: authHeaders,
                body: fd,
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                alert(data?.message || 'Không cập nhật trạng thái');
                return;
            }
            await loadBanners();
        } catch {
            alert('Lỗi kết nối');
        }
    };

    const handleSort = () => {
        if (dragItem.current === null || dragOverItem.current === null) return;
        const next = [...banners];
        const [removed] = next.splice(dragItem.current, 1);
        next.splice(dragOverItem.current, 0, removed);
        dragItem.current = null;
        dragOverItem.current = null;
        setBanners(next);
    };

    const saveOrder = async () => {
        if (banners.length === 0) return;
        const items = banners.map((b, i) => ({ id: b.id, sort_order: i }));
        try {
            setSavingOrder(true);
            const res = await fetch(`${API_BASE}/banners/reorder`, {
                method: 'PATCH',
                headers: authJsonHeaders,
                body: JSON.stringify({ items }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                alert(data?.message || 'Không lưu được thứ tự');
                return;
            }
            if (Array.isArray(data)) setBanners(data);
            else await loadBanners();
        } catch {
            alert('Lỗi kết nối khi lưu thứ tự');
        } finally {
            setSavingOrder(false);
        }
    };

    return (
        <div className="admin-section">
            <div className="section-header">
                <h2 className="section-title">Quản lý banner</h2>
                <div className="banner-header-actions">
                    <button
                        type="button"
                        className="btn-primary btn-outline"
                        onClick={saveOrder}
                        disabled={savingOrder || loading || banners.length === 0}
                    >
                        {savingOrder ? 'Đang lưu…' : 'Lưu thứ tự'}
                    </button>
                    <button
                        type="button"
                        className="btn-primary"
                        onClick={() => {
                            if (formOpen) {
                                setFormOpen(false);
                                resetForm();
                            } else {
                                openCreate();
                            }
                        }}
                        style={{ backgroundColor: formOpen ? '#333' : '#7f0019' }}
                    >
                        {formOpen ? 'Đóng form' : '+ Thêm mới'}
                    </button>
                </div>
            </div>

            {formOpen && (
                <div className="banner-form-card">
                    <h3 className="banner-form-title">{mode === 'edit' ? 'Sửa banner' : 'Thêm banner mới'}</h3>
                    <div className="banner-form-grid">
                        <div className="banner-form-group">
                            <label>Tiêu đề</label>
                            <input
                                className="muji-input"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Tiêu đề hiển thị / mô tả ngắn"
                            />
                        </div>
                        <div className="banner-form-group">
                            <label>Link (tùy chọn, URL đầy đủ có https://)</label>
                            <input
                                className="muji-input"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                placeholder="https://..."
                            />
                        </div>
                        <div className="banner-form-group row">
                            <div className="col">
                                <label>Thứ tự (sort)</label>
                                <input
                                    type="number"
                                    className="muji-input"
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(Number(e.target.value))}
                                />
                            </div>
                            <div className="col">
                                <label>Trạng thái</label>
                                <select
                                    className="muji-input"
                                    value={String(isActive)}
                                    onChange={(e) => setIsActive(e.target.value === 'true')}
                                >
                                    <option value="true">Đang hiển thị</option>
                                    <option value="false">Ẩn</option>
                                </select>
                            </div>
                        </div>
                        <div className="banner-form-group">
                            <label>{mode === 'edit' ? 'Ảnh mới (để trống giữ ảnh cũ)' : 'Ảnh banner'}</label>
                            <input
                                type="file"
                                accept="image/*"
                                className="muji-input file-input"
                                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                            />
                            {mode === 'edit' && editingId != null && !file && (
                                <div className="banner-preview-inline">
                                    <img
                                        src={imgFullUrl(banners.find((x) => x.id === editingId)?.image_url || '')}
                                        alt="Hiện tại"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="banner-form-actions">
                        <button type="button" className="btn-primary" disabled={submitting} onClick={onSubmit}>
                            {submitting ? 'Đang lưu…' : 'Lưu banner'}
                        </button>
                        {mode === 'edit' && (
                            <button
                                type="button"
                                className="btn-primary btn-outline"
                                disabled={submitting}
                                onClick={() => {
                                    resetForm();
                                    setFormOpen(false);
                                }}
                            >
                                Hủy
                            </button>
                        )}
                    </div>
                </div>
            )}

            {error && <div className="banner-error">{error}</div>}

            <table className="muji-table">
                <thead>
                    <tr>
                        <th style={{ width: 40 }} aria-label="Kéo thả" />
                        <th style={{ width: 200 }}>Hình</th>
                        <th className="text-left">Thông tin</th>
                        <th style={{ width: 90 }}>Thứ tự</th>
                        <th style={{ width: 110 }}>Hiển thị</th>
                        <th style={{ width: 200 }}>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={6} style={{ textAlign: 'center' }}>
                                Đang tải…
                            </td>
                        </tr>
                    ) : banners.length === 0 ? (
                        <tr>
                            <td colSpan={6} style={{ textAlign: 'center', color: '#888' }}>
                                Chưa có banner. Nhấn &quot;Thêm mới&quot; để upload.
                            </td>
                        </tr>
                    ) : (
                        banners.map((banner, index) => (
                            <tr
                                key={banner.id}
                                draggable
                                onDragStart={() => {
                                    dragItem.current = index;
                                }}
                                onDragEnter={() => {
                                    dragOverItem.current = index;
                                }}
                                onDragEnd={handleSort}
                                onDragOver={(e) => e.preventDefault()}
                            >
                                <td className="drag-handle">☰</td>
                                <td className="banner-img-cell">
                                    <img src={imgFullUrl(banner.image_url)} alt={banner.title} />
                                </td>
                                <td className="text-left">
                                    <span className="banner-name">{banner.title}</span>
                                    {banner.link_url ? (
                                        <div className="banner-url">{banner.link_url}</div>
                                    ) : (
                                        <div className="banner-url muted">Không có link</div>
                                    )}
                                </td>
                                <td>{banner.sort_order}</td>
                                <td>
                                    <button
                                        type="button"
                                        className={`banner-active-pill ${banner.is_active ? 'on' : 'off'}`}
                                        onClick={() => onToggleActive(banner)}
                                    >
                                        {banner.is_active ? 'Bật' : 'Tắt'}
                                    </button>
                                </td>
                                <td>
                                    <div className="table-actions">
                                        <span
                                            className="action-badge edit"
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => openEdit(banner)}
                                            onKeyDown={(e) => e.key === 'Enter' && openEdit(banner)}
                                        >
                                            Sửa
                                        </span>
                                        <span
                                            className="action-badge delete"
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => onDelete(banner)}
                                            onKeyDown={(e) => e.key === 'Enter' && onDelete(banner)}
                                        >
                                            Xóa
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default AdminBanner;
