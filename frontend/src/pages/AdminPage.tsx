import React, { useState } from 'react';
import AdminSidebar from '../components/admin-page/AdminSidebar';
import AdminHeader from '../components/admin-page/AdminHeader';
import AdminDashboard from '../components/admin-page/AdminDashboard';
import AdminProducts from '../components/admin-page/AdminProducts';
import AdminOrders from '../components/admin-page/AdminOrders';
import AdminCustomers from '../components/admin-page/AdminCustomers';
import AdminCategories from '../components/admin-page/AdminCategories';
import AdminBanner from '../components/admin-page/AdminBanner';
import AdminPromotions from '../components/admin-page/AdminPromotions';
import AdminUI from '../components/admin-page/AdminUI';
import './AdminPage.css';

const AdminLayout: React.FC = () => {
    // Quản lý trạng thái menu đang được chọn (mặc định là 'Tổng quan')
    const [activeTab, setActiveTab] = useState('Tổng quan');

    // Hàm render nội dung dựa trên tab đang hoạt động
    const renderContent = () => {
        switch (activeTab) {
            case 'Tổng quan': return <AdminDashboard />;
            case 'Sản phẩm': return <AdminProducts />;
            case 'Đơn hàng': return <AdminOrders />;
            case 'Khách hàng': return <AdminCustomers />;
            case 'Danh mục': return <AdminCategories />;
            case 'Banner': return <AdminBanner />;
            case 'Khuyến mãi': return <AdminPromotions />;
            case 'Giao diện': return <AdminUI />;
            default: return <AdminDashboard />;
        }
    };

    return (
        <div className="admin-layout">
            {/* Truyền tab hiện tại và hàm thay đổi tab vào Sidebar */}
            <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="admin-main">
                {/* Truyền tiêu đề vào Header để hiển thị đúng tên trang */}
                <AdminHeader title={activeTab} />

                <main className="admin-content">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;