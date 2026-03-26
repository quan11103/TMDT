import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import type { CategoryData } from '../../types';
import './CreateProduct.css'; // Sử dụng chung file CSS với CreateProduct

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

    // 1. Lấy thông tin sản phẩm và danh mục
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const [catRes, prodRes] = await Promise.all([
                    fetch('http://localhost:3000/api/categories'),
                    fetch(`http://localhost:3000/api/products/${productId}`, {
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
            const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
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

                <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={onBack}>
                        Hủy bỏ
                    </button>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Đang cập nhật...' : 'Cập nhật sản phẩm'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UpdateProduct;