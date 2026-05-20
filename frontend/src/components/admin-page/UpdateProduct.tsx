import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import type { CategoryData, ProductImage } from '../../types';
import './CreateProduct.css'; // Sử dụng chung file CSS với CreateProduct
import { API_BASE, apiUrl } from '../../lib/apiConfig';

interface UpdateProductProps {
    productId: number;
    onBack: () => void;
    onSuccess: () => void;
}

const UpdateProduct: React.FC<UpdateProductProps> = ({ productId, onBack, onSuccess }) => {
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        price: '',
        category_id: '',
        description: '',
        stock: '',
    });

    const [images, setImages] = useState<ProductImage[]>([]);
    const [showAddImage, setShowAddImage] = useState(false);
    const [imageSource, setImageSource] = useState<'file' | 'url'>('file');
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imageUrls, setImageUrls] = useState<string>('');

    // 1. Lấy thông tin sản phẩm và danh mục
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const [catRes, prodRes] = await Promise.all([
                    fetch(`${API_BASE}/categories`),
                    fetch(`${API_BASE}/products/${productId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);

                const categoriesData = await catRes.json();
                const productData = await prodRes.json();

                if (prodRes.ok) {
                    setFormData({
                        name: productData.name,
                        slug: productData.slug,
                        price: String(productData.price),
                        category_id: String(productData.category_id),
                        description: productData.description || '',
                        stock: String(productData.stock),
                    });
                    setImages(productData.product_images || []);
                }
                setCategories(categoriesData);
            } catch (error) {
                Swal.fire('Lỗi', 'Không thể tải dữ liệu sản phẩm', 'error');
            } finally {
                setFetching(false);
            }
        };
        fetchData();
    }, [productId]);

    // 2. Logic tạo slug tự động khi đổi tên
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        const slug = name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[đĐ]/g, "d")
            .replace(/([^0-9a-z-\s])/g, "")
            .replace(/(\s+)/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-+|-+$/g, "");

        setFormData({ ...formData, name, slug });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSetMainImage = async (imageId: number) => {
        // Giữ nguyên thứ tự ban đầu của danh sách ảnh, chỉ cập nhật thuộc tính is_main cục bộ trước
        const next = images.map(img => ({
            ...img,
            is_main: img.id === imageId
        }));
        setImages(next);

        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`${API_BASE}/products/${productId}/images/${imageId}/main`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) {
                Swal.fire('Lỗi', 'Không thể đặt ảnh chính', 'error');
                // Nếu lỗi, tải lại danh sách ảnh chính xác từ backend
                const prodRes = await fetch(`${API_BASE}/products/${productId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (prodRes.ok) {
                    const productData = await prodRes.json();
                    setImages(productData.product_images || []);
                }
            }
        } catch (e) {
            console.error('Lỗi khi đổi ảnh chính', e);
            Swal.fire('Lỗi', 'Lỗi kết nối server', 'error');
        }
    };

    const handleDeleteImage = async (imageId: number) => {
        const result = await Swal.fire({
            title: 'Xóa ảnh này?',
            text: 'Ảnh sẽ bị xóa khỏi sản phẩm!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#7f0019',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Hủy',
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('access_token');
                const response = await fetch(`${API_BASE}/products/${productId}/images/${imageId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    setImages(images.filter(img => img.id !== imageId));
                    Swal.fire('Thành công', 'Đã xóa ảnh', 'success');
                } else {
                    Swal.fire('Lỗi', 'Không thể xóa ảnh', 'error');
                }
            } catch (e) {
                Swal.fire('Lỗi', 'Lỗi kết nối server', 'error');
            }
        }
    };

    const handleAddImages = async () => {
        const token = localStorage.getItem('access_token');
        setLoading(true);
        try {
            if (imageSource === 'file' && imageFiles.length > 0) {
                const fd = new FormData();
                imageFiles.forEach(f => fd.append('files', f));
                const res = await fetch(`${API_BASE}/products/${productId}/images`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: fd,
                });
                if (res.ok) {
                    const newImages = await res.json();
                    setImages(newImages);
                    setShowAddImage(false);
                    setImageFiles([]);
                } else {
                    Swal.fire('Lỗi', 'Không thể thêm ảnh', 'error');
                }
            } else if (imageSource === 'url' && imageUrls.trim()) {
                const urls = imageUrls.split(/[\n,]+/).map(u => u.trim()).filter(Boolean);
                const res = await fetch(`${API_BASE}/products/${productId}/image-urls`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ urls })
                });
                if (res.ok) {
                    const newImages = await res.json();
                    setImages(newImages);
                    setShowAddImage(false);
                    setImageUrls('');
                } else {
                    Swal.fire('Lỗi', 'Không thể thêm ảnh', 'error');
                }
            }
        } catch (e) {
            Swal.fire('Lỗi', 'Lỗi kết nối server', 'error');
        } finally {
            setLoading(false);
        }
    };

    // 3. Gửi yêu cầu cập nhật
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            ...formData,
            price: Number(formData.price),
            stock: Number(formData.stock),
            category_id: Number(formData.category_id)
        };

        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_BASE}/products/${productId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (response.ok) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Cập nhật thành công',
                    timer: 2000,
                    showConfirmButton: false
                });
                onSuccess();
            } else {
                Swal.fire('Thất bại', result.message || 'Không thể cập nhật sản phẩm', 'error');
            }
        } catch (error) {
            Swal.fire('Lỗi', 'Lỗi kết nối server', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="loading-text">Đang tải thông tin sản phẩm...</div>;

    return (
        <div className="create-product-container"> {/* Dùng chung class container */}
            <form onSubmit={handleSubmit} className="product-form">
                <div className="form-group">
                    <label>Tên sản phẩm</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleNameChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Slug (Đường dẫn)</label>
                    <input
                        type="text"
                        name="slug"
                        value={formData.slug}
                        onChange={handleChange}
                        required
                    />
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
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Số lượng tồn kho</label>
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
                    <select
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleChange}
                        required
                    >
                        <option value="">-- Chọn danh mục --</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
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
                        placeholder="Nhập mô tả sản phẩm..."
                    ></textarea>
                </div>

                <div className="form-group image-selection-group">
                    <label className="group-label">Hình ảnh sản phẩm</label>
                    <p className="field-hint-danger" style={{ fontSize: '16px', color: '#7f0019', fontWeight: '600' }}>
                        * Lưu ý: Chọn 1 ảnh làm ảnh chính.
                    </p>

                    <div className="image-previews">
                        {images.map((img) => (
                            <div key={img.id} className="image-preview-card">
                                <img src={img.image_url.startsWith('http') ? img.image_url : apiUrl(img.image_url)} alt="" />

                                <div className="radio-container">
                                    <input
                                        type="radio"
                                        name="main_image"
                                        checked={img.is_main}
                                        onChange={() => handleSetMainImage(img.id)}
                                        title="Chọn làm ảnh chính"
                                    />
                                </div>
                                {img.is_main && (
                                    <span className="preview-label main-image-label">Ảnh chính</span>
                                )}
                                <button
                                    type="button"
                                    onClick={() => handleDeleteImage(img.id)}
                                    className="btn-delete-img"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}

                        <div
                            className="image-preview-card add-new"
                            onClick={() => setShowAddImage(true)}
                        >
                            <span>+</span>
                            <span className="preview-label">Thêm ảnh</span>
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={onBack}>
                        Hủy bỏ
                    </button>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Đang cập nhật...' : 'Cập nhật sản phẩm'}
                    </button>
                </div>
            </form>

            {showAddImage && (
                <div className="image-upload-modal-overlay" role="dialog" aria-modal="true">
                    <div className="image-upload-modal">
                        <div className="image-upload-modal-head">
                            <h3>Thêm ảnh mới</h3>
                            <button
                                type="button"
                                className="image-upload-modal-close"
                                onClick={() => setShowAddImage(false)}
                                aria-label="Đóng"
                            >
                                ×
                            </button>
                        </div>
                        <div className="image-upload-modal-body">
                            <div className="image-source-options">
                                <label>
                                    <input
                                        type="radio"
                                        name="update_image_source"
                                        value="file"
                                        checked={imageSource === 'file'}
                                        onChange={() => setImageSource('file')}
                                    />
                                    Sử dụng ảnh trên thiết bị
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="update_image_source"
                                        value="url"
                                        checked={imageSource === 'url'}
                                        onChange={() => setImageSource('url')}
                                    />
                                    Sử dụng link ảnh
                                </label>
                            </div>

                            {imageSource === 'file' ? (
                                <div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="file-input-native"
                                        onChange={(e) => setImageFiles(e.target.files ? Array.from(e.target.files) : [])}
                                    />
                                    {imageFiles.length > 0 && (
                                        <p className="field-hint">
                                            Đã chọn {imageFiles.length} file.
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <textarea
                                    value={imageUrls}
                                    onChange={(e) => setImageUrls(e.target.value)}
                                    rows={4}
                                    placeholder="Nhập các link ảnh, cách nhau bằng dấu phẩy hoặc dòng mới..."
                                />
                            )}

                            <div className="image-upload-modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowAddImage(false)}>
                                    Hủy
                                </button>
                                <button type="button" className="btn-primary" onClick={handleAddImages} disabled={loading}>
                                    {loading ? 'Đang tải lên...' : 'Tải lên'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UpdateProduct;