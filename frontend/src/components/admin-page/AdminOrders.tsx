import React from 'react';
import './AdminOrders.css';

const AdminOrders: React.FC = () => {
    const orders = [
        { id: '#MUJI1024', customer: 'Nguyễn Văn A', date: '04/03/2026', total: '1.250.000 ₫', status: 'Đang giao' },
        { id: '#MUJI1025', customer: 'Trần Thị B', date: '05/03/2026', total: '440.000 ₫', status: 'Hoàn thành' },
    ];

    return (
        <div className="admin-section">
            <h2 className="section-title mb-24">Quản lý đơn hàng</h2>
            <table className="muji-table">
                <thead>
                    <tr>
                        <th>Mã đơn</th>
                        <th>Khách hàng</th>
                        <th>Ngày đặt</th>
                        <th>Tổng tiền</th>
                        <th>Trạng thái</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(o => (
                        <tr key={o.id}>
                            <td>{o.id}</td>
                            <td className="font-medium">{o.customer}</td>
                            <td>{o.date}</td>
                            <td className="font-bold">{o.total}</td>
                            <td>
                                <span className={`status-badge ${o.status === 'Hoàn thành' ? 'success' : 'waiting'}`}>
                                    {o.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminOrders;