import React, { useCallback, useMemo, useState } from 'react';
import type { Order } from '../../types';
import Swal from 'sweetalert2';
import './AdminOrders.css';
import { mediaUrl } from '../../lib/mediaUrl';

const API_BASE = 'http://localhost:3000/api';

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';

interface AdminOrder extends Order {
    address?: string;
    phone?: string;
    note?: string | null;
    discount_amount?: number;
    updated_at?: string;
    promotions?: { code: string } | null;
}

interface PaymentRow {
    method: string;
    status: string;
    paid_at?: string | null;
}

const AdminOrders: React.FC = () => {
    const [orders, setOrders] = useState<AdminOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [detailOrder, setDetailOrder] = useState<AdminOrder | null>(null);

    const token = useMemo(() => localStorage.getItem('access_token') || '', []);

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const response = await fetch(`${API_BASE}/order`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json().catch(() => null);
            if (!response.ok) {
                const msg = Array.isArray(data?.message) ? data.message.join(', ') : data?.message;
                setError(msg || 'Không tải được đơn hàng');
                setOrders([]);
                return;
            }
            setOrders(Array.isArray(data) ? data : []);
        } catch {
            setError('Lỗi kết nối');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, [token]);

    React.useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const parseApiError = async (response: Response) => {
        const data = await response.json().catch(() => ({}));
        const msg = Array.isArray(data?.message) ? data.message.join(', ') : data?.message;
        return msg || `Lỗi ${response.status}`;
    };

    const handleUpdateStatus = async (orderId: number, newStatus: OrderStatus) => {
        const isCancel = newStatus === 'CANCELLED';
        const result = await Swal.fire({
            title: isCancel ? 'Hủy đơn hàng?' : 'Cập nhật trạng thái',
            text: isCancel
                ? `Hủy đơn #${orderId}? Hệ thống sẽ hoàn tồn kho.`
                : `Chuyển đơn #${orderId} sang trạng thái mới?`,
            icon: isCancel ? 'warning' : 'question',
            showCancelButton: true,
            confirmButtonColor: '#7b0f1a',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Hủy bỏ',
        });

        if (!result.isConfirmed) return;

        try {
            setUpdatingId(orderId);
            const response = await fetch(`${API_BASE}/order/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                throw new Error(await parseApiError(response));
            }
            await Swal.fire({ icon: 'success', title: 'Đã cập nhật', timer: 1600, showConfirmButton: false });
            await fetchOrders();
            setDetailOrder((cur) => (cur?.id === orderId ? null : cur));
        } catch (e: unknown) {
            await Swal.fire('Lỗi', e instanceof Error ? e.message : 'Cập nhật thất bại', 'error');
        } finally {
            setUpdatingId(null);
        }
    };

    const formatPrice = (amount: number | string) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount));

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'PENDING':
                return { label: 'Chờ xử lý', class: 'waiting' };
            case 'CONFIRMED':
                return { label: 'Đã xác nhận', class: 'confirmed' };
            case 'SHIPPING':
                return { label: 'Đang giao', class: 'shipping' };
            case 'DELIVERED':
                return { label: 'Hoàn thành', class: 'success' };
            case 'CANCELLED':
                return { label: 'Đã hủy', class: 'danger' };
            default:
                return { label: status, class: '' };
        }
    };

    const paymentSummary = (o: AdminOrder) => {
        const list = (o.payments || []) as PaymentRow[];
        if (list.length === 0) return { label: '—', tagClass: 'tag-unknown' };
        const p = list[0];
        const method = String(p.method || '').toUpperCase();
        if (method === 'COD') return { label: 'COD', tagClass: 'tag-cod' };
        if (method === 'VNPAY') return { label: `VNPAY · ${p.status}`, tagClass: 'tag-vnpay' };
        return { label: method || '—', tagClass: 'tag-unknown' };
    };

    const actionsForStatus = (status: string): { label: string; next: OrderStatus; variant: string }[] => {
        switch (status) {
            case 'PENDING':
                return [
                    { label: 'Xác nhận', next: 'CONFIRMED', variant: 'confirm' },
                    { label: 'Hủy đơn', next: 'CANCELLED', variant: 'danger' },
                ];
            case 'CONFIRMED':
                return [
                    { label: 'Giao hàng', next: 'SHIPPING', variant: 'ship' },
                    { label: 'Hủy đơn', next: 'CANCELLED', variant: 'danger' },
                ];
            case 'SHIPPING':
                return [{ label: 'Hoàn thành', next: 'DELIVERED', variant: 'done' }];
            default:
                return [];
        }
    };

    return (
        <div className="admin-section">
            <div className="section-header admin-orders-header">
                <div>
                    <h2 className="section-title mb-24">Quản lý đơn hàng</h2>
                    <div className="order-count muted">Tổng số: {orders.length} đơn hàng</div>
                </div>
                <button type="button" className="btn-refresh" onClick={() => fetchOrders()} disabled={loading}>
                    {loading ? 'Đang tải…' : 'Làm mới'}
                </button>
            </div>

            {error && <div className="admin-orders-error">{error}</div>}

            {loading && orders.length === 0 ? (
                <div className="loading-state">Đang tải dữ liệu đơn hàng...</div>
            ) : (
                <div className="admin-orders-table-wrap">
                    <table className="muji-table">
                        <thead>
                            <tr>
                                <th>Mã</th>
                                <th>Ngày</th>
                                <th>Khách</th>
                                <th>SĐT</th>
                                <th>Thanh toán</th>
                                <th>Tổng</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="empty-cell">
                                        Chưa có đơn hàng.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((o) => {
                                    const statusInfo = getStatusConfig(o.status);
                                    const pay = paymentSummary(o);
                                    const actions = actionsForStatus(o.status);
                                    const discount = Number(o.discount_amount) || 0;

                                    return (
                                        <tr key={o.id}>
                                            <td className="order-id">#{o.id}</td>
                                            <td className="text-small muted">
                                                {o.created_at
                                                    ? new Date(o.created_at).toLocaleString('vi-VN', {
                                                          day: '2-digit',
                                                          month: '2-digit',
                                                          year: 'numeric',
                                                          hour: '2-digit',
                                                          minute: '2-digit',
                                                      })
                                                    : '—'}
                                            </td>
                                            <td className="customer">
                                                <div className="font-medium">{o.users?.full_name || '—'}</div>
                                                <div className="text-small muted">{o.users?.email || ''}</div>
                                            </td>
                                            <td className="text-small">{o.phone || '—'}</td>
                                            <td>
                                                <span className={`method-tag ${pay.tagClass}`}>{pay.label}</span>
                                            </td>
                                            <td className="price-cell">
                                                <div className="font-bold">{formatPrice(o.total_amount)}</div>
                                                {discount > 0 && (
                                                    <div className="text-small discount-line">
                                                        Giảm: −{formatPrice(discount)}
                                                        {o.promotions?.code && (
                                                            <span className="promo-code"> · {o.promotions.code}</span>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <span className={`status-badge ${statusInfo.class}`}>
                                                    {statusInfo.label}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="order-actions-cell">
                                                    <button
                                                        type="button"
                                                        className="btn-action ghost"
                                                        onClick={() => setDetailOrder(o)}
                                                    >
                                                        Chi tiết
                                                    </button>
                                                    {actions.map((a) => (
                                                        <button
                                                            key={a.next}
                                                            type="button"
                                                            className={`btn-action ${a.variant}`}
                                                            disabled={updatingId === o.id}
                                                            onClick={() => handleUpdateStatus(o.id, a.next)}
                                                        >
                                                            {a.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {detailOrder && (
                <div className="order-detail-overlay" role="dialog" aria-modal="true">
                    <div className="order-detail-modal">
                        <div className="order-detail-head">
                            <h3>Đơn #{detailOrder.id}</h3>
                            <button
                                type="button"
                                className="order-detail-close"
                                onClick={() => setDetailOrder(null)}
                                aria-label="Đóng"
                            >
                                ×
                            </button>
                        </div>
                        <div className="order-detail-body">
                            <p>
                                <strong>Trạng thái:</strong>{' '}
                                <span className={`status-badge ${getStatusConfig(detailOrder.status).class}`}>
                                    {getStatusConfig(detailOrder.status).label}
                                </span>
                            </p>
                            <p>
                                <strong>Khách:</strong> {detailOrder.users?.full_name} ({detailOrder.users?.email})
                            </p>
                            <p>
                                <strong>SĐT:</strong> {detailOrder.phone || '—'}
                            </p>
                            <p>
                                <strong>Địa chỉ:</strong> {detailOrder.address || '—'}
                            </p>
                            {detailOrder.note ? (
                                <p>
                                    <strong>Ghi chú:</strong> {detailOrder.note}
                                </p>
                            ) : null}
                            <p>
                                <strong>Tổng thanh toán:</strong> {formatPrice(detailOrder.total_amount)}
                            </p>
                            {Number(detailOrder.discount_amount) > 0 && (
                                <p className="discount-line">
                                    <strong>Giảm giá:</strong> −{formatPrice(detailOrder.discount_amount || 0)}
                                    {detailOrder.promotions?.code && (
                                        <span> (mã {detailOrder.promotions.code})</span>
                                    )}
                                </p>
                            )}
                            <h4 className="detail-items-title">Sản phẩm</h4>
                            <ul className="detail-items-list">
                                {(detailOrder.order_items || []).map((item: any) => {
                                    const img = item.products?.product_images?.[0]?.image_url;
                                    return (
                                        <li key={item.id} className="detail-item-row">
                                            {img && (
                                                <img
                                                    src={mediaUrl(img)}
                                                    alt=""
                                                    className="detail-item-thumb"
                                                />
                                            )}
                                            <div className="detail-item-meta">
                                                <span className="detail-item-name">{item.products?.name}</span>
                                                <span className="detail-item-qty">
                                                    ×{item.quantity} · {formatPrice(item.price_at_time)}
                                                </span>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                            <div className="order-detail-actions">
                                {actionsForStatus(detailOrder.status).map((a) => (
                                    <button
                                        key={a.next}
                                        type="button"
                                        className={`btn-action ${a.variant}`}
                                        disabled={updatingId === detailOrder.id}
                                        onClick={() => handleUpdateStatus(detailOrder.id, a.next)}
                                    >
                                        {a.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
