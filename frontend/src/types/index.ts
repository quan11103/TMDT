export interface Product {
    id: number;
    name: string;
    slug: string;
    price: number;
    stock: number;
    description: string;
    category_id: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface ProductImage {
    id: number;
    product_id: number;
    image_url: string;
    is_main: boolean;
    created_at: string;
}

export interface ProductDetail {
    id: number;
    name: string;
    price: number;
    description: string;
    stock: number;
    product_images: ProductImage[];
    categories: {
        id: number;
        name: string;
        slug: string;
    };
}

export interface CartItem {
    id: number;
    quantity: number;
    products: {
        id: number;
        name: string;
        price: number;
        stock: number;
        product_images: { image_url: string }[];
    };
}

export interface ShippingInfo {
    email: string;
    fullName: string;
    phone: string;
    province: string;
    ward: string;
    street: string;
    note: string;
    addrType: "home" | "office" | "other";
}

export interface CategoryData {
    id: number;
    name: string;
    slug: string;
    _count: {
        products: number;
    };
    other_categories: Array<{ id: number; name: string; slug: string }>;
}

export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    total_page: number;
}

export interface Review {
    id: number;
    userName: string;
    date: string;
    rating: number;
    comment: string;
    avatarClass: string;
}