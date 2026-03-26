import React, { useState, useEffect } from 'react';
import type { CategoryData } from '../../types';
import Swal from 'sweetalert2';
import './CreateProduct.css';

interface ProductForm {
    name: string;
    slug: string;
    price: string; // Chuyển thành string để xử lý input mượt mà hơn
    category_id: string; // Chuyển thành string
    description: string;
    stock: string; // Chuyển thành string
}

const CreateProduct: React.FC = () => {
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [formData, setFormData] = useState<ProductForm>({
        name: '',
        slug: '',
        price: '', // Khởi tạo rỗng thay vì số 0
        category_id: '',
        description: '',
        stock: '', // Khởi tạo rỗng thay vì số 0
    });

    // 1. Lấy danh sách danh mục để đổ vào Select
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/categories'); // Điều chỉnh URL theo route của bạn
                const data = await response.json();
                setCategories(data);
            } catch (error) {
                console.error("Không thể tải danh mục:", error);
            }
        };
        fetchCategories();
    }, []);

    // 2. Tự động tạo slug khi nhập tên
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
        // Chấp nhận giá trị rỗng để người dùng có thể xóa trắng ô input
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // 3. Gửi dữ liệu tạo sản phẩm
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        // Chuyển đổi dữ liệu về dạng Number trước khi gửi lên API để khớp với DTO
        const payload = {
            ...formData,
            price: Number(formData.price),
            stock: Number(formData.stock),
            category_id: Number(formData.category_id)
        };

        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('http://localhost:3000/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (response.ok) {
                // Thông báo thành công dạng Toast (góc màn hình) cho nhẹ nhàng
                Swal.fire({
                    icon: 'success',
                    title: 'Thành công',
                    text: 'Sản phẩm đã được thêm vào hệ thống!',
                    timer: 2000,
                    showConfirmButton: false
                });

                setFormData({ name: '', slug: '', price: '', category_id: '', description: '', stock: '' });
            } else {
                // Thông báo lỗi dạng Modal
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi...',
                    text: result.message || 'Slug đã tồn tại hoặc dữ liệu không hợp lệ',
                    confirmButtonColor: '#7f0019'
                });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Không thể kết nối đến server' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-product-container">

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
                    <button type="button" className="btn-secondary">Hủy</button>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Đang lưu...' : 'Lưu sản phẩm'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateProduct;