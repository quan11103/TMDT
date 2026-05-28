import React, { useEffect, useMemo, useState, useRef } from 'react';
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Swal from 'sweetalert2';
import './AdminPromotions.css';
import { API_BASE } from '../../lib/apiConfig';

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

const formatCurrency = (val: number, type: PromoDiscountType) => {
    if (type === 'PERCENT') return `-${val}%`;
    return `-${new Intl.NumberFormat('vi-VN').format(val)}đ`;
};

const AdminPromotions: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'promotions' | 'sales'>('promotions');
    // State quản lý danh sách và form
    const [promotions, setPromotions] = useState<PromotionApi[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [mode, setMode] = useState<'create' | 'edit'>('create');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [saving, setSaving] = useState<boolean>(false);

    // State cho Form
    const [code, setCode] = useState('');
    const [discountType, setDiscountType] = useState<PromoDiscountType>('PERCENT');
    const [discountValue, setDiscountValue] = useState<number | string>(0);
    const [productScope, setProductScope] = useState<PromoProductScope>('ALL');
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [isActive, setIsActive] = useState<boolean>(true);

    // State cho Ngày (DayPicker)
    const [selectedStart, setSelectedStart] = useState<Date>(new Date());
    const [selectedEnd, setSelectedEnd] = useState<Date>();
    const [isStartOpen, setIsStartOpen] = useState(false);
    const [isEndOpen, setIsEndOpen] = useState(false);
    const startRef = useRef<HTMLDivElement>(null);
    const endRef = useRef<HTMLDivElement>(null);

    // State cho Sale Form
    const [salesList, setSalesList] = useState<any[]>([]);
    const [salesLoading, setSalesLoading] = useState<boolean>(true);
    const [salesError, setSalesError] = useState<string>('');
    const [saleMode, setSaleMode] = useState<'create' | 'edit'>('create');
    const [saleEditingId, setSaleEditingId] = useState<number | null>(null);
    const [saleSaving, setSaleSaving] = useState<boolean>(false);
    const [saleIsActive, setSaleIsActive] = useState<boolean>(true);
    const [saleSendEmail, setSaleSendEmail] = useState<boolean>(true);

    const [isSaleFormOpen, setIsSaleFormOpen] = useState(false);
    const [saleName, setSaleName] = useState('');
    const [saleDiscountValue, setSaleDiscountValue] = useState<number | string>(0);
    const [saleProductScope, setSaleProductScope] = useState<PromoProductScope>('ALL');
    const [saleCategoryId, setSaleCategoryId] = useState<number | null>(null);
    const [saleCategoryQuery, setSaleCategoryQuery] = useState('');
    const [saleProductQuery, setSaleProductQuery] = useState('');
    const [saleSelectedProduct, setSaleSelectedProduct] = useState<ProductItem | null>(null);
    const [saleSelectedStart, setSaleSelectedStart] = useState<Date>(new Date());
    const [saleSelectedEnd, setSaleSelectedEnd] = useState<Date>();
    const [isSaleStartOpen, setIsSaleStartOpen] = useState(false);
    const [isSaleEndOpen, setIsSaleEndOpen] = useState(false);
    const saleStartRef = useRef<HTMLDivElement>(null);
    const saleEndRef = useRef<HTMLDivElement>(null);

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

    // Xử lý đóng popover khi click ngoài
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (startRef.current && !startRef.current.contains(event.target as Node)) setIsStartOpen(false);
            if (endRef.current && !endRef.current.contains(event.target as Node)) setIsEndOpen(false);
            if (saleStartRef.current && !saleStartRef.current.contains(event.target as Node)) setIsSaleStartOpen(false);
            if (saleEndRef.current && !saleEndRef.current.contains(event.target as Node)) setIsSaleEndOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const resetForm = () => {
        setMode('create');
        setEditingId(null);
        setCode('');
        setDiscountType('PERCENT');
        setDiscountValue(0);
        setProductScope('ALL');
        setCategoryId(null);
        setCategoryQuery('');
        setProductQuery('');
        setSelectedProducts([]);
        setSelectedStart(new Date());
        setSelectedEnd(undefined);
        setIsActive(true);
    };

    const loadPromotions = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/promotions`, { headers: authHeaders });
            const data = await res.json();
            setPromotions(Array.isArray(data) ? data : (data.data || []));
        } catch (e) {
            setError('Lỗi kết nối khi tải khuyến mãi');
        } finally {
            setLoading(false);
        }
    };

    const loadSales = async () => {
        try {
            setSalesLoading(true);
            const res = await fetch(`${API_BASE}/sales`, { headers: authHeaders });
            const data = await res.json();
            setSalesList(Array.isArray(data) ? data : (data.data || []));
        } catch (e) {
            setSalesError('Lỗi kết nối khi tải sale');
        } finally {
            setSalesLoading(false);
        }
    };

    useEffect(() => { loadPromotions(); loadSales(); }, []);

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
        if (productScope !== 'CATEGORY' && saleProductScope !== 'CATEGORY') return;
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
    }, [productScope, saleProductScope]);

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
        const q = productScope === 'PRODUCT' ? productQuery.trim() : saleProductQuery.trim();
        if ((productScope !== 'PRODUCT' && saleProductScope !== 'PRODUCT') || q.length < 1) return;
        const fetchProds = async () => {
            setProductLoading(true);
            const res = await fetch(`${API_BASE}/products?search=${encodeURIComponent(q)}&limit=10`);
            const data = await res.json();
            if (res.ok) setProductResults(data.data.map((p: any) => ({ id: p.id, name: p.name, slug: p.slug })));
            setProductLoading(false);
        };
        const timer = setTimeout(fetchProds, 300);
        return () => clearTimeout(timer);
    }, [productQuery, productScope, saleProductQuery, saleProductScope]);

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

    // Xử lý Submit
    const onSubmit = async () => {
        if (!code.trim() || !selectedEnd) {
            Swal.fire('Lỗi', 'Vui lòng nhập mã và thời hạn kết thúc', 'error');
            return;
        }

        const payload: any = {
            code: code.trim().toUpperCase(),
            discount_type: discountType,
            discount_value: Number(discountValue),
            product_scope: productScope,
            starts_at: selectedStart.toISOString(),
            ends_at: selectedEnd.toISOString(),
            is_active: isActive,
        };
        if (productScope === 'CATEGORY') payload.category_id = categoryId;
        if (productScope === 'PRODUCT') payload.product_ids = selectedProducts.map(p => p.id);

        try {
            setSaving(true);
            const url = mode === 'edit' ? `${API_BASE}/promotions/${editingId}` : `${API_BASE}/promotions`;
            const method = mode === 'edit' ? 'PATCH' : 'POST';
            const res = await fetch(url, {
                method,
                headers: authHeaders,
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                Swal.fire('Thành công', mode === 'edit' ? 'Đã cập nhật' : 'Đã tạo mới', 'success');
                loadPromotions();
                setIsFormOpen(false);
                resetForm();
            } else {
                const data = await res.json();
                Swal.fire('Thất bại', data.message || 'Lỗi khi lưu', 'error');
            }
        } catch {
            Swal.fire('Lỗi', 'Lỗi kết nối Server', 'error');
        } finally { setSaving(false); }
    };

    // Thao tác bảng (Edit/Delete)
    const onEdit = (promo: PromotionApi) => {
        setMode('edit');
        setEditingId(promo.id);
        setCode(promo.code);
        setDiscountType(promo.discount_type);
        setDiscountValue(promo.discount_value);
        setProductScope(promo.product_scope);
        setCategoryId(promo.category_id);
        setSelectedStart(new Date(promo.starts_at));
        setSelectedEnd(new Date(promo.ends_at));
        setIsActive(promo.is_active);
        setCategoryQuery(promo.categories?.name || '');
        setSelectedProducts(promo.promotion_products?.map(p => ({ id: p.products!.id, name: p.products!.name, slug: '' })) || []);
        setIsFormOpen(true);
    };

    const onToggleActive = async (promo: PromotionApi) => {
        const newStatus = !promo.is_active;
        const actionText = newStatus ? 'Kích hoạt' : 'Vô hiệu';

        const ok = window.confirm(`${actionText} mã "${promo.code}"?`);
        if (!ok) return;

        try {
            const res = await fetch(`${API_BASE}/promotions/${promo.id}`, {
                method: 'PATCH',
                headers: authHeaders,
                body: JSON.stringify({ is_active: newStatus }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                alert(data?.message || `Không thể ${actionText} mã`);
                return;
            }
            await loadPromotions();
        } catch {
            alert(`Lỗi kết nối khi ${actionText}`);
        }
    };

    const onDelete = async (id: number) => {
        const result = await Swal.fire({
            title: 'Xác nhận xóa?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#7f0019',
            confirmButtonText: 'Xóa ngay'
        });
        if (result.isConfirmed) {
            await fetch(`${API_BASE}/promotions/${id}`, { method: 'DELETE', headers: authHeaders });
            loadPromotions();
            Swal.fire('Đã xóa!', '', 'success');
        }
    };

    const resetSaleForm = () => {
        setSaleMode('create');
        setSaleEditingId(null);
        setSaleName('');
        setSaleDiscountValue(0);
        setSaleProductScope('ALL');
        setSaleCategoryId(null);
        setSaleCategoryQuery('');
        setSaleProductQuery('');
        setSaleSelectedProduct(null);
        setSaleSelectedStart(new Date());
        setSaleSelectedEnd(undefined);
        setSaleIsActive(true);
        setSaleSendEmail(true);
    };

    const saleScopeLabel = (sale: any) => {
        if (sale.apply_type === 'ALL') return 'Toàn shop';
        if (sale.apply_type === 'CATEGORY') {
            const c = allCategoriesFlat.find(cat => cat.id === sale.target_id);
            return c ? `Danh mục: ${c.name}` : `Danh mục #${sale.target_id}`;
        }
        if (sale.apply_type === 'PRODUCT') {
            return `Sản phẩm #${sale.target_id}`;
        }
        return 'Khác';
    };

    const saleStatusLabel = (sale: any) => {
        const now = Date.now();
        const ends = new Date(sale.end_date).getTime();
        if (!sale.status) return 'Đã vô hiệu';
        if (!Number.isNaN(ends) && ends < now) return 'Đã kết thúc';
        return 'Đang chạy';
    };

    const saleStatusClass = (sale: any) => {
        const label = saleStatusLabel(sale);
        return label === 'Đang chạy' ? 'active' : 'expired';
    };

    const onSaleSubmit = async () => {
        if (!saleName.trim() || !saleSelectedEnd) {
            Swal.fire('Lỗi', 'Vui lòng nhập tên chương trình và thời hạn kết thúc', 'error');
            return;
        }

        let target_id = null;
        if (saleProductScope === 'CATEGORY') target_id = saleCategoryId;
        if (saleProductScope === 'PRODUCT') target_id = saleSelectedProduct?.id;

        const payload: any = {
            name: saleName.trim(),
            discount_percent: Number(saleDiscountValue),
            apply_type: saleProductScope,
            target_id: target_id,
            start_date: saleSelectedStart.toISOString(),
            end_date: saleSelectedEnd.toISOString(),
            status: saleIsActive,
            send_email: saleSendEmail,
        };

        try {
            setSaleSaving(true);
            const url = saleMode === 'edit' ? `${API_BASE}/sales/${saleEditingId}` : `${API_BASE}/sales`;
            const method = saleMode === 'edit' ? 'PATCH' : 'POST';
            const res = await fetch(url, {
                method,
                headers: authHeaders,
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                Swal.fire('Thành công', saleMode === 'edit' ? 'Đã cập nhật' : 'Đã tạo mới', 'success');
                loadSales();
                setIsSaleFormOpen(false);
                resetSaleForm();
            } else {
                const data = await res.json();
                Swal.fire('Thất bại', data.message || 'Lỗi khi lưu', 'error');
            }
        } catch {
            Swal.fire('Lỗi', 'Lỗi kết nối Server', 'error');
        } finally { setSaleSaving(false); }
    };

    const onEditSale = (sale: any) => {
        setSaleMode('edit');
        setSaleEditingId(sale.id);
        setSaleName(sale.name);
        setSaleDiscountValue(sale.discount_percent);
        setSaleProductScope(sale.apply_type);
        setSaleCategoryId(sale.apply_type === 'CATEGORY' ? sale.target_id : null);
        setSaleSelectedProduct(sale.apply_type === 'PRODUCT' ? { id: sale.target_id, name: `Sản phẩm #${sale.target_id}`, slug: '' } : null);
        setSaleSelectedStart(new Date(sale.start_date));
        setSaleSelectedEnd(new Date(sale.end_date));
        setSaleIsActive(sale.status);
        setIsSaleFormOpen(true);
    };

    const onToggleSaleActive = async (sale: any) => {
        const newStatus = !sale.status;
        const actionText = newStatus ? 'Kích hoạt' : 'Vô hiệu';

        const ok = window.confirm(`${actionText} chương trình "${sale.name}"?`);
        if (!ok) return;

        try {
            const res = await fetch(`${API_BASE}/sales/${sale.id}`, {
                method: 'PATCH',
                headers: authHeaders,
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                alert(data?.message || `Không thể ${actionText}`);
                return;
            }
            await loadSales();
        } catch {
            alert(`Lỗi kết nối khi ${actionText}`);
        }
    };

    const onDeleteSale = async (id: number) => {
        const result = await Swal.fire({
            title: 'Xác nhận xóa?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#7f0019',
            confirmButtonText: 'Xóa ngay'
        });
        if (result.isConfirmed) {
            await fetch(`${API_BASE}/sales/${id}`, { method: 'DELETE', headers: authHeaders });
            loadSales();
            Swal.fire('Đã xóa!', '', 'success');
        }
    };

    // Thêm 2 hàm này vào bên trong component AdminPromotions:

    const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val === '') {
            setDiscountValue('');
            return;
        }
        const numValue = parseInt(val, 10);
        if (!isNaN(numValue)) {
            if (discountType === 'PERCENT' && numValue > 100) {
                setDiscountValue(100);
            } else {
                setDiscountValue(numValue);
            }
        }
    };

    const handleDiscountBlur = () => {
        // Nếu trống hoặc nhỏ hơn 0, đưa về 0 (hoặc mức tối thiểu bạn muốn)
        if (discountValue === '' || Number(discountValue) < 0) {
            setDiscountValue(0);
        } else if (discountType === 'PERCENT' && Number(discountValue) > 100) {
            setDiscountValue(100);
        }
    };

    return (
        <div className="admin-section">
            <div className="tabs-header">
                <h2
                    className={`tab-title ${activeTab === 'promotions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('promotions')}
                >
                    <span>Quản lý mã giảm giá</span>
                </h2>
                <h2
                    className={`tab-title ${activeTab === 'sales' ? 'active' : ''}`}
                    onClick={() => setActiveTab('sales')}
                >
                    <span>Quản lý sale</span>
                </h2>
            </div>

            {activeTab === 'promotions' && (
                <>
                    <div className="tab-action-bar">
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
                                            onChange={(e) => {
                                                const newType = e.target.value as PromoDiscountType;
                                                setDiscountType(newType);
                                                if (newType === 'PERCENT' && Number(discountValue) > 100) {
                                                    setDiscountValue(100);
                                                }
                                            }}
                                        >
                                            <option value="PERCENT">% Phần trăm</option>
                                            <option value="FIXED_AMOUNT">VNĐ Trực tiếp</option>
                                        </select>
                                    </div>
                                    <div className="col">
                                        <label>Mức giảm</label>
                                        <input
                                            type="number"
                                            className="muji-input"
                                            value={discountValue}
                                            onChange={handleDiscountChange}
                                            onBlur={handleDiscountBlur}
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

                                {/* Phần Ngày sử dụng (UI DayPicker) */}
                                <div className="form-group row">
                                    {/* Phần Ngày bắt đầu */}
                                    <div className="col relative" ref={startRef}>
                                        <label>Ngày bắt đầu</label>
                                        <div className="dob-input-wrapper" onClick={() => setIsStartOpen(!isStartOpen)}>
                                            <input type="text" readOnly className="muji-input pointer" value={format(selectedStart, "yyyy-MM-dd")} />
                                            <button className="calendar-btn" type="button"><i className="fas fa-calendar"></i></button>
                                        </div>
                                        {isStartOpen && (
                                            <div className="calendar-popover">
                                                <DayPicker
                                                    mode="single"
                                                    selected={selectedStart}
                                                    onSelect={(d) => {
                                                        // Luôn cập nhật nếu có ngày mới, hoặc đơn giản là đóng lịch nếu người dùng click lại ngày cũ
                                                        if (d) setSelectedStart(d);
                                                        setIsStartOpen(false); // Chuyển dòng này ra ngoài if hoặc đảm bảo nó luôn chạy
                                                    }}
                                                    locale={vi}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Phần Ngày kết thúc */}
                                    <div className="col relative" ref={endRef}>
                                        <label>Ngày kết thúc</label>
                                        <div className="dob-input-wrapper" onClick={() => setIsEndOpen(!isEndOpen)}>
                                            <input type="text" readOnly placeholder="Chọn ngày" className="muji-input pointer" value={selectedEnd ? format(selectedEnd, "yyyy-MM-dd") : ""} />
                                            <button className="calendar-btn" type="button"><i className="fas fa-calendar"></i></button>
                                        </div>
                                        {isEndOpen && (
                                            <div className="calendar-popover">
                                                <DayPicker
                                                    mode="single"
                                                    selected={selectedEnd}
                                                    onSelect={(d) => {
                                                        if (d) setSelectedEnd(d);
                                                        setIsEndOpen(false); // Luôn đóng popover sau khi tương tác với lịch
                                                    }}
                                                    locale={vi}
                                                />
                                            </div>
                                        )}
                                    </div>
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
                                            <span
                                                className={`action-badge ${promo.is_active ? 'disable' : 'enable'}`}
                                                role="button"
                                                onClick={() => onToggleActive(promo)}
                                            >
                                                {promo.is_active ? 'Vô hiệu' : 'Kích hoạt'}
                                            </span>
                                            <span className="action-badge delete" role="button" tabIndex={0} onClick={() => onDelete(promo.id)} onKeyDown={(e) => e.key === 'Enter' && onDelete(promo.id)}>Xóa</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}

            {activeTab === 'sales' && (
                <>
                    <div className="tab-action-bar">
                        <button
                            className="btn-primary"
                            type="button"
                            onClick={() => {
                                if (isSaleFormOpen) {
                                    setIsSaleFormOpen(false);
                                    resetSaleForm();
                                } else {
                                    resetSaleForm();
                                    setIsSaleFormOpen(true);
                                }
                            }}
                            style={{ backgroundColor: isSaleFormOpen ? '#333' : '#7f0019' }}
                        >
                            {isSaleFormOpen ? 'Đóng Form' : '+ Thêm sale mới'}
                        </button>
                    </div>

                    {isSaleFormOpen && (
                        <div className="promo-form-container">
                            <h3 className="form-title">Tạo chương trình Sale mới</h3>
                            <div className="promo-form-grid">
                                <div className="form-group row" style={{ gridColumn: '1 / -1' }}>
                                    <div className="col" style={{ flex: 2 }}>
                                        <label>Tên chương trình</label>
                                        <input
                                            type="text"
                                            placeholder="VD: Siêu Sale Tháng 5"
                                            className="muji-input"
                                            value={saleName}
                                            onChange={(e) => setSaleName(e.target.value)}
                                        />
                                    </div>
                                    <div className="col" style={{ flex: 1 }}>
                                        <label>% Giảm giá</label>
                                        <input
                                            type="number"
                                            className="muji-input"
                                            placeholder="VD: 10"
                                            value={saleDiscountValue}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === '') {
                                                    setSaleDiscountValue('');
                                                    return;
                                                }
                                                const numValue = parseInt(val, 10);
                                                if (!isNaN(numValue)) {
                                                    if (numValue > 100) {
                                                        setSaleDiscountValue(100);
                                                    } else {
                                                        setSaleDiscountValue(numValue);
                                                    }
                                                }
                                            }}
                                            onBlur={() => {
                                                if (saleDiscountValue === '' || Number(saleDiscountValue) < 0) setSaleDiscountValue(0);
                                                if (Number(saleDiscountValue) > 100) setSaleDiscountValue(100);
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="form-group row" style={{ gridColumn: '1 / -1' }}>
                                    <div className="col relative" ref={saleStartRef}>
                                        <label>Ngày bắt đầu</label>
                                        <div className="dob-input-wrapper" onClick={() => setIsSaleStartOpen(!isSaleStartOpen)}>
                                            <input type="text" readOnly className="muji-input pointer" value={format(saleSelectedStart, "yyyy-MM-dd")} />
                                            <button className="calendar-btn" type="button"><i className="fas fa-calendar"></i></button>
                                        </div>
                                        {isSaleStartOpen && (
                                            <div className="calendar-popover">
                                                <DayPicker mode="single" selected={saleSelectedStart} onSelect={(d) => { if (d) setSaleSelectedStart(d); setIsSaleStartOpen(false); }} locale={vi} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="col relative" ref={saleEndRef}>
                                        <label>Ngày kết thúc</label>
                                        <div className="dob-input-wrapper" onClick={() => setIsSaleEndOpen(!isSaleEndOpen)}>
                                            <input type="text" readOnly placeholder="Chọn ngày" className="muji-input pointer" value={saleSelectedEnd ? format(saleSelectedEnd, "yyyy-MM-dd") : ""} />
                                            <button className="calendar-btn" type="button"><i className="fas fa-calendar"></i></button>
                                        </div>
                                        {isSaleEndOpen && (
                                            <div className="calendar-popover">
                                                <DayPicker mode="single" selected={saleSelectedEnd} onSelect={(d) => { if (d) setSaleSelectedEnd(d); setIsSaleEndOpen(false); }} locale={vi} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Phạm vi áp dụng</label>
                                    <select
                                        className="muji-input"
                                        value={saleProductScope}
                                        onChange={(e) => {
                                            const v = e.target.value as PromoProductScope;
                                            setSaleProductScope(v);
                                            setSaleCategoryId(null);
                                            setSaleSelectedProduct(null);
                                            setSaleCategoryQuery('');
                                            setSaleProductQuery('');
                                            setProductResults([]);
                                        }}
                                    >
                                        <option value="ALL">Toàn shop</option>
                                        <option value="CATEGORY">Danh mục</option>
                                        <option value="PRODUCT">Sản phẩm</option>
                                    </select>
                                </div>

                                {saleProductScope === 'CATEGORY' && (
                                    <div className="form-group">
                                        <label>Chọn danh mục</label>
                                        <div className="typeahead">
                                            <input
                                                type="text"
                                                className="muji-input"
                                                placeholder="Gõ để tìm danh mục..."
                                                value={saleCategoryQuery}
                                                onChange={(e) => {
                                                    const v = e.target.value;
                                                    setSaleCategoryQuery(v);
                                                    if (saleCategoryId != null) {
                                                        const row = allCategoriesFlat.find((c) => c.id === saleCategoryId);
                                                        if (row && v.trim().toLowerCase() !== row.name.trim().toLowerCase()) {
                                                            setSaleCategoryId(null);
                                                        }
                                                    }
                                                }}
                                            />
                                            {categoryTreeLoading && <div className="typeahead-hint">Đang tải danh mục...</div>}
                                            {saleCategoryQuery.trim().length > 0 && !categoryTreeLoading && saleCategoryId == null && allCategoriesFlat.filter(c => c.name.toLowerCase().includes(saleCategoryQuery.toLowerCase())).length === 0 && (
                                                <div className="typeahead-hint">Không có danh mục khớp</div>
                                            )}
                                            {saleCategoryQuery.trim().length > 0 && !categoryTreeLoading && saleCategoryId == null && allCategoriesFlat.filter(c => c.name.toLowerCase().includes(saleCategoryQuery.toLowerCase())).length > 0 && (
                                                <div className="typeahead-list" role="listbox">
                                                    {allCategoriesFlat.filter(c => c.name.toLowerCase().includes(saleCategoryQuery.toLowerCase())).slice(0, 20).map((c) => (
                                                        <button
                                                            key={c.id}
                                                            type="button"
                                                            className="typeahead-item"
                                                            onClick={() => {
                                                                setSaleCategoryId(c.id);
                                                                setSaleCategoryQuery(c.name);
                                                            }}
                                                        >
                                                            {c.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                            {saleCategoryId && (
                                                <div className="typeahead-selected">
                                                    Đã chọn: <span className="group-tag">#{saleCategoryId}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {saleProductScope === 'PRODUCT' && (
                                    <div className="form-group">
                                        <label>Chọn sản phẩm</label>
                                        <div className="typeahead">
                                            <input
                                                type="text"
                                                className="muji-input"
                                                placeholder="Gõ để tìm sản phẩm..."
                                                value={saleProductQuery}
                                                onChange={(e) => setSaleProductQuery(e.target.value)}
                                            />
                                            {productLoading && <div className="typeahead-hint">Đang tìm...</div>}
                                            {!productLoading && saleProductQuery.trim() && productResults.length === 0 && (
                                                <div className="typeahead-hint">Không có sản phẩm khớp</div>
                                            )}
                                            {productResults.length > 0 && (
                                                <div className="typeahead-list" role="listbox">
                                                    {productResults.map((p) => (
                                                        <button
                                                            key={p.id}
                                                            type="button"
                                                            className="typeahead-item"
                                                            onClick={() => {
                                                                setSaleSelectedProduct(p);
                                                                setSaleProductQuery('');
                                                                setProductResults([]);
                                                            }}
                                                        >
                                                            {p.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                            {saleSelectedProduct && (
                                                <div className="chips" style={{ marginTop: '10px' }}>
                                                    <span className="chip">
                                                        {saleSelectedProduct.name}
                                                        <button
                                                            type="button"
                                                            className="chip-x"
                                                            onClick={() => setSaleSelectedProduct(null)}
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label>Trạng thái</label>
                                    <select className="muji-input" value={String(saleIsActive)} onChange={(e) => setSaleIsActive(e.target.value === 'true')}>
                                        <option value="true">Đang chạy</option>
                                        <option value="false">Vô hiệu</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={saleSendEmail}
                                            onChange={(e) => setSaleSendEmail(e.target.checked)}
                                            style={{ cursor: 'pointer' }}
                                        />
                                        <span>Gửi email thông báo tới khách hàng</span>
                                    </label>
                                </div>
                            </div>
                            <div className="form-actions">
                                <button className="btn-primary" onClick={onSaleSubmit} disabled={saleSaving}>
                                    {saleSaving ? 'Đang lưu...' : (saleMode === 'edit' ? 'CẬP NHẬT CHƯƠNG TRÌNH' : 'TẠO CHƯƠNG TRÌNH SALE')}
                                </button>
                                {saleMode === 'edit' && (
                                    <button
                                        className="btn-primary"
                                        style={{ backgroundColor: '#333' }}
                                        onClick={() => {
                                            resetSaleForm();
                                            setIsSaleFormOpen(false);
                                        }}
                                        disabled={saleSaving}
                                    >
                                        Hủy sửa
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* BẢNG HIỂN THỊ SALE */}
                    <table className="muji-table">
                        <thead>
                            <tr>
                                <th className="text-left">TÊN CHƯƠNG TRÌNH</th>
                                <th>MỨC GIẢM</th>
                                <th className="text-left">PHẠM VI ÁP DỤNG</th>
                                <th>THỜI GIAN</th>
                                <th>TRẠNG THÁI</th>
                                <th>THAO TÁC</th>
                            </tr>
                        </thead>
                        <tbody>
                            {salesLoading ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center' }}>Đang tải dữ liệu...</td>
                                </tr>
                            ) : salesError ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', color: '#cc0000' }}>{salesError}</td>
                                </tr>
                            ) : salesList.map((sale) => (
                                <tr key={sale.id}>
                                    <td className="text-left font-medium promo-code">{sale.name}</td>
                                    <td className="price font-medium" style={{ color: '#7f0019' }}>
                                        -{sale.discount_percent}%
                                    </td>
                                    <td className="text-left">
                                        <span className="group-tag">{saleScopeLabel(sale)}</span>
                                    </td>
                                    <td>
                                        {new Date(sale.start_date).toLocaleDateString('vi-VN')} - {new Date(sale.end_date).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td>
                                        <span className={`status-badge ${saleStatusClass(sale)}`}>{saleStatusLabel(sale)}</span>
                                    </td>
                                    <td>
                                        <div className="table-actions">
                                            <span className="action-badge edit" role="button" tabIndex={0} onClick={() => onEditSale(sale)} onKeyDown={(e) => e.key === 'Enter' && onEditSale(sale)}>Sửa</span>
                                            <span
                                                className={`action-badge ${sale.status ? 'disable' : 'enable'}`}
                                                role="button"
                                                onClick={() => onToggleSaleActive(sale)}
                                            >
                                                {sale.status ? 'Vô hiệu' : 'Kích hoạt'}
                                            </span>
                                            <span className="action-badge delete" role="button" tabIndex={0} onClick={() => onDeleteSale(sale.id)} onKeyDown={(e) => e.key === 'Enter' && onDeleteSale(sale.id)}>Xóa</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}
        </div>
    );
};

export default AdminPromotions;