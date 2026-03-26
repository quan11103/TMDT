import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './AdminCategories.css';

interface Category {
    id: number;
    name: string;
    slug: string;
    parent_id?: number | null;
    _count?: { products: number };
    other_categories?: Category[];
}

interface FlatCategory extends Category {
    isChild: boolean;
    parentId?: number | null;
}

const AdminCategories: React.FC = () => {
    const [categories, setCategories] = useState<FlatCategory[]>([]);
    const [parentOptions, setParentOptions] = useState<Category[]>([]); // Chỉ chứa danh mục cấp 1
    const [loading, setLoading] = useState<boolean>(true);

    // Trạng thái điều hướng giao diện
    const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
    const [editingId, setEditingId] = useState<number | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        parent_id: '' as number | '',
    });

    const API_URL = 'http://localhost:3000/api/categories';
    const token = localStorage.getItem('access_token');

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await fetch(API_URL);
            const data = await response.json();

            if (response.ok) {
                setParentOptions(data); // Cấp 1
                const flattened: FlatCategory[] = [];
                data.forEach((parent: Category) => {
                    flattened.push({ ...parent, isChild: false });
                    if (parent.other_categories) {
                        parent.other_categories.forEach((child) => {
                            flattened.push({ ...child, isChild: true, parentId: parent.id });
                        });
                    }
                });
                setCategories(flattened);
            }
        } catch (error) {
            console.error("Lỗi tải danh mục:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Tự động tạo slug
    const handleNameChange = (name: string) => {
        const slug = name.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[đĐ]/g, 'd')
            .replace(/([^0-9a-z-\s])/g, '')
            .replace(/(\s+)/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');
        setFormData({ ...formData, name, slug });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const isEdit = view === 'edit';
        const url = isEdit ? `${API_URL}/${editingId}` : API_URL;
        const method = isEdit ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: formData.name,
                    slug: formData.slug,
                    parent_id: formData.parent_id === '' ? null : Number(formData.parent_id)
                })
            });

            const result = await response.json();

            if (response.ok) {
                Swal.fire({ icon: 'success', title: 'Thành công!', confirmButtonColor: '#7f0019' });
                setView('list');
                fetchCategories();
            } else {
                Swal.fire('Lỗi!', result.message || 'Không thể lưu danh mục', 'error');
            }
        } catch (error) {
            Swal.fire('Lỗi!', 'Lỗi kết nối server', 'error');
        }
    };

    const handleDelete = async (id: number, name: string) => {
        const result = await Swal.fire({
            title: 'Xác nhận xóa?',
            text: `Danh mục "${name}" sẽ bị ẩn. Không thể xóa nếu còn sản phẩm!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#7f0019',
            confirmButtonText: 'Đồng ý',
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`${API_URL}/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    Swal.fire('Đã ẩn!', '', 'success');
                    fetchCategories();
                } else {
                    const err = await response.json();
                    Swal.fire('Lỗi!', err.message, 'error');
                }
            } catch (error) {
                Swal.fire('Lỗi!', 'Lỗi hệ thống', 'error');
            }
        }
    };

    // Giao diện FORM (Thêm/Sửa)
    if (view === 'create' || view === 'edit') {
        return (
            <div className="admin-section">
                <div className="section-header">
                    <h2 className="section-title">{view === 'create' ? 'Thêm danh mục mới' : 'Cập nhật danh mục'}</h2>
                    <button className="btn-secondary" onClick={() => setView('list')}>Quay lại danh sách</button>
                </div>

                <form className="muji-form" onSubmit={handleSave}>
                    <div className="form-group">
                        <label>Tên danh mục</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Đường dẫn (Slug)</label>
                        <input
                            type="text"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Danh mục cha (Để trống nếu là danh mục chính)</label>
                        <select
                            value={formData.parent_id}
                            onChange={(e) => setFormData({ ...formData, parent_id: e.target.value ? Number(e.target.value) : '' })}
                        >
                            <option value="">Không có</option>
                            {parentOptions.map(p => (
                                p.id !== editingId && <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="btn-primary">Lưu thay đổi</button>
                </form>
            </div>
        );
    }

    // Giao diện DANH SÁCH
    return (
        <div className="admin-section">
            <div className="section-header">
                <h2 className="section-title">Danh sách danh mục</h2>
                <button className="btn-primary" onClick={() => {
                    setFormData({ name: '', slug: '', parent_id: '' });
                    setEditingId(null);
                    setView('create');
                }}>
                    Thêm danh mục mới
                </button>
            </div>

            {loading ? (
                <div className="loading-text">Đang tải dữ liệu...</div>
            ) : (
                <table className="muji-table">
                    <thead>
                        <tr>
                            <th>Tên danh mục</th>
                            <th>Slug</th>
                            <th>Sản phẩm</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((cat) => (
                            <tr key={cat.id}>
                                <td className="font-medium">
                                    {cat.isChild ? <span className="child-indent">└─ {cat.name}</span> : <strong>{cat.name}</strong>}
                                </td>
                                <td>{cat.slug}</td>
                                <td>{cat._count?.products || 0}</td>
                                <td className="table-actions">
                                    <span className="action-badge edit" onClick={() => {
                                        setEditingId(cat.id);
                                        setFormData({ name: cat.name, slug: cat.slug, parent_id: cat.parentId || '' });
                                        setView('edit');
                                    }}>Sửa</span>
                                    <span className="action-badge delete" onClick={() => handleDelete(cat.id, cat.name)}>Xóa</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AdminCategories;