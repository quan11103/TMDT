import React from 'react';
import './Pagination.css';

interface PaginationProps {
    current: number;
    total: number;
    onChange?: (page: number) => void; // Hàm báo lên cha để gọi API mới
}

const Pagination: React.FC<PaginationProps> = ({ current, total, onChange }) => {
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];

        if (!total || total <= 0) return [];

        if (total <= 7) {
            for (let i = 1; i <= total; i++) pages.push(i);
        } else {
            // Luôn hiện trang 1
            pages.push(1);

            if (current > 3) pages.push('...');

            // Các trang xung quanh trang hiện tại
            const start = Math.max(2, current - 1);
            const end = Math.min(total - 1, current + 1);
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (current < total - 2) pages.push('...');

            // Luôn hiện trang cuối
            if (total > 1) pages.push(total);
        }
        return pages;
    };

    if (!total || total <= 1) {
        return null;
    }

    const handlePageClick = (page: number | string) => {
        if (typeof page === 'number' && page !== current) {
            onChange?.(page);
        }
    };

    const handlePrevious = () => {
        if (current > 1) onChange?.(current - 1);
    };

    const handleNext = () => {
        if (current < total) onChange?.(current + 1);
    };

    // Nếu chỉ có 1 trang thì không cần hiện phân trang
    if (total <= 1) return null;

    return (
        <div className="pagination">
            <button
                className="btn-nav"
                onClick={handlePrevious}
                disabled={current === 1}
            >
                ← Previous
            </button>

            <div className="page-numbers">
                {getPageNumbers().map((page, index) => (
                    page === '...' ? (
                        <span key={`dots-${index}`} className="pagination-dots">...</span>
                    ) : (
                        <button
                            key={page}
                            className={current === page ? 'active' : ''}
                            onClick={() => handlePageClick(page)}
                        >
                            {page}
                        </button>
                    )
                ))}
            </div>

            <button
                className="btn-nav"
                onClick={handleNext}
                disabled={current === total}
            >
                Next →
            </button>
        </div>
    );
};

export default Pagination;