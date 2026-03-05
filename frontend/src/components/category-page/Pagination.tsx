import React from 'react';
import './Pagination.css';

const Pagination: React.FC = () => {
    return (
        <nav className="pagination-container">
            <ul className="pagination-list">
                {/* Nút Trước - Trạng thái Disabled */}
                <li className="page-item disabled">
                    <button className="page-btn prev-next">
                        <svg className="mobile-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"></path></svg>
                        <span className="desktop-text">Trước</span>
                    </button>
                </li>

                {/* Nội dung các số trang */}
                <div className="pagination-numbers">
                    <li className="page-item active">
                        <button className="page-btn">1</button>
                    </li>
                    <li className="page-item">
                        <button className="page-btn">2</button>
                    </li>
                    <li className="page-item ellipsis">
                        <span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                        </span>
                    </li>
                    <li className="page-item">
                        <button className="page-btn">14</button>
                    </li>
                </div>

                {/* Nút Sau - Trạng thái Active */}
                <li className="page-item">
                    <button className="page-btn prev-next">
                        <span className="desktop-text">Sau</span>
                        <svg className="mobile-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"></path></svg>
                    </button>
                </li>
            </ul>
        </nav>
    );
};

export default Pagination;