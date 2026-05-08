import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { User } from '../../types';
import './AdminCustomers.css';
import { API_BASE } from '../../lib/apiConfig';

const PAGE_SIZE = 15;

const AdminCustomers: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [detailUser, setDetailUser] = useState<User | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const token = useMemo(() => localStorage.getItem('access_token') || '', []);

    const parseApiError = async (response: Response) => {
        const data = await response.json().catch(() => ({}));
        const msg = Array.isArray(data?.message) ? data.message.join(', ') : data?.message;
        return msg || `Lỗi ${response.status}`;
    };

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const response = await fetch(
                `${API_BASE}/users?page=${page}&limit=${PAGE_SIZE}`,
                { headers: { Authorization: `Bearer ${token}` } },
            );
            if (!response.ok) {
                setError(await parseApiError(response));
                setUsers([]);
                setTotal(0);
                return;
            }
            const raw = await response.json();
            const list = Array.isArray(raw) && raw.length >= 2 ? raw[0] : raw;
            const count = Array.isArray(raw) && raw.length >= 2 ? raw[1] : 0;
            setUsers(Array.isArray(list) ? list : []);
            setTotal(typeof count === 'number' ? count : 0);
        } catch {
            setError('Lỗi kết nối');
            setUsers([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, [token, page]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const openDetail = async (id: number) => {
        setDetailLoading(true);
        setDetailUser(null);
        try {
            const response = await fetch(`${API_BASE}/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) {
                setError(await parseApiError(response));
                return;
            }
            const u = await response.json();
            setDetailUser(u as User);
        } catch {
            setError('Không tải được chi tiết khách hàng');
        } finally {
            setDetailLoading(false);
        }
    };

    const formatDate = (iso?: string | null) => {
        if (!iso) return '—';
        const d = new Date(iso);
        return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('vi-VN');
    };

    const formatDob = (iso?: string | null) => {
        if (!iso) return '—';
        const d = new Date(iso);
        return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('vi-VN');
    };

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    return (
        <div className="admin-section admin-customers">
            <div className="admin-customers-header">
                <div>
                    <h2 className="section-title">Khách hàng</h2>
                    <p className="admin-customers-sub">
                        {total > 0
                            ? `Tổng ${total} tài khoản — trang ${page}/${totalPages}`
                            : 'Danh sách tài khoản đăng ký trên hệ thống'}
                    </p>
                </div>
                <button
                    type="button"
                    className="btn-refresh-customers"
                    onClick={() => fetchUsers()}
                    disabled={loading}
                >
                    Làm mới
                </button>
            </div>

            {error ? <div className="admin-customers-error">{error}</div> : null}

            {loading ? (
                <p className="loading-text">Đang tải danh sách…</p>
            ) : users.length === 0 ? (
                <p className="admin-customers-empty">Chưa có khách hàng hoặc không có quyền xem.</p>
            ) : (
                <>
                    <div className="admin-customers-table-wrap">
                        <table className="muji-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Họ tên</th>
                                    <th>Email</th>
                                    <th>Số điện thoại</th>
                                    <th>Vai trò</th>
                                    <th>Đơn hàng</th>
                                    <th>Ngày tham gia</th>
                                    <th>Trạng thái</th>
                                    <th />
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.id}>
                                        <td>{u.id}</td>
                                        <td className="font-medium">
                                            <div className="customer-info">
                                                {u.full_name?.trim() || '—'}
                                            </div>
                                        </td>
                                        <td>{u.email}</td>
                                        <td>{u.phone?.trim() || '—'}</td>
                                        <td>
                                            <span className="role-text">
                                                {u.roles?.role || 'User'}
                                            </span>
                                        </td>
                                        <td>{u._count?.orders ?? '—'}</td>
                                        <td>{formatDate(u.created_at)}</td>
                                        <td>
                                            <span
                                                className={`status-dot ${u.is_active ? 'active' : 'inactive'}`}
                                            >
                                                {u.is_active ? 'Hoạt động' : 'Khóa'}
                                            </span>
                                        </td>
                                        <td className="customer-actions-cell">
                                            <button
                                                type="button"
                                                className="btn-customer-detail"
                                                onClick={() => openDetail(u.id)}
                                            >
                                                Chi tiết
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 ? (
                        <div className="admin-customers-pagination">
                            <button
                                type="button"
                                className="btn-page"
                                disabled={page <= 1 || loading}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                            >
                                Trước
                            </button>
                            <span className="page-indicator">
                                {page} / {totalPages}
                            </span>
                            <button
                                type="button"
                                className="btn-page"
                                disabled={page >= totalPages || loading}
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            >
                                Sau
                            </button>
                        </div>
                    ) : null}
                </>
            )}

            {(detailUser || detailLoading) && (
                <div
                    className="customer-detail-overlay"
                    role="presentation"
                    onClick={() => !detailLoading && setDetailUser(null)}
                >
                    <div
                        className="customer-detail-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="customer-detail-title"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="customer-detail-head">
                            <h3 id="customer-detail-title">
                                {detailLoading ? 'Đang tải…' : `Khách hàng #${detailUser?.id}`}
                            </h3>
                            <button
                                type="button"
                                className="customer-detail-close"
                                aria-label="Đóng"
                                onClick={() => setDetailUser(null)}
                                disabled={detailLoading}
                            >
                                ×
                            </button>
                        </div>
                        <div className="customer-detail-body">
                            {detailLoading ? (
                                <p>Đang tải thông tin…</p>
                            ) : detailUser ? (
                                <>
                                    <p>
                                        <strong>Họ tên:</strong>{' '}
                                        {detailUser.full_name?.trim() || '—'}
                                    </p>
                                    <p>
                                        <strong>Email:</strong> {detailUser.email}
                                    </p>
                                    <p>
                                        <strong>Số điện thoại:</strong>{' '}
                                        {detailUser.phone?.trim() || '—'}
                                    </p>
                                    <p>
                                        <strong>Vai trò:</strong>{' '}
                                        {detailUser.roles?.role || '—'}
                                    </p>
                                    <p>
                                        <strong>Ngày sinh:</strong> {formatDob(detailUser.dob)}
                                    </p>
                                    <p>
                                        <strong>Giới tính:</strong>{' '}
                                        {detailUser.gender?.trim() || '—'}
                                    </p>
                                    <p>
                                        <strong>Số đơn đã đặt:</strong>{' '}
                                        {detailUser._count?.orders ?? '—'}
                                    </p>
                                    <p>
                                        <strong>Tham gia:</strong>{' '}
                                        {formatDate(detailUser.created_at)}
                                    </p>
                                    <p>
                                        <strong>Cập nhật:</strong>{' '}
                                        {formatDate(detailUser.updated_at)}
                                    </p>
                                    <p>
                                        <strong>Trạng thái:</strong>{' '}
                                        {detailUser.is_active ? 'Đang hoạt động' : 'Đã khóa'}
                                    </p>
                                </>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCustomers;
