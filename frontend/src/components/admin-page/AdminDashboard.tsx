import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';
import { API_BASE } from '../../lib/apiConfig';

interface RevenueByDay {
    date: string;
    revenue: number;
    orders: number;
}

interface DashboardStats {
    revenue: {
        total: number;
        total_discount: number;
        today: number;
        this_month: number;
        by_day: RevenueByDay[];
    };
    orders: {
        by_status: Record<string, number>;
    };
    payments: Array<{ status: string; count: number; amount: number }>;
    recent_orders: Array<{
        id: number;
        total_amount: number;
        status: string;
        created_at: string | null;
        customer_name: string;
    }>;
    top_products: Array<{
        product_id: number;
        name: string;
        stock: number;
        quantity_sold: number;
    }>;
}

const ORDER_STATUS_LABELS: Record<string, string> = {
    PENDING: 'Chờ xử lý',
    CONFIRMED: 'Đã xác nhận',
    SHIPPING: 'Đang giao',
    DELIVERED: 'Đã giao',
    CANCELLED: 'Đã hủy',
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
    PENDING: 'Chờ thanh toán',
    SUCCESS: 'Thành công',
    FAILED: 'Thất bại',
    REFUNDED: 'Hoàn tiền',
};

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);

const formatDate = (iso: string | null) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const formatShortDate = (iso: string) => {
    const [, month, day] = iso.split('-');
    return `${day}/${month}`;
};

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const res = await fetch(`${API_BASE}/admin/dashboard`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) {
                    throw new Error('Không tải được dữ liệu tổng quan');
                }
                const data: DashboardStats = await res.json();
                setStats(data);
            } catch (err) {
                console.error('Lỗi khi lấy dữ liệu dashboard:', err);
                setError('Không thể tải dữ liệu tổng quan. Vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const maxDayRevenue = stats
        ? Math.max(...stats.revenue.by_day.map((d) => d.revenue), 1)
        : 1;

    const revenueCards = stats
        ? [
              { label: 'Tổng doanh thu', value: formatCurrency(stats.revenue.total) },
              { label: 'Doanh thu hôm nay', value: formatCurrency(stats.revenue.today) },
              { label: 'Doanh thu tháng này', value: formatCurrency(stats.revenue.this_month) },
              { label: 'Tổng giảm giá', value: formatCurrency(stats.revenue.total_discount) },
          ]
        : [];

    return (
        <div className="dashboard-container">
            <h2 className="dashboard-title">Tổng quan hệ thống</h2>

            {loading && <p className="dashboard-loading">Đang tải dữ liệu...</p>}
            {error && <p className="dashboard-error">{error}</p>}

            {!loading && stats && (
                <>
                    <div className="dashboard-row dashboard-row--panels">
                        <section className="dashboard-panel">
                            <h3 className="section-title">Doanh thu 7 ngày gần nhất</h3>
                            <div className="revenue-chart">
                                {stats.revenue.by_day.map((day) => (
                                    <div key={day.date} className="revenue-chart__col">
                                        <div
                                            className="revenue-chart__bar"
                                            style={{
                                                height: `${Math.max(4, (day.revenue / maxDayRevenue) * 100)}%`,
                                            }}
                                            title={`${formatCurrency(day.revenue)} · ${day.orders} đơn`}
                                        />
                                        <span className="revenue-chart__label">{formatShortDate(day.date)}</span>
                                        <span className="revenue-chart__orders">{day.orders} đơn</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="dashboard-panel">
                            <h3 className="section-title">Trạng thái đơn hàng</h3>
                            <ul className="status-list">
                                {Object.entries(stats.orders.by_status).map(([status, count]) => (
                                    <li key={status} className="status-list__item">
                                        <span className={`status-badge status-badge--${status.toLowerCase()}`}>
                                            {ORDER_STATUS_LABELS[status] ?? status}
                                        </span>
                                        <span className="status-list__count">{count}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        <section className="dashboard-panel">
                            <h3 className="section-title">Thanh toán</h3>
                            <ul className="status-list">
                                {stats.payments.length === 0 ? (
                                    <li className="status-list__empty">Chưa có giao dịch</li>
                                ) : (
                                    stats.payments.map((p) => (
                                        <li key={p.status} className="status-list__item">
                                            <span>{PAYMENT_STATUS_LABELS[p.status] ?? p.status}</span>
                                            <span className="status-list__meta">
                                                {p.count} · {formatCurrency(p.amount)}
                                            </span>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </section>
                    </div>

                    <div className="dashboard-row dashboard-row--stats">
                        {revenueCards.map((card) => (
                            <div key={card.label} className="stat-card">
                                <span className="stat-label">{card.label}</span>
                                <h3 className="stat-value">{card.value}</h3>
                            </div>
                        ))}
                    </div>

                    <div className="dashboard-row dashboard-row--tables">
                        <section className="dashboard-panel dashboard-panel--wide">
                            <h3 className="section-title">Đơn hàng mới nhất</h3>
                            <div className="table-wrap">
                                <table className="dashboard-table">
                                    <thead>
                                        <tr>
                                            <th>Mã</th>
                                            <th>Khách hàng</th>
                                            <th>Trạng thái</th>
                                            <th>Tổng tiền</th>
                                            <th>Thời gian</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.recent_orders.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="table-empty">
                                                    Chưa có đơn hàng
                                                </td>
                                            </tr>
                                        ) : (
                                            stats.recent_orders.map((order) => (
                                                <tr key={order.id}>
                                                    <td>#{order.id}</td>
                                                    <td>{order.customer_name}</td>
                                                    <td>
                                                        <span
                                                            className={`status-badge status-badge--${order.status.toLowerCase()}`}
                                                        >
                                                            {ORDER_STATUS_LABELS[order.status] ?? order.status}
                                                        </span>
                                                    </td>
                                                    <td>{formatCurrency(order.total_amount)}</td>
                                                    <td>{formatDate(order.created_at)}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section className="dashboard-panel">
                            <h3 className="section-title">Sản phẩm bán chạy</h3>
                            <ul className="top-products-list">
                                {stats.top_products.length === 0 ? (
                                    <li className="status-list__empty">Chưa có dữ liệu bán hàng</li>
                                ) : (
                                    stats.top_products.map((p, i) => (
                                        <li key={p.product_id} className="top-products-list__item">
                                            <span className="top-products-list__rank">{i + 1}</span>
                                            <div className="top-products-list__info">
                                                <span className="top-products-list__name">{p.name}</span>
                                                <span className="top-products-list__meta">
                                                    Đã bán: {p.quantity_sold} · Kho: {p.stock}
                                                </span>
                                            </div>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </section>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminDashboard;
