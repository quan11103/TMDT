const ReviewCard = ({ name, content, date }: any) => (
    <div className="review-card">
        <div className="stars">⭐⭐⭐⭐⭐</div>
        <div className="name">
            <h4>{name}</h4>
        </div>
        <p>"{content}"</p>
        <div className="date">Posted on {date}</div>
    </div >
);

export default ReviewCard;