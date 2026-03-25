import QuantitySelector from '../common/QuantitySelector';
import SubTotal from './SubTotal';
import './CartItemQty.css';

interface Props {
    price: number;
    quantity: number | string;
    stock: number;
    onChangeQuantity: (value: number | string) => void;
}

const CartItemQuantity: React.FC<Props> = ({ price, quantity, stock, onChangeQuantity }) => {

    return (
        <div className="cart-item-qty-container">
            <SubTotal price={price} quantity={Number(quantity) || 0} />
            <div className="qty-wrapper">
                <QuantitySelector
                    quantity={quantity}
                    max={stock}
                    onChange={(value) => onChangeQuantity(value)}
                />
            </div>
        </div>
    );
};

export default CartItemQuantity;