// StarRating.tsx
import React from 'react';
import './StarRating.css';

interface StarRatingProps {
    rating: number;
    showText?: boolean; // Dấu '?' nghĩa là tham số này không bắt buộc
}

const StarRating: React.FC<StarRatingProps> = ({
    rating,
    showText = true // Mặc định sẽ hiển thị nếu không truyền vào
}) => {
    const validRating = Math.max(0, Math.min(5, rating));
    const fillWidth = (validRating / 5) * 100;

    return (
        <div className="star-rating-container">
            <div className="star-rating-stars">
                <div className="stars-outer">★★★★★</div>
                <div
                    className="stars-inner"
                    style={{ width: `${fillWidth}%` }}
                >
                    ★★★★★
                </div>
            </div>

            {/* Sử dụng toán tử && để điều kiện hiển thị */}
            {showText && <span className="rating-text">{validRating}/5</span>}
        </div>
    );
};

export default StarRating;