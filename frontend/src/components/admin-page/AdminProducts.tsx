import React from 'react';
import './AdminProducts.css';

const AdminProducts: React.FC = () => {
    const products = [
        { id: 1, name: 'Sổ tay kế hoạch A5', category: 'Văn phòng phẩm', price: '244.000 ₫', stock: 125 },
        { id: 2, name: 'Bút bi gel 0.5mm', category: 'Văn phòng phẩm', price: '25.000 ₫', stock: 500 },
        { id: 3, name: 'Hộp Mica 2 hộc kéo', category: 'Đồ gia dụng', price: '440.000 ₫', stock: 12 },
    ];

    return (
        <div className="admin-section">
            <div className="section-header">
                <h2 className="section-title">Danh sách sản phẩm</h2>
                <button className="btn-primary">Thêm sản phẩm</button>
            </div>

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
                    {products.map(p => (
                        <tr key={p.id}>
                            <td className="font-medium">{p.name}</td>
                            <td className='category'>{p.category}</td>
                            <td className="price">{p.price}</td>
                            <td className="stock">{p.stock}</td>
                            {/* PHẦN CHỈNH SỬA Ở ĐÂY */}
                            <td className="table-actions">
                                <span className="action-badge edit">Sửa</span>
                                <span className="action-badge delete">Xóa</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminProducts;