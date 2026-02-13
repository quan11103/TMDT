import React, { useState } from 'react';
import './Pagination.css';

const Pagination: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1);

    const pages = [1, 2, 3, '...', 8, 9, 10];

    const handlePageClick = (page: number | string) => {
        if (typeof page === 'number') {
            setCurrentPage(page);
        }
    };

    const handlePrevious = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < 10) setCurrentPage(currentPage + 1);
    };

    return (
        <div className="pagination">
            <button className="btn-nav" onClick={handlePrevious}>
                ← Previous
            </button>
            <div className="page-numbers">
                {pages.map((page, index) => (
                    page === '...' ? (
                        <span key={index} className="pagination-dots">...</span>
                    ) : (
                        <button
                            key={index}
                            className={currentPage === page ? 'active' : ''}
                            onClick={() => handlePageClick(page)}
                        >
                            {page}
                        </button>
                    )
                ))}
            </div>
            <button className="btn-nav" onClick={handleNext}>
                Next →
            </button>
        </div>
    );
};

export default Pagination;