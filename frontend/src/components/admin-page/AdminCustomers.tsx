import React from 'react';
import './AdminCustomers.css';

const AdminCustomers: React.FC = () => {
    const customers = [
        { id: 1, name: 'Lê Minh C', email: 'minhc@gmail.com', orders: 12, spent: '5.400.000 ₫' },
        { id: 2, name: 'Phạm Thu D', email: 'thud@outlook.com', orders: 5, spent: '2.100.000 ₫' },
    ];

    return (
        <div className="admin-section">
            <h2 className="section-title mb-24">Khách hàng thành viên</h2>
            <table className="muji-table">
                <thead>
                    <tr>
                        <th>Họ tên</th>
                        <th>Email</th>
                        <th>Số đơn hàng</th>
                        <th>Tổng chi tiêu</th>
                    </tr>
                </thead>
                <tbody>
                    {customers.map(c => (
                        <tr key={c.id}>
                            <td className='font-medium'>
                                <div className="customer-info">
                                    <div className="avatar-small"></div>
                                    {c.name}
                                </div>
                            </td>
                            <td>{c.email}</td>
                            <td>{c.orders}</td>
                            <td className='spent'>{c.spent}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminCustomers;