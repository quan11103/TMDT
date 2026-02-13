// ProductList.tsx
import React from 'react';
import './ProductList.css';

const products = [
    { id: 1, name: "Gradient Graphic T-shirt", category: "T-shirt", price: "$145", stock: 45, image: "/images/p10.svg" },
    { id: 2, name: "Polo with Tipping Details", category: "Polo", price: "$180", stock: 12, image: "/images/p11.svg" },
    { id: 3, name: "Black Striped T-shirt", category: "T-shirt", price: "$120", stock: 0, image: "/images/p12.svg" },
];

const ProductList: React.FC = () => {
    return (
        <div className="admin-card">
            <div className="card-header">
                <h3>All Products</h3>
                <button className="btn-add">+ Add Product</button>
            </div>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(p => (
                        <tr key={p.id}>
                            <td className="admin-product-info">
                                <img src={p.image} alt={p.name} className="product-thumb" />
                                <span className="bold">{p.name}</span>
                            </td>
                            <td>{p.category}</td>
                            <td className="bold">{p.price}</td>
                            <td>
                                <span className={`stock-status ${p.stock > 0 ? 'in-stock' : 'out-stock'}`}>
                                    {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                                </span>
                            </td>
                            <td>
                                {/* Container giúp 2 nút nằm cạnh nhau */}
                                <div className="action-group">
                                    <button className="btn-edit">Edit</button>
                                    <button className="btn-delete">Delete</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProductList;