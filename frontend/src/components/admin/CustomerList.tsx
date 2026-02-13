// CustomerList.tsx
import React from 'react';

const customers = [
    { id: 1, name: "Alice Johnson", email: "alice@gmail.com", orders: 12, spent: "$1,240" },
    { id: 2, name: "Bob Wilson", email: "bob.w@outlook.com", orders: 5, spent: "$450" },
];

const CustomerList: React.FC = () => {
    return (
        <div className="admin-card">
            <h3>Customers</h3>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Orders</th>
                        <th>Total Spent</th>
                    </tr>
                </thead>
                <tbody>
                    {customers.map(c => (
                        <tr key={c.id}>
                            <td className="bold">{c.name}</td>
                            <td>{c.email}</td>
                            <td>{c.orders} orders</td>
                            <td className="bold">{c.spent}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CustomerList;