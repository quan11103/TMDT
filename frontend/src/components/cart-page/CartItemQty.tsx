import QuantitySelector from '../common/QuantitySelector';
import SubTotal from './SubTotal';
import './CartItemQty.css';

interface Props {
    price: number;
    quantity: number | string;
    onChangeQuantity: (value: number | string) => void;
}

const CartItemQuantity: React.FC<Props> = ({ price, quantity, onChangeQuantity }) => {

    return (
        <div className="cart-item-qty-container">
            <SubTotal price={price} quantity={Number(quantity) || 0} />
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