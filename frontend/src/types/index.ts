export interface Product {
    id: number;
    name: string;
    image: string;
    rating: number; // ví dụ: 4.5
    price: number;
    originalPrice?: number;
    discountPercent?: number;
}

export interface Review {
    id: number;
    author: string;
    content: string;
    rating: number;
    isVerified: boolean;
}