import React from 'react';
import './AdminSidebar.css';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const AdminSidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
    const menuItems = ['Tổng quan', 'Sản phẩm', 'Đơn hàng', 'Khách hàng', 'Danh mục', 'Banner', 'Khuyến mãi', 'Giao diện'];

    return (
        <aside className="admin-sidebar">
            <div className="sidebar-logo">
                <h2>MUJI ADMIN</h2>
            </div>

            <ul className="sidebar-menu">
                {menuItems.map((item) => (
                    <li
                        key={item}
                        className={`menu-item ${activeTab === item ? 'active' : ''}`}
                        onClick={() => setActiveTab(item)}
                    >
                        {item}
                    </li>
                ))}
            </ul>
        </aside>
    );
};

export default AdminSidebar;