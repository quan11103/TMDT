import QuantitySelector from '../common/QuantitySelector';
import SubTotal from './SubTotal';
import './CartItemQty.css';

interface Props {
    price: number;
    quantity: number;
    onChangeQuantity: (value: number) => void;
}

const CartItemQuantity: React.FC<Props> = ({ price, quantity, onChangeQuantity }) => {
    // Chuyển về kiểu string để đồng bộ với QuantitySelector

    return (
        <div className="cart-item-qty-container">
            <SubTotal price={price} quantity={quantity} />
            <div className="qty-wrapper">
                <QuantitySelector
                    quantity={quantity}
                    onChange={(value) => onChangeQuantity(value)}
                />
            </div>
        </div>
    );
};

export default CartItemQuantity;