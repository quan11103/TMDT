import React, { useState, useEffect } from 'react';
import type { ProductDetail } from '../../types';
import Swal from 'sweetalert2';
import CreateProduct from './CreateProduct';
import UpdateProduct from './UpdateProduct';
import './AdminProducts.css';

const AdminProducts: React.FC = () => {
    const [products, setProducts] = useState<ProductDetail[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:3000/api/products?limit=50');
            const result = await response.json();

            if (response.ok) {
                setProducts(result.data);
            }
        } catch (error) {
            console.error("Lỗi khi tải sản phẩm:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id: number, name: string) => {
        const result = await Swal.fire({
            title: 'Bạn có chắc chắn?',
            text: `Sản phẩm "${name}" sẽ bị ẩn khỏi cửa hàng!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#7f0019', // Màu đỏ Muji
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Hủy',
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('access_token');
                const response = await fetch(`http://localhost:3000/api/products/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    // Thông báo thành công
                    Swal.fire({
                        title: 'Đã ẩn!',
                        text: 'Sản phẩm đã chuyển sang trạng thái ngưng hoạt động.',
                        icon: 'success',
                        confirmButtonColor: '#7f0019'
                    });
                    setProducts(products.filter(p => p.id !== id));
                } else {
                    Swal.fire('Lỗi!', 'Không thể xóa sản phẩm này.', 'error');
                }
            } catch (error) {
                Swal.fire('Lỗi!', 'Đã xảy ra lỗi kết nối.', 'error');
            }
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    if (showCreateForm) {
        return (
            <div className="admin-section">
                <div className="section-header">
                    <h2 className="section-title">Thêm sản phẩm mới</h2>
                    <button
                        className="btn-secondary"
                        onClick={() => {
                            setShowCreateForm(false);
                            fetchProducts(); // Refresh danh sách khi quay lại
                        }}
                    >
                        Quay lại danh sách
                    </button>
                </div>
                <CreateProduct />
            </div>
        );
    }

    if (editingId) {
        return (
            <div className="admin-section">
                <div className="section-header">
                    <h2 className="section-title">Sửa đổi sản phẩm</h2>
                    <button
                        className="btn-secondary"
                        onClick={() => {
                            setEditingId(null);
                            fetchProducts(); // Refresh danh sách khi quay lại
                        }}
                    >
                        Quay lại danh sách
                    </button>
                </div>
                <UpdateProduct
                    productId={editingId}
                    onBack={() => setEditingId(null)}
                    onSuccess={() => {
                        setEditingId(null);
                        fetchProducts();
                    }}
                />
            </div>
        );
    }

    return (
        <div className="admin-section">
            <div className="section-header">
                <h2 className="section-title">Danh sách sản phẩm</h2>
                <button
                    className="btn-primary"
                    onClick={() => setShowCreateForm(true)}
                >
                    Thêm sản phẩm mới
                </button>
            </div>

            {loading ? (
                <div className="loading-text">Đang tải dữ liệu...</div>
            ) : (
                <table className="muji-table">
                    <thead>
                        <tr>
                            <th>Tên sản phẩm</th>
                            <th>Danh mục</th>
                            <th>Giá bán</th>
                            <th>Tồn kho</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length > 0 ? (
                            products.map(p => (
                                <tr key={p.id}>
                                    <td className="font-medium">{p.name}</td>
                                    <td className='category'>{p.categories?.name || 'Chưa phân loại'}</td>
                                    <td className="price">{formatCurrency(p.price)}</td>
                                    <td className="stock">{p.stock}</td>
                                    <td className="table-actions">
                                        <span
                                            className="action-badge edit"
                                            onClick={() => setEditingId(p.id)}
                                        >
                                            Sửa
                                        </span>
                                        <span
                                            className="action-badge delete"
                                            onClick={() => handleDelete(p.id, p.name)}
                                        >
                                            Xóa
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center' }}>Không có sản phẩm nào.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AdminProducts;