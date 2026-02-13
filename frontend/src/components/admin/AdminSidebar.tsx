// Sidebar.tsx
import React from 'react';
import './AdminSidebar.css';

const menuItems = ['Dashboard', 'Products', 'Orders', 'Customers', 'Analytics'];

const Sidebar: React.FC<{ activeTab: string; onTabChange: (tab: string) => void }> = ({ activeTab, onTabChange }) => {
    return (
        <aside className="admin-sidebar">
            <nav className="admin-nav">
                {menuItems.map((item) => (
                    <div
                        key={item}
                        className={`nav-item ${activeTab === item ? 'active' : ''}`}
                        onClick={() => onTabChange(item)}
                    >
                        {item}
                    </div>
                ))}
            </nav>
            <div className="nav-item logout">
                <span className="nav-icon red"></span> Log Out
            </div>
        </aside>
    );
};

export default Sidebar;