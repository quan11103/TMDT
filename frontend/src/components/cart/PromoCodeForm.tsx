import React from 'react';
import './PromoCodeForm.css';

const PromoCodeForm: React.FC = () => {
    return (
        <form className="promo-form" onSubmit={(e) => e.preventDefault()}>
            <div className="input-group">
                <img src="/icons/promo-tag.svg" alt="tag" className="promo-icon" />
                <input type="text" placeholder="Add promo code" className="promo-input" />
            </div>
            <button type="submit" className="btn-apply-code">Apply</button>
        </form>
    );
};

export default PromoCodeForm;