import React from 'react';
import type { CartItem } from '../../types';
import './CartItemWrapper.css';
import ItemDetail from './ItemDetail';
import { useNavigate } from 'react-router-dom';
import { mediaUrl } from '../../lib/mediaUrl';

interface Props {
    item: CartItem;
    isSelected: boolean;
    onSelect: (id: number) => void;
    onChangeQuantity: (id: number, quantity: number | string) => void;
    onRemoveItem: (id: number) => void;
}

const CartItemWrapper: React.FC<Props> = ({ item, isSelected, onSelect, onChangeQuantity, onRemoveItem }) => {
    // Lấy ảnh đầu tiên trong mảng images, nếu không có thì dùng ảnh placeholder
    const raw = item.products.product_images[0]?.image_url;
    const displayImage = raw ? mediaUrl(raw) : 'https://via.placeholder.com/150';

    const navigate = useNavigate();

    const handleProductClick = () => {
        navigate(`/product/${item.products.id}`);
    };

    return (
        <div className="cart-item-wrapper">
            <div className="cart-item-container">
                <div className="item-checkbox-section">
                    <input
                        type="checkbox"
                        className="item-checkbox"
                        checked={isSelected}
                        onChange={() => onSelect(item.id)}
                    />
                </div>
                {/* Khối hình ảnh */}
                <div className="item-img-wrapper" onClick={handleProductClick}>
                    <img
                        src={displayImage}
                        alt={item.products.name}
                        className="product-img"
                    />
                </div>

                {/* Component chi tiết sản phẩm (đã chứa Quantity & SubTotal) */}
                <ItemDetail
                    item={item}
                    onChangeQuantity={(value) =>
                        onChangeQuantity(item.id, value)
                    }
                    onRemoveItem={() => onRemoveItem(item.id)}
                />

            </div>
        </div>
    );
};

export default CartItemWrapper;