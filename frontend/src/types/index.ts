export interface Product {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    productUrl: string;
}

export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
    productUrl: string;
}

export interface Review {
    id: number;
    userName: string;
    date: string;
    rating: number;
    comment: string;
    avatarClass: string;
}