import React, { useState, useEffect } from 'react';
import type { User } from '../../types';
import './AdminCustomers.css';

const AdminCustomers: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const response = await fetch('http://localhost:3000/api/users', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const result = await response.json();
                    // Vì Service trả về [data, total, page, limit]
                    // nên ta lấy phần tử đầu tiên (index 0)
                    setUsers(result[0]);
                }
            } catch (error) {
                console.error("Lỗi khi lấy danh sách người dùng:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    return (
        <div className="admin-section">
            <h2 className="section-title mb-24">Người dùng hệ thống</h2>

            {loading ? (
                <p>Đang tải danh sách người dùng...</p>
            ) : (
                <table className="muji-table">
                    <thead>
                        <tr>
                            <th>Họ tên</th>
                            <th>Email</th>
                            <th>Vai trò</th>
                            <th>Ngày tham gia</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id}>
                                <td className='font-medium'>
                                    <div className="customer-info">
                                        {u.full_name}
                                    </div>
                                </td>
                                <td>{u.email}</td>
                                <td>
                                    <span className="role-text">
                                        {u.roles?.role || 'User'}
                                    </span>
                                </td>
                                <td>{new Date(u.created_at).toLocaleDateString('vi-VN')}</td>
                                <td>
                                    <span className={`status-dot ${u.is_active ? 'active' : 'inactive'}`}>
                                        {u.is_active ? 'Đang hoạt động' : 'Bị khóa'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AdminCustomers;