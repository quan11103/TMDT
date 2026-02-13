import React from 'react';
import type { Review } from '../../types';
import './Testimonials.css';
import StarRating from '../common/StarRating';

interface TestimonialsProps {
    reviews: Review[];
}

const Testimonials: React.FC<TestimonialsProps> = ({ reviews }) => {
    return (
        <section className="section-padding">
            <h2 className="section-title" style={{ textAlign: 'center' }}>OUR HAPPY CUSTOMERS</h2>
            <div className="testimonials-list">
                {reviews.map(review => (
                    <div key={review.id} className="review-card">
                        <StarRating rating={review.rating} showText={false} />
                        <h4>{review.author}</h4>
                        <p>"{review.content}"</p>
                    </div>
                ))}
            </div>
        </section>
    )
}

export default Testimonials;