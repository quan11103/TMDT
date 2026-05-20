import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProductReviews.css';
import {
    deleteMyReview,
    fetchReviewSummary,
    fetchReviewsPage,
    getJwtUserId,
    upsertMyReview,
    type ReviewListItem,
    type ReviewSummary,
} from '../../lib/reviewsApi';

interface ProductReviewsProps {
    productId: number;
    reviewSummary: ReviewSummary | null;
    onReviewChanged: (summary: ReviewSummary) => void;
}

const PAGE_SIZE = 10;

const ProductReviews: React.FC<ProductReviewsProps> = ({
    productId,
    reviewSummary,
    onReviewChanged,
}) => {
    const navigate = useNavigate();
    const myId = getJwtUserId();
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    const [list, setList] = useState<ReviewListItem[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [listError, setListError] = useState('');

    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState<number | null>(null);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    const loadList = useCallback(async () => {
        setLoading(true);
        setListError('');
        try {
            const res = await fetchReviewsPage(productId, page, PAGE_SIZE);
            setList(res.data);
            setTotalPages(Math.max(1, res.meta.total_page));
        } catch (e) {
            setListError(e instanceof Error ? e.message : 'Không tải được đánh giá');
            setList([]);
        } finally {
            setLoading(false);
        }
    }, [productId, page]);

    useEffect(() => {
        loadList();
    }, [loadList]);

    useEffect(() => {
        setPage(1);
        setRating(0);
        setHoverRating(null);
        setComment('');
        setFormError('');
        setFormSuccess('');
    }, [productId]);

    const refreshSummary = useCallback(async () => {
        try {
            const s = await fetchReviewSummary(productId);
            onReviewChanged(s);
        } catch {
            /* ignore */
        }
    }, [productId, onReviewChanged]);

    const renderStars = (value: number) => (
        <div className="star-rating" aria-hidden>
            {[1, 2, 3, 4, 5].map((n) => (
                <span key={n} className={`star ${n <= value ? 'filled' : ''}`}>
                    ★
                </span>
            ))}
        </div>
    );

    useEffect(() => {
        const row = list.find((r) => myId != null && r.users?.id === myId);
        if (row) {
            setRating(row.rating);
            setComment(row.comment || '');
        } else {
            setRating(0);
            setComment('');
        }
        setHoverRating(null);
    }, [list, myId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');
        if (!token) {
            navigate('/login/');
            return;
        }
        if (rating < 1) {
            setFormError('Vui lòng chọn số sao đánh giá.');
            return;
        }
        setSubmitting(true);
        try {
            await upsertMyReview(productId, { rating, comment: comment.trim() || undefined });
            setFormSuccess('Đã lưu đánh giá của bạn.');
            await refreshSummary();
            await loadList();
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Gửi đánh giá thất bại');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteMine = async () => {
        if (!token || !window.confirm('Xóa đánh giá của bạn?')) return;
        setFormError('');
        try {
            await deleteMyReview(productId);
            setFormSuccess('Đã xóa đánh giá.');
            await refreshSummary();
            await loadList();
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Không xóa được');
        }
    };

    const count = reviewSummary?.count ?? 0;
    const avg = reviewSummary?.avg_rating ?? 0;
    const displayAvg = count > 0 ? avg.toFixed(1) : '—';
    const starsForSummary = count > 0 ? Math.round(avg) : 0;

    const mine = myId != null ? list.find((r) => r.users?.id === myId) : undefined;
    const activeStars = hoverRating ?? rating;

    return (
        <div className="product-reviews-container">
            <div className="reviews-header">
                <h3 className="reviews-title">
                    Đánh giá <span className="count">({count})</span>
                </h3>

                {count > 0 && (
                    <div className="summary-rating">
                        {renderStars(starsForSummary)}
                        <strong className="score-text">
                            {displayAvg} <span className="max-score">/ 5</span>
                        </strong>
                    </div>
                )}
            </div>

            <div className="review-compose">
                {!token ? (
                    <p className="review-login-hint">
                        <button type="button" className="review-link-btn" onClick={() => navigate('/login/')}>
                            Đăng nhập
                        </button>{' '}
                        để đánh giá sản phẩm.
                    </p>
                ) : (
                    <form className="review-form" onSubmit={handleSubmit}>
                        <p className="review-form-title">{mine ? 'Cập nhật đánh giá' : 'Viết đánh giá'}</p>
                        <div className="review-form-row">
                            <span className="review-form-label">Chọn sao</span>
                            <div
                                className="star-picker"
                                role="group"
                                aria-label="Điểm đánh giá"
                                onMouseLeave={() => setHoverRating(null)}
                            >
                                {[1, 2, 3, 4, 5].map((n) => (
                                    <button
                                        key={n}
                                        type="button"
                                        className={`star-pick ${n <= activeStars ? 'on' : ''}`}
                                        onClick={() => setRating(n)}
                                        onMouseEnter={() => setHoverRating(n)}
                                        aria-pressed={rating > 0 && n <= rating}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>
                        </div>
                        <label className="review-form-label" htmlFor="review-comment">
                            Nhận xét (tuỳ chọn)
                        </label>
                        <textarea
                            id="review-comment"
                            className="review-textarea"
                            rows={3}
                            maxLength={2000}
                            placeholder="Chia sẻ trải nghiệm của bạn…"
                            value={comment}
                            onChange={(ev) => setComment(ev.target.value)}
                        />
                        {formError ? <p className="review-msg review-msg-error">{formError}</p> : null}
                        {formSuccess ? <p className="review-msg review-msg-success">{formSuccess}</p> : null}
                        <div className="review-form-actions">
                            <button type="submit" className="review-submit-btn" disabled={submitting}>
                                {submitting ? 'Đang gửi…' : mine ? 'Cập nhật' : 'Gửi đánh giá'}
                            </button>
                            {mine ? (
                                <button
                                    type="button"
                                    className="review-delete-btn"
                                    onClick={handleDeleteMine}
                                    disabled={submitting}
                                >
                                    Xóa đánh giá
                                </button>
                            ) : null}
                        </div>
                    </form>
                )}
            </div>

            {listError ? <p className="review-list-error">{listError}</p> : null}

            {loading ? (
                <p className="reviews-loading">Đang tải đánh giá…</p>
            ) : list.length === 0 && !listError ? (
                <p className="reviews-empty">Chưa có đánh giá nào.</p>
            ) : (
                <>
                    <div className="reviews-list">
                        {list.map((review) => {
                            const isMine = myId != null && review.users?.id === myId;
                            const name = review.users?.full_name?.trim() || 'Khách hàng';
                            const dateStr = new Date(review.created_at).toLocaleDateString('vi-VN');
                            return (
                                <div
                                    key={review.id}
                                    className={`review-card ${isMine ? 'review-card--mine' : ''}`}
                                >
                                    <div className="user-section">
                                        <div
                                            className="user-avatar"
                                            aria-hidden
                                            style={{
                                                backgroundImage: `url("https://api.iconify.design/ph:user-circle-light.svg")`,
                                            }}
                                        />
                                        <div className="user-meta">
                                            <strong className="user-name">
                                                {name}
                                                {isMine ? <span className="review-badge-mine"> Bạn</span> : null}
                                            </strong>
                                            <span className="review-date">{dateStr}</span>
                                        </div>
                                    </div>
                                    <div className="rating-section">{renderStars(review.rating)}</div>
                                    <div className="comment-section">
                                        {review.comment?.trim() ? (
                                            <p>{review.comment}</p>
                                        ) : (
                                            <p className="comment-empty">(Không có nhận xét)</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {totalPages > 1 ? (
                        <div className="reviews-pagination">
                            <button
                                type="button"
                                className="reviews-page-btn"
                                disabled={page <= 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                            >
                                Trước
                            </button>
                            <span className="reviews-page-info">
                                Trang {page} / {totalPages}
                            </span>
                            <button
                                type="button"
                                className="reviews-page-btn"
                                disabled={page >= totalPages}
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            >
                                Sau
                            </button>
                        </div>
                    ) : null}
                </>
            )}
        </div>
    );
};

export default ProductReviews;
