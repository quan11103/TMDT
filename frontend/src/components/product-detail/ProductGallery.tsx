import { useState } from 'react';
import './ProductGallery.css';

const images = [
    '/images/p1-main.svg',
    '/images/p1-back.svg',
    '/images/p1-model.svg'
];

const ProductGallery = () => {
    const [mainImage, setMainImage] = useState(images[0]);

    return (
        <div className="product-gallery">
            <div className="thumbnails">
                {images.map((img, index) => (
                    <div
                        key={index}
                        className={`thumb ${mainImage === img ? 'active' : ''}`}
                        onClick={() => setMainImage(img)}
                    >
                        <img src={img} alt="Product thumb" />
                    </div>
                ))}
            </div>
            <div className="main-image">
                <img src={mainImage} alt="Main product" />
            </div>
        </div>
    );
};

export default ProductGallery;