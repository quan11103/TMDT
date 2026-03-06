import React from 'react';
import './ProductReviews.css';

interface Review {
    id: number;
    userName: string;
    date: string;
    rating: number;
    comment: string;
    avatarClass: string;
}

const reviewsData: Review[] = [
    {
        id: 1,
        userName: "Nguyễn Bảo Nhi",
        date: "2025-06-20",
        rating: 5,
        comment: "Mua để mang đi thi viết cho rõ chữ",
        avatarClass: "avatar-female"
    },
    {
        id: 2,
        userName: "Trần Nguyên Khang",
        date: "2025-03-26",
        rating: 5,
        comment: "Bút sài rất sướng và xịn",
        avatarClass: "avatar-male"
    }
];

const ProductReviews: React.FC = () => {
    // Hàm hiển thị sao dựa trên số điểm
    const renderStars = (rating: number) => {
        return (
            <div className="star-rating">
                {[...Array(5)].map((_, i) => (
                    <span key={i} className={`star ${i < rating ? 'filled' : ''}`}>★</span>
                ))}
            </div>
        );
    };

    return (
        <div className="product-reviews-container">
            {/* Tiêu đề và Tổng kết điểm */}
            <div className="reviews-header">
                <h3 className="reviews-title">
                    Đánh giá <span className="count">(2)</span>
                </h3>

                <div className="summary-rating">
                    {renderStars(5)}
                    <strong className="score-text">
                        5.0 <span className="max-score">/ 5</span>
                    </strong>
                </div>
            </div>

            {/* Danh sách các bài đánh giá */}
            <div className="reviews-list">
                {reviewsData.map((review) => (
                    <div key={review.id} className="review-card">
                        <div className="user-section">
                            <div className={`user-avatar ${review.avatarClass}`}></div>
                            <div className="user-meta">
                                <strong className="user-name">{review.userName}</strong>
                                <span className="review-date">{review.date}</span>
                            </div>
                        </div>

                        <div className="rating-section">
                            {renderStars(review.rating)}
                        </div>

                        <div className="comment-section">
                            <p>{review.comment}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductReviews;