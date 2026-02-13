// AdminPage.tsx (Cập nhật)
import React, { useState } from 'react';
import Sidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import StatCard from '../components/admin/StatCard';
import OrderTable from '../components/admin/OrderTable';
import ProductList from '../components/admin/ProductList'; // Thêm mới
import OrderManagement from '../components/admin/OrderManagement'; // Thêm mới
import CustomerList from '../components/admin/CustomerList'; // Thêm mới
import AnalyticsView from '../components/admin/AnalyticsView'; // Thêm mới
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import './AdminPage.css';

const AdminPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('Dashboard');

    const renderContent = () => {
        switch (activeTab) {
            case 'Dashboard':
                return (
                    <>
                        <div className="stats-grid">
                            <StatCard label="Total Sales" value="$12,450" trend="+15%" isPositive />
                            <StatCard label="Total Orders" value="1,250" trend="+5%" isPositive />
                            <StatCard label="New Customers" value="320" trend="-2%" />
                        </div>
                        <OrderTable />
                    </>
                );
            case 'Products':
                return <ProductList />;
            case 'Orders':
                return <OrderManagement />;
            case 'Customers':
                return <CustomerList />;
            case 'Analytics':
                return <AnalyticsView />;
            default:
                return <OrderTable />;
        }
    };

    return (
        <>
            <Header />
            <div className="admin-layout">
                <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
                <main className="admin-content">
                    <AdminHeader title={activeTab} />
                    {renderContent()}
                </main>
            </div>
            <Footer />
        </>
    );
};

export default AdminPage;