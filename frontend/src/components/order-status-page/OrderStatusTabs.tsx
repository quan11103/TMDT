import React from 'react';
import './OrderStatusTabs.css';

// Định nghĩa props để nhận từ component cha
interface OrderStatusTabsProps {
    activeTab: string;
    onTabChange: (status: any) => void;
}

const OrderStatusTabs: React.FC<OrderStatusTabsProps> = ({ activeTab, onTabChange }) => {

    // Danh sách các tab tương ứng với enum trong Prisma
    const tabs = [
        { id: 'ALL', label: 'Tất cả' },
        { id: 'PENDING', label: 'Chờ xác nhận' },
        { id: 'CONFIRMED', label: 'Đã xác nhận' },
        { id: 'SHIPPING', label: 'Đang giao' },
        { id: 'DELIVERED', label: 'Đã giao' },
        { id: 'CANCELLED', label: 'Đã hủy' },
    ];

    return (
        <nav className="order-tabs-container">
            <ul className="tabs-list">
                {tabs.map((tab) => (
                    <li
                        key={tab.id}
                        className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => onTabChange(tab.id)}
                    >
                        {tab.label}
                        {/* Đường line chạy dưới khi tab active */}
                        {activeTab === tab.id && <div className="active-line" />}
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default OrderStatusTabs;