import React from 'react';
import type { CartItem } from '../../types';
import './CartItemWrapper.css';
import ItemDetail from './ItemDetail';

interface Props {
    item: CartItem;
    // Chuyển id từ string sang number
    onChangeQuantity: (id: number, quantity: number | string) => void;
    onRemoveItem: (id: number) => void;
}

const CartItemWrapper: React.FC<Props> = ({ item, onChangeQuantity, onRemoveItem }) => {
    // Lấy ảnh đầu tiên trong mảng images, nếu không có thì dùng ảnh placeholder
    const displayImage = item.products.product_images[0]?.image_url || 'https://via.placeholder.com/150';

    return (
        <div className="cart-item-wrapper">
            <div className="cart-item-container">
                {/* Khối hình ảnh */}
                <div className="item-img-wrapper">
                    <img
                        src={displayImage}
                        alt={item.products.name}
                        className="product-img"
                    />
                </div>

                {/* Component chi tiết sản phẩm (đã chứa Quantity & SubTotal) */}
                <ItemDetail
                    item={item}
                    // Truyền item.id (id của giỏ hàng) để backend xử lý đúng bản ghi
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