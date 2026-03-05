import React from 'react';
import CategorySidebar from './CategorySidebar';
import CategoryMain from './CategoryMain';
import './CategoryPageContainer.css';

const CategoryPageContainer: React.FC = () => {
    return (
        <div className="category-page-container">
            {/* CỘT 1: SIDEBAR (Bên trái) */}
            <aside className="page-sidebar">
                <CategorySidebar />
            </aside>

            {/* CỘT 2: MAIN CONTENT (Bên phải) */}
            <main className="page-main">
                <CategoryMain />
            </main>
        </div>
    );
};

export default CategoryPageContainer;