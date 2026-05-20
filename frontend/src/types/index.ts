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
    sale_price?: number;
    discount_percent?: number;
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
    sale_price?: number;
    discount_percent?: number;
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
    // Cấp 1: Tỉnh/Thành
    province: string;
    provinceCode: string;
    // Cấp 2: Quận/Huyện/Thành phố thuộc tỉnh (Tên chung trong Code vẫn nên là district)
    district: string;
    districtCode: string;
    // Cấp 3: Phường/Xã
    ward: string;
    wardCode: string;
    street: string;
    note: string;
    addrType: 'home' | 'office' | 'other';
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

export interface Order {
    id: number;
    total_amount: number;
    status: string;
    created_at: string;
    users: {
        full_name: string;
        email: string;
    } | null;
    order_items: any[];
    payments: any[];
}

export interface User {
    id: number;
    email: string;
    full_name: string | null;
    is_active: boolean;
    created_at: string;
    roles: {
        role: string;
    };
    phone?: string | null;
    dob?: string | null;
    gender?: string | null;
    updated_at?: string | null;
    _count?: { orders: number };
}

export interface Review {
    id: number;
    userName: string;
    date: string;
    rating: number;
    comment: string;
    avatarClass: string;
}