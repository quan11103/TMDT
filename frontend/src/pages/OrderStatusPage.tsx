import React, { useState, useEffect } from 'react';
import axios from 'axios';
import OrderStatusTabs from '../components/order-status-page/OrderStatusTabs';
import OrderCard from '../components/order-status-page/OrderCard';
import OrderDetailModal from '../components/order-status-page/OrderDetailModal';
import './OrderStatusPage.css';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { API_BASE } from '../lib/apiConfig';

export const OrderStatusEnum = {
    PENDING: "PENDING",
    CONFIRMED: "CONFIRMED",
    SHIPPING: "SHIPPING",
    DELIVERED: "DELIVERED",
    CANCELLED: "CANCELLED"
} as const;

export type OrderStatusType = typeof OrderStatusEnum[keyof typeof OrderStatusEnum];

const OrderStatus: React.FC = () => {
    const [activeTab, setActiveTab] = useState<OrderStatusType>(OrderStatusEnum.PENDING);
    const [allOrders, setAllOrders] = useState<any[]>([]); // Lưu toàn bộ đơn hàng
    const [filteredOrders, setFilteredOrders] = useState<any[]>([]); // Lưu đơn hàng sau khi lọc
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState<boolean>(true);

    const token = localStorage.getItem("access_token");

    const handleViewDetail = (order: any) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    // Lấy toàn bộ đơn hàng của khách hàng
    const fetchOrders = async () => {
        if (!token) return;
        setLoading(true);
        try {
            // Theo service của bạn, API này trả về orders của user hiện tại
            const response = await axios.get(`${API_BASE}/order/my`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAllOrders(response.data);
        } catch (err) {
            console.error("Lỗi khi tải đơn hàng:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // Logic lọc đơn hàng tại Client dựa trên activeTab
    useEffect(() => {
        const filtered = allOrders.filter(order => order.status === activeTab);
        setFilteredOrders(filtered);
    }, [activeTab, allOrders]);

    return (
        <>
            <Header />
            <div className="order-status-page">
                <div className="container">
                    <div className="order-header-title">
                        <h1 className="page-main-title">
                            Trạng thái đơn hàng
                            <span className="total-count">
                                {filteredOrders.length} đơn hàng
                            </span>
                        </h1>
                    </div>
                    <OrderStatusTabs
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                    />

                    <div className="order-list-wrapper">
                        {loading ? (
                            <div className="loading-state">
                                <div className="spinner"></div>
                                <p>Đang tải đơn hàng...</p>
                            </div>
                        ) : filteredOrders.length > 0 ? (
                            filteredOrders.map(order => (
                                <OrderCard
                                    key={order.id}
                                    order={order}
                                    onReload={fetchOrders} // Để component con gọi lại sau khi Hủy đơn
                                    handleViewDetail={handleViewDetail}
                                />
                            ))
                        ) : (
                            <div className="empty-order">
                                <p>Chưa có đơn hàng nào ở trạng thái này</p>
                            </div>
                        )}
                        <OrderDetailModal
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                            order={selectedOrder}
                        />
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default OrderStatus;