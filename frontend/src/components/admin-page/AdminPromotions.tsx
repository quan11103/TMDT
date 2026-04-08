import React, { useEffect, useMemo, useState } from 'react';
import './AdminPromotions.css';

type PromoDiscountType = 'PERCENT' | 'FIXED_AMOUNT';
type PromoProductScope = 'ALL' | 'CATEGORY' | 'PRODUCT';

interface PromotionApi {
    id: number;
    code: string;
    discount_type: PromoDiscountType;
    discount_value: number;
    product_scope: PromoProductScope;
    category_id: number | null;
    starts_at: string;
    ends_at: string;
    is_active: boolean;
    promotion_products?: Array<{ product_id: number; products?: { id: number; name: string } }>;
    categories?: { id: number; name: string; slug: string } | null;
}

interface CategoryItem {
    id: number;
    name: string;
    slug: string;
}

interface ProductItem {
    id: number;
    name: string;
    slug: string;
}

const API_BASE = 'http://localhost:3000/api';

const toDateInput = (iso: string) => {
    // Convert ISO to yyyy-mm-dd for <input type="date" />
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

const formatCurrency = (val: number, type: PromoDiscountType) => {
    if (type === 'PERCENT') return `-${val}%`;
    return `-${new Intl.NumberFormat('vi-VN').format(val)}đ`;
};

const AdminPromotions: React.FC = () => {
    const [promotions, setPromotions] = useState<PromotionApi[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [isFormOpen, setIsFormOpen] = useState(false);

    const [mode, setMode] = useState<'create' | 'edit'>('create');
    const [editingId, setEditingId] = useState<number | null>(null);

    // Form state
    const [code, setCode] = useState('');
    const [discountType, setDiscountType] = useState<PromoDiscountType>('PERCENT');
    const [discountValue, setDiscountValue] = useState<number>(10);
    const [productScope, setProductScope] = useState<PromoProductScope>('ALL');
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [startsAt, setStartsAt] = useState<string>(toDateInput(new Date().toISOString()));
    const [endsAt, setEndsAt] = useState<string>('');
    const [isActive, setIsActive] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);

    // Typeahead data — categories: flatten tree from GET /categories, filter by name client-side
    const [categoryQuery, setCategoryQuery] = useState('');
    const [allCategoriesFlat, setAllCategoriesFlat] = useState<CategoryItem[]>([]);
    const [categoryTreeLoading, setCategoryTreeLoading] = useState(false);

    const [productQuery, setProductQuery] = useState('');
    const [productResults, setProductResults] = useState<ProductItem[]>([]);
    const [productLoading, setProductLoading] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState<ProductItem[]>([]);

    const token = useMemo(() => localStorage.getItem('access_token') || '', []);

    const authHeaders = useMemo(() => ({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    }), [token]);

    const resetForm = () => {
        setMode('create');
        setEditingId(null);
        setCode('');
        setDiscountType('PERCENT');
        setDiscountValue(10);
        setProductScope('ALL');
        setCategoryId(null);
        setCategoryQuery('');
        setAllCategoriesFlat([]);
        setProductQuery('');
        setProductResults([]);
        setSelectedProducts([]);
        setStartsAt(toDateInput(new Date().toISOString()));
        setEndsAt('');
        setIsActive(true);
    };

    const loadPromotions = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await fetch(`${API_BASE}/promotions`, { headers: authHeaders });
            const data = await res.json();
            if (!res.ok) {
                setError(data?.message || 'Không thể tải danh sách khuyến mãi');
                return;
            }
            setPromotions(Array.isArray(data) ? data : []);
        } catch (e) {
            setError('Lỗi kết nối khi tải khuyến mãi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPromotions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const flattenCategoryTree = (rows: any[]): CategoryItem[] => {
        const out: CategoryItem[] = [];
        for (const row of rows) {
            if (row?.id != null && row?.name) {
                out.push({ id: row.id, name: row.name, slug: row.slug ?? '' });
            }
            for (const child of row?.other_categories ?? []) {
                if (child?.id != null && child?.name) {
                    out.push({ id: child.id, name: child.name, slug: child.slug ?? '' });
                }
            }
        }
        return out;
    };

    useEffect(() => {
        if (productScope !== 'CATEGORY') return;
        const controller = new AbortController();
        const run = async () => {
            try {
                setCategoryTreeLoading(true);
                const res = await fetch(`${API_BASE}/categories`, { signal: controller.signal });
                const data = await res.json();
                if (!res.ok || !Array.isArray(data)) {
                    setAllCategoriesFlat([]);
                    return;
                }
                setAllCategoriesFlat(flattenCategoryTree(data));
            } catch {
                if (!controller.signal.aborted) setAllCategoriesFlat([]);
            } finally {
                if (!controller.signal.aborted) setCategoryTreeLoading(false);
            }
        };
        run();
        return () => controller.abort();
    }, [productScope]);

    const categoryResults = useMemo(() => {
        const q = categoryQuery.trim().toLowerCase();
        if (!q) return [];
        return allCategoriesFlat
            .filter(
                (c) =>
                    c.name.toLowerCase().includes(q) ||
                    (c.slug && c.slug.toLowerCase().includes(q)),
            )
            .slice(0, 20);
    }, [allCategoriesFlat, categoryQuery]);

    /** Đã chọn xong: ô đang hiển thị đúng tên danh mục đã chọn → ẩn dropdown gợi ý */
    const selectedCategoryRow = useMemo(
        () => allCategoriesFlat.find((c) => c.id === categoryId) ?? null,
        [allCategoriesFlat, categoryId],
    );
    const categoryPickCommitted =
        categoryId != null &&
        selectedCategoryRow != null &&
        categoryQuery.trim().toLowerCase() === selectedCategoryRow.name.trim().toLowerCase();
    const showCategoryDropdown =
        !categoryTreeLoading && categoryQuery.trim().length > 0 && !categoryPickCommitted && categoryResults.length > 0;
    const showCategoryNoMatch =
        !categoryTreeLoading && categoryQuery.trim().length > 0 && !categoryPickCommitted && categoryResults.length === 0;

    useEffect(() => {
        const q = productQuery.trim();
        if (productScope !== 'PRODUCT') return;
        if (q.length < 1) {
            setProductResults([]);
            return;
        }

        const controller = new AbortController();
        const run = async () => {
            try {
                setProductLoading(true);
                const res = await fetch(`${API_BASE}/products?search=${encodeURIComponent(q)}&limit=10`, { signal: controller.signal });
                const data = await res.json();
                if (!res.ok) {
                    setProductResults([]);
                    return;
                }
                const items = Array.isArray(data?.data) ? data.data : [];
                setProductResults(
                    items.map((p: any) => ({
                        id: p.id,
                        name: p.name ?? p.slug ?? `Sản phẩm #${p.id}`,
                        slug: p.slug ?? '',
                    })),
                );
            } catch {
                // ignore
            } finally {
                setProductLoading(false);
            }
        };
        run();
        return () => controller.abort();
    }, [productQuery, productScope]);

    const scopeLabel = (promo: PromotionApi) => {
        if (promo.product_scope === 'ALL') return 'Tất cả sản phẩm';
        if (promo.product_scope === 'CATEGORY') {
            return promo.categories?.name ? `Danh mục: ${promo.categories.name}` : `Danh mục #${promo.category_id}`;
        }
        const n = promo.promotion_products?.length ?? 0;
        return n > 0 ? `${n} sản phẩm` : 'Sản phẩm (chưa chọn)';
    };

    const statusLabel = (promo: PromotionApi) => {
        const now = Date.now();
        const ends = new Date(promo.ends_at).getTime();
        if (!promo.is_active) return 'Đã vô hiệu';
        if (!Number.isNaN(ends) && ends < now) return 'Đã hết hạn';
        return 'Đang chạy';
    };

    const statusClass = (promo: PromotionApi) => {
        const label = statusLabel(promo);
        return label === 'Đang chạy' ? 'active' : 'expired';
    };

    const onSubmit = async () => {
        if (!code.trim()) {
            alert('Vui lòng nhập mã');
            return;
        }
        if (!endsAt) {
            alert('Vui lòng chọn hạn sử dụng');
            return;
        }
        if (productScope === 'CATEGORY' && !categoryId) {
            alert('Vui lòng chọn danh mục');
            return;
        }
        if (productScope === 'PRODUCT' && selectedProducts.length === 0) {
            alert('Vui lòng chọn ít nhất 1 sản phẩm');
            return;
        }

        const payload: any = {
            code: code.trim(),
            discount_type: discountType,
            discount_value: Number(discountValue),
            product_scope: productScope,
            starts_at: new Date(startsAt).toISOString(),
            ends_at: new Date(endsAt).toISOString(),
            is_active: isActive,
        };
        if (productScope === 'CATEGORY') payload.category_id = categoryId;
        if (productScope === 'PRODUCT') payload.product_ids = selectedProducts.map(p => p.id);

        try {
            setSaving(true);
            const url = mode === 'edit' && editingId ? `${API_BASE}/promotions/${editingId}` : `${API_BASE}/promotions`;
            const method = mode === 'edit' ? 'PATCH' : 'POST';
            const res = await fetch(url, {
                method,
                headers: authHeaders,
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) {
                const msg = Array.isArray(data?.message) ? data.message[0] : (data?.message || 'Không thể lưu khuyến mãi');
                alert(msg);
                return;
            }
            await loadPromotions();
            setIsFormOpen(false);
            resetForm();
        } catch {
            alert('Lỗi kết nối khi lưu khuyến mãi');
        } finally {
            setSaving(false);
        }
    };

    const onEdit = (promo: PromotionApi) => {
        setIsFormOpen(true);
        setMode('edit');
        setEditingId(promo.id);
        setCode(promo.code);
        setDiscountType(promo.discount_type);
        setDiscountValue(Number(promo.discount_value));
        setProductScope(promo.product_scope);
        setCategoryId(promo.category_id ?? null);
        setStartsAt(toDateInput(promo.starts_at));
        setEndsAt(toDateInput(promo.ends_at));
        setIsActive(Boolean(promo.is_active));
        setSelectedProducts(
            (promo.promotion_products ?? [])
                .map((r: any) => r.products ? ({ id: r.products.id, name: r.products.name, slug: '' }) : null)
                .filter(Boolean) as ProductItem[],
        );
        setCategoryQuery(
            promo.product_scope === 'CATEGORY' && promo.categories?.name
                ? promo.categories.name
                : '',
        );
        setProductQuery('');
        setProductResults([]);
    };

    const onDeactivate = async (promo: PromotionApi) => {
        if (!promo.is_active) {
            alert('Mã này đã vô hiệu');
            return;
        }
        const ok = window.confirm(`Vô hiệu mã "${promo.code}"? (Có thể bật lại khi sửa.)`);
        if (!ok) return;
        try {
            const res = await fetch(`${API_BASE}/promotions/${promo.id}`, {
                method: 'PATCH',
                headers: authHeaders,
                body: JSON.stringify({ is_active: false }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                alert(data?.message || 'Không thể vô hiệu mã');
                return;
            }
            await loadPromotions();
        } catch {
            alert('Lỗi kết nối khi vô hiệu');
        }
    };

    const onDelete = async (promo: PromotionApi) => {
        const ok = window.confirm(`Xóa vĩnh viễn mã "${promo.code}"? Hành động này không hoàn tác.`);
        if (!ok) return;
        try {
            const res = await fetch(`${API_BASE}/promotions/${promo.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                alert(data?.message || 'Không thể xóa mã');
                return;
            }
            await loadPromotions();
        } catch {
            alert('Lỗi kết nối khi xóa');
        }
    };

    return (
        <div className="admin-section">
            <div className="section-header">
                <h2 className="section-title">Quản lý khuyến mãi</h2>
                <button
                    className="btn-primary"
                    type="button"
                    onClick={() => {
                        if (isFormOpen) {
                            setIsFormOpen(false);
                            resetForm();
                        } else {
                            resetForm();
                            setIsFormOpen(true);
                        }
                    }}
                    style={{ backgroundColor: isFormOpen ? '#333' : '#7f0019' }}
                >
                    {isFormOpen ? 'Đóng Form' : '+ Thêm mã mới'}
                </button>
            </div>

            {/* FORM THÊM MỚI (Mở ra khi bấm nút) */}
            {isFormOpen && (
                <div className="promo-form-container">
                    <h3 className="form-title">{mode === 'edit' ? 'Sửa khuyến mãi' : 'Tạo mã khuyến mãi mới'}</h3>
                    <div className="promo-form-grid">
                        <div className="form-group">
                            <label>Mã giảm giá (Code)</label>
                            <input
                                type="text"
                                placeholder="VD: SUMMER26"
                                className="muji-input"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                            />
                        </div>
                        <div className="form-group row">
                            <div className="col">
                                <label>Loại giảm</label>
                                <select
                                    className="muji-input"
                                    value={discountType}
                                    onChange={(e) => setDiscountType(e.target.value as PromoDiscountType)}
                                >
                                    <option value="PERCENT">% Phần trăm</option>
                                    <option value="FIXED_AMOUNT">VNĐ Trực tiếp</option>
                                </select>
                            </div>
                            <div className="col">
                                <label>Mức giảm</label>
                                <input
                                    type="number"
                                    placeholder="10"
                                    className="muji-input"
                                    value={discountValue}
                                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Phạm vi áp dụng</label>
                            <select
                                className="muji-input"
                                value={productScope}
                                onChange={(e) => {
                                    const v = e.target.value as PromoProductScope;
                                    setProductScope(v);
                                    setCategoryId(null);
                                    setSelectedProducts([]);
                                    setCategoryQuery('');
                                    setProductQuery('');
                                    setProductResults([]);
                                }}
                            >
                                <option value="ALL">Tất cả sản phẩm</option>
                                <option value="CATEGORY">Theo danh mục</option>
                                <option value="PRODUCT">Theo sản phẩm</option>
                            </select>
                        </div>

                        {productScope === 'CATEGORY' && (
                            <div className="form-group">
                                <label>Chọn danh mục</label>
                                <div className="typeahead">
                                    <input
                                        type="text"
                                        className="muji-input"
                                        placeholder="Gõ để tìm danh mục..."
                                        value={categoryQuery}
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            setCategoryQuery(v);
                                            const row = allCategoriesFlat.find((c) => c.id === categoryId);
                                            if (
                                                categoryId != null &&
                                                row &&
                                                v.trim().toLowerCase() !== row.name.trim().toLowerCase()
                                            ) {
                                                setCategoryId(null);
                                            }
                                        }}
                                    />
                                    {categoryTreeLoading && <div className="typeahead-hint">Đang tải danh mục...</div>}
                                    {showCategoryNoMatch && (
                                        <div className="typeahead-hint">Không có danh mục khớp</div>
                                    )}
                                    {showCategoryDropdown && (
                                        <div className="typeahead-list" role="listbox">
                                            {categoryResults.map((c) => (
                                                <button
                                                    key={c.id}
                                                    type="button"
                                                    className="typeahead-item"
                                                    onClick={() => {
                                                        setCategoryId(c.id);
                                                        setCategoryQuery(c.name);
                                                    }}
                                                >
                                                    {c.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {categoryId && (
                                        <div className="typeahead-selected">
                                            Đã chọn: <span className="group-tag">#{categoryId}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {productScope === 'PRODUCT' && (
                            <div className="form-group">
                                <label>Chọn sản phẩm</label>
                                <div className="typeahead">
                                    <input
                                        type="text"
                                        className="muji-input"
                                        placeholder="Gõ để tìm sản phẩm..."
                                        value={productQuery}
                                        onChange={(e) => setProductQuery(e.target.value)}
                                    />
                                    {productLoading && <div className="typeahead-hint">Đang tìm...</div>}
                                    {!productLoading && productQuery.trim() && productResults.length === 0 && (
                                        <div className="typeahead-hint">Không có sản phẩm khớp</div>
                                    )}
                                    {productResults.length > 0 && (
                                        <div className="typeahead-list" role="listbox">
                                            {productResults.map((p) => {
                                                const already = selectedProducts.some(sp => sp.id === p.id);
                                                return (
                                                    <button
                                                        key={p.id}
                                                        type="button"
                                                        className="typeahead-item"
                                                        disabled={already}
                                                        onClick={() => {
                                                            if (already) return;
                                                            setSelectedProducts([...selectedProducts, p]);
                                                            setProductQuery('');
                                                            setProductResults([]);
                                                        }}
                                                    >
                                                        {p.name}{already ? ' (đã chọn)' : ''}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                    {selectedProducts.length > 0 && (
                                        <div className="chips">
                                            {selectedProducts.map((p) => (
                                                <span key={p.id} className="chip">
                                                    {p.name}
                                                    <button
                                                        type="button"
                                                        className="chip-x"
                                                        onClick={() => setSelectedProducts(selectedProducts.filter(sp => sp.id !== p.id))}
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="form-group">
                            <label>Ngày bắt đầu</label>
                            <input type="date" className="muji-input" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Hạn sử dụng</label>
                            <input type="date" className="muji-input" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Trạng thái</label>
                            <select className="muji-input" value={String(isActive)} onChange={(e) => setIsActive(e.target.value === 'true')}>
                                <option value="true">Đang chạy</option>
                                <option value="false">Vô hiệu</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-actions">
                        <button className="btn-primary" onClick={onSubmit} disabled={saving}>
                            {saving ? 'Đang lưu...' : 'LƯU KHUYẾN MÃI'}
                        </button>
                        {mode === 'edit' && (
                            <button
                                className="btn-primary"
                                style={{ backgroundColor: '#333' }}
                                onClick={() => {
                                    resetForm();
                                    setIsFormOpen(false);
                                }}
                                disabled={saving}
                            >
                                Hủy sửa
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* BẢNG HIỂN THỊ */}
            <table className="muji-table">
                <thead>
                    <tr>
                        <th className="text-left">MÃ GIẢM GIÁ</th>
                        <th>MỨC GIẢM</th>
                        <th className="text-left">NHÓM SẢN PHẨM</th>
                        <th>HẠN SỬ DỤNG</th>
                        <th>TRẠNG THÁI</th>
                        <th>THAO TÁC</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={6} style={{ textAlign: 'center' }}>Đang tải dữ liệu...</td>
                        </tr>
                    ) : error ? (
                        <tr>
                            <td colSpan={6} style={{ textAlign: 'center', color: '#cc0000' }}>{error}</td>
                        </tr>
                    ) : promotions.map((promo) => (
                        <tr key={promo.id}>
                            <td className="text-left font-medium promo-code">{promo.code}</td>
                            <td className="price font-medium" style={{ color: '#7f0019' }}>
                                {formatCurrency(promo.discount_value, promo.discount_type)}
                            </td>
                            <td className="text-left">
                                <span className="group-tag">{scopeLabel(promo)}</span>
                            </td>
                            <td>{new Date(promo.ends_at).toLocaleDateString('vi-VN')}</td>
                            <td>
                                <span className={`status-badge ${statusClass(promo)}`}>{statusLabel(promo)}</span>
                            </td>
                            <td>
                                <div className="table-actions">
                                    <span className="action-badge edit" role="button" tabIndex={0} onClick={() => onEdit(promo)} onKeyDown={(e) => e.key === 'Enter' && onEdit(promo)}>Sửa</span>
                                    {promo.is_active && (
                                        <span className="action-badge disable" role="button" tabIndex={0} onClick={() => onDeactivate(promo)} onKeyDown={(e) => e.key === 'Enter' && onDeactivate(promo)}>Vô hiệu</span>
                                    )}
                                    <span className="action-badge delete" role="button" tabIndex={0} onClick={() => onDelete(promo)} onKeyDown={(e) => e.key === 'Enter' && onDelete(promo)}>Xóa</span>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminPromotions;