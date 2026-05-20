import React, { useEffect, useMemo, useState } from 'react';
import type { CategoryData } from '../../types';
import Swal from 'sweetalert2';
import './CreateProduct.css';
import { API_BASE } from '../../lib/apiConfig';

interface ProductForm {
    name: string;
    slug: string;
    price: string;
    category_id: string;
    description: string;
    stock: string;
}

interface FlatCategory {
    id: number;
    name: string;
    slug: string;
}

function flattenCategories(rows: CategoryData[]): FlatCategory[] {
    const out: FlatCategory[] = [];
    for (const row of rows) {
        if (row?.id != null) {
            out.push({ id: row.id, name: row.name, slug: row.slug });
        }
        for (const child of row.other_categories ?? []) {
            if (child?.id != null) {
                out.push({
                    id: child.id,
                    name: `— ${child.name}`,
                    slug: child.slug,
                });
            }
        }
    }
    return out;
}

const CreateProduct: React.FC = () => {
    const [categories, setCategories] = useState<FlatCategory[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [formData, setFormData] = useState<ProductForm>({
        name: '',
        slug: '',
        price: '',
        category_id: '',
        description: '',
        stock: '',
    });

    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [mainImageIndex, setMainImageIndex] = useState(0);
    const [imageSource, setImageSource] = useState<'file' | 'url'>('file');
    const [imageUrls, setImageUrls] = useState<string>('');

    const previewUrls = useMemo(
        () => imageFiles.map((f) => URL.createObjectURL(f)),
        [imageFiles],
    );

    useEffect(() => {
        return () => previewUrls.forEach((u) => URL.revokeObjectURL(u));
    }, [previewUrls]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(`${API_BASE}/categories`);
                const data = await response.json();
                setCategories(flattenCategories(Array.isArray(data) ? data : []));
            } catch (error) {
                console.error('Không thể tải danh mục:', error);
            }
        };
        fetchCategories();
    }, []);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        const slug = name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[đĐ]/g, 'd')
            .replace(/([^0-9a-z-\s])/g, '')
            .replace(/(\s+)/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');

        setFormData({ ...formData, name, slug });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const list = e.target.files ? Array.from(e.target.files) : [];
        if (list.length > 20) {
            Swal.fire({
                icon: 'warning',
                title: 'Quá nhiều ảnh',
                text: 'Tối đa 20 ảnh mỗi lần.',
                confirmButtonColor: '#7f0019',
            });
            e.target.value = '';
            return;
        }
        setImageFiles(list);
        setMainImageIndex(0);
    };

    const resetForm = () => {
        setFormData({ name: '', slug: '', price: '', category_id: '', description: '', stock: '' });
        setImageFiles([]);
        setMainImageIndex(0);
        setImageSource('file');
        setImageUrls('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const payload = {
            ...formData,
            price: Number(formData.price),
            stock: Number(formData.stock),
            category_id: Number(formData.category_id),
        };

        const token = localStorage.getItem('access_token');
        if (!token) {
            setLoading(false);
            await Swal.fire({
                icon: 'warning',
                title: 'Chưa đăng nhập',
                text: 'Vui lòng đăng nhập admin.',
                confirmButtonColor: '#7f0019',
            });
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok) {
                await Swal.fire({
                    icon: 'error',
                    title: 'Lỗi...',
                    text: result.message || 'Slug đã tồn tại hoặc dữ liệu không hợp lệ',
                    confirmButtonColor: '#7f0019',
                });
                setLoading(false);
                return;
            }

            const productId = result.id as number;

            let hasUploadedImages = false;

            if (imageSource === 'file' && imageFiles.length > 0) {
                const mainIdx = Math.min(mainImageIndex, imageFiles.length - 1);
                const fd = new FormData();
                imageFiles.forEach((f) => fd.append('files', f));
                fd.append('main_index', String(mainIdx));

                const imgRes = await fetch(`${API_BASE}/products/${productId}/images`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: fd,
                });
                const imgJson = await imgRes.json().catch(() => ({}));
                if (!imgRes.ok) {
                    const msg = Array.isArray(imgJson?.message)
                        ? imgJson.message.join(', ')
                        : imgJson?.message || 'Không upload được ảnh';
                    await Swal.fire({
                        icon: 'warning',
                        title: 'Sản phẩm đã tạo',
                        text: `${msg}. Bạn có thể thêm ảnh khi sửa sản phẩm (ID: ${productId}).`,
                        confirmButtonColor: '#7f0019',
                    });
                    resetForm();
                    setLoading(false);
                    return;
                }
                hasUploadedImages = true;
            } else if (imageSource === 'url') {
                const urls = imageUrls
                    .split(/[\n,]+/)
                    .map((u) => u.trim())
                    .filter(Boolean);

                if (urls.length > 0) {
                    const imgRes = await fetch(`${API_BASE}/products/${productId}/image-urls`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ urls }),
                    });
                    const imgJson = await imgRes.json().catch(() => ({}));
                    if (!imgRes.ok) {
                        const msg = imgJson?.message || 'Không upload được link ảnh';
                        await Swal.fire({
                            icon: 'warning',
                            title: 'Sản phẩm đã tạo',
                            text: `${msg}. Bạn có thể thêm ảnh khi sửa sản phẩm (ID: ${productId}).`,
                            confirmButtonColor: '#7f0019',
                        });
                        resetForm();
                        setLoading(false);
                        return;
                    }
                    hasUploadedImages = true;
                }
            }

            await Swal.fire({
                icon: 'success',
                title: 'Thành công',
                text: hasUploadedImages
                    ? 'Sản phẩm và ảnh đã được lưu.'
                    : 'Sản phẩm đã được thêm. Bạn có thể bổ sung ảnh khi sửa sản phẩm.',
                timer: 2200,
                showConfirmButton: false,
            });

            resetForm();
        } catch (error) {
            setMessage({ type: 'error', text: 'Không thể kết nối đến server' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-product-container">
            {message && (
                <div className={`alert ${message.type}`}>{message.text}</div>
            )}

            <form onSubmit={handleSubmit} className="product-form">
                <div className="form-group">
                    <label>Tên sản phẩm</label>
                    <input type="text" name="name" value={formData.name} onChange={handleNameChange} required />
                </div>

                <div className="form-group">
                    <label>Slug (Đường dẫn)</label>
                    <input type="text" name="slug" value={formData.slug} onChange={handleChange} required />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Giá bán (VNĐ)</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            min="0"
                            step="1"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Số lượng</label>
                        <input
                            type="number"
                            name="stock"
                            value={formData.stock}
                            onChange={handleChange}
                            min="0"
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Danh mục</label>
                    <select name="category_id" value={formData.category_id} onChange={handleChange} required>
                        <option value="">-- Chọn danh mục --</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Mô tả chi tiết</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={5}
                    />
                </div>

                <div className="form-group image-selection-group">
                    <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>Hình ảnh sản phẩm</label>

                    {/* Radio buttons for selecting image source */}
                    <div className="image-source-options" style={{ display: 'flex', gap: '20px', marginBottom: '12px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px', whiteSpace: 'nowrap' }}>
                            <input
                                className='main-radio'
                                type="radio"
                                name="image_source"
                                value="file"
                                checked={imageSource === 'file'}
                                onChange={() => setImageSource('file')}
                            />
                            Sử dụng ảnh trên thiết bị
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px', whiteSpace: 'nowrap' }}>
                            <input
                                type="radio"
                                name="image_source"
                                value="url"
                                checked={imageSource === 'url'}
                                onChange={() => setImageSource('url')}
                            />
                            Sử dụng link ảnh
                        </label>
                    </div>

                    {imageSource === 'file' ? (
                        <>
                            <div className="file-input-container">
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="file-input-native"
                                    onChange={handleImagesChange}
                                />
                            </div>
                            <p className="field-hint" style={{ fontSize: '14px', color: '#333', marginTop: '6px', fontWeight: '500' }}>
                                Chọn một hoặc nhiều ảnh. Đánh dấu ảnh chính hiển thị trên danh sách.
                            </p>

                            {imageFiles.length > 0 && (
                                <div className="image-previews" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                                    {imageFiles.map((_, idx) => (
                                        <label key={`${previewUrls[idx]}-${idx}`} className="image-preview-card">
                                            <input
                                                type="radio"
                                                name="main_image"
                                                checked={mainImageIndex === idx}
                                                onChange={() => setMainImageIndex(idx)}
                                            />
                                            <img src={previewUrls[idx]} alt="" />
                                            {mainImageIndex === idx ? (
                                                <span className="preview-label main-image-label">Ảnh chính</span>
                                            ) : null}
                                        </label>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <textarea
                                value={imageUrls}
                                onChange={(e) => setImageUrls(e.target.value)}
                                rows={4}
                                placeholder="Nhập các link ảnh, cách nhau bằng dấu phẩy hoặc dòng mới..."
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    fontFamily: 'inherit',
                                    boxSizing: 'border-box'
                                }}
                            />
                            <p className="field-hint" style={{ fontSize: '14px', color: 'rgb(51, 51, 51)', fontWeight: 600, marginTop: '6px' }}>
                                Ảnh đầu tiên sẽ được chọn làm ảnh chính hiển thị trên danh sách.
                            </p>
                        </>
                    )}
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => {
                            resetForm();
                            setMessage(null);
                        }}
                    >
                        Hủy / Xóa form
                    </button>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Đang lưu...' : 'Lưu sản phẩm'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateProduct;
