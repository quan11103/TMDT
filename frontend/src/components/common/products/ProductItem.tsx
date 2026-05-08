import React, { useState, useEffect } from 'react';
import type { Product, ProductImage } from '../../../types';
import './ProductItem.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { mediaUrl } from '../../../lib/mediaUrl';
import { API_BASE } from '../../../lib/apiConfig';

interface Props {
    Id: number;
}

interface ProductWithImages extends Product {
    product_images: ProductImage[];
}

const ProductItem: React.FC<Props> = ({ Id }) => {
    const [product, setProduct] = useState<ProductWithImages | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isAdded, setIsAdded] = useState(false);

    const navigate = useNavigate();
    const currency = 'VND';

    // 1. Gọi API khi Component mount hoặc Id thay đổi
    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            setError("");
            try {
                // Thay đổi URL theo cấu hình backend của bạn (thông thường là /api/products/:id)
                const response = await axios.get(`${API_BASE}/products/${Id}`);
                setProduct(response.data);
            } catch (err: any) {
                const message = err.response?.data?.message || "Không thể tải thông tin sản phẩm.";
                setError(Array.isArray(message) ? message[0] : message);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [Id]);

    // 2. Xử lý trạng thái đang tải
    if (loading) return <div className="product-item loading">Đang tải...</div>;

    // 3. Xử lý trạng thái lỗi hoặc không tìm thấy
    if (error || !product) return <div className="product-item error">{error || "Sản phẩm không tồn tại"}</div>;

    // 4. Lấy ảnh chính (is_main: true) từ mảng product_images trả về từ API
    const mainImage = product.product_images.find(img => img.is_main) || product.product_images[0];
    const rawImg = mainImage?.image_url;
    const image_url = rawImg ? mediaUrl(rawImg) : 'https://via.placeholder.com/300';

    const { name, price } = product;
    const formattedPrice = new Intl.NumberFormat('vi-VN').format(price);

    const handleProductClick = () => {
        navigate(`/product/${product.id}`);
    };

    const handleAddToCart = async () => {
        const token = localStorage.getItem("access_token");

        if (!token) {
            alert("Vui lòng đăng nhập!");
            return;
        }

        try {
            console.log("Token gửi đi:", token)
            await axios.post(`${API_BASE}/cart`, {
                product_id: product.id, // ID sản phẩm từ dữ liệu API sản phẩm
                quantity: 1             // Số lượng mặc định
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            window.dispatchEvent(new Event('cartUpdated'));

            setIsAdded(true);

            setTimeout(() => {
                setIsAdded(false);
            }, 3000);

        } catch (err: any) {
            console.error("Lỗi:", err.response?.data);
            alert(err.response?.data?.message || "Lỗi khi thêm vào giỏ hàng");
        }
    };

    return (
        <div className="product-item" >
            {/* Phần Hình ảnh & Nhãn */}
            <div className="product-image-container" onClick={handleProductClick}>
                <div className="product-image-link">
                    <img
                        src={image_url}
                        alt={name}
                        loading="lazy"
                        className="product-image"
                    />
                </div>
            </div>

            {/* Phần Thông tin sản phẩm */}
            <div className="product-info-container" >
                {/* Tên sản phẩm */}
                <p className="product-name" onClick={handleProductClick}>
                    <a title={name}>
                        {name}
                    </a>
                </p>

                {/* Giá */}
                <div className="product-price-wishlist">
                    <div className="product-price">
                        <span className="amount">{formattedPrice}</span>
                        <span className="currency">{currency}</span>
                    </div>
                </div>

                {/* Nút Mua Hàng */}
                <button
                    className={`add-to-cart-btn ${isAdded ? 'added' : ''}`}
                    disabled={isAdded}
                    onClick={() => {
                        handleAddToCart();
                    }}
                >
                    {isAdded ? "Đã thêm" : "Thêm vào giỏ hàng"}
                </button>
            </div>
        </div>
    );
};

export default ProductItem;