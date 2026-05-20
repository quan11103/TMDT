import React, { useState, useEffect, useRef } from 'react';
import type { ProductDetail } from '../../types';
import Swal from 'sweetalert2';
import CreateProduct from './CreateProduct';
import UpdateProduct from './UpdateProduct';
import './AdminProducts.css';
import { API_BASE } from '../../lib/apiConfig';

const AdminProducts: React.FC = () => {
    const [products, setProducts] = useState<ProductDetail[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE}/products?limit=50`);
            const result = await response.json();

            if (response.ok) {
                setProducts(result.data);
            }
        } catch (error) {
            console.error("Lỗi khi tải sản phẩm:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const generateSlug = (name: string): string => {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[đĐ]/g, 'd')
            .replace(/([^0-9a-z-\s])/g, '')
            .replace(/(\s+)/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset input value to allow selecting the same file again if desired
        e.target.value = '';

        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target?.result as string;
            if (!text) return;

            const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
            if (lines.length < 2) {
                Swal.fire({
                    icon: 'error',
                    title: 'Tệp rỗng',
                    text: 'Tệp CSV không chứa dữ liệu hoặc thiếu dòng tiêu đề.',
                    confirmButtonColor: '#7f0019'
                });
                return;
            }

            // Detect separator (comma or semicolon for Vietnamese Excel regional settings)
            let separator = ',';
            if (lines[0].includes(';') && !lines[0].includes(',')) {
                separator = ';';
            }

            // Robust RFC-4180-like line splitter
            const parseCSVLine = (line: string): string[] => {
                const row: string[] = [];
                let insideQuote = false;
                let entries = '';
                for (let j = 0; j < line.length; j++) {
                    const char = line[j];
                    if (char === '"') {
                        insideQuote = !insideQuote;
                    } else if (char === separator && !insideQuote) {
                        row.push(entries.trim());
                        entries = '';
                    } else {
                        entries += char;
                    }
                }
                row.push(entries.trim());
                return row.map(val => val.replace(/^"|"$/g, '').replace(/""/g, '"'));
            };

            const headerRow = parseCSVLine(lines[0]);
            
            // Helper to clean and normalize headers for fuzzy compatibility matching
            const normalizeHeader = (h: string) => 
                h.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd');

            const headers = headerRow.map(normalizeHeader);

            // Find column indices by supported English and Vietnamese headers
            const nameIdx = headers.findIndex(h => h === 'name' || h === 'ten' || h === 'ten san pham');
            const priceIdx = headers.findIndex(h => h === 'price' || h === 'gia' || h === 'gia ban');
            const categoryIdx = headers.findIndex(h => h === 'category_id' || h === 'ma danh muc' || h === 'ma loai' || h === 'category id');
            const stockIdx = headers.findIndex(h => h === 'stock' || h === 'ton kho' || h === 'so luong');
            const descIdx = headers.findIndex(h => h === 'description' || h === 'mo ta');
            const slugIdx = headers.findIndex(h => h === 'slug');
            const imageIdx = headers.findIndex(h => h === 'image_urls' || h === 'image urls' || h === 'images' || h === 'anh');

            // Verify header compatibility
            const missingFields: string[] = [];
            if (nameIdx === -1) missingFields.push('Tên sản phẩm (name / tên)');
            if (priceIdx === -1) missingFields.push('Giá bán (price / giá)');
            if (categoryIdx === -1) missingFields.push('Mã danh mục (category_id / mã danh mục)');
            if (stockIdx === -1) missingFields.push('Tồn kho (stock / tồn kho)');

            if (missingFields.length > 0) {
                Swal.fire({
                    icon: 'error',
                    title: 'Định dạng file không tương thích',
                    html: `<div style="text-align: left; font-size: 14px;">
                            <p>Tệp CSV thiếu các cột bắt buộc sau:</p>
                            ${missingFields.map(f => `<p style="color: #cc0000; margin: 4px 0;">• <b>${f}</b></p>`).join('')}
                            <p style="margin-top: 10px; font-size: 12px; color: #666;">
                                * Mẹo: Đảm bảo dòng đầu tiên của file CSV chứa tên các tiêu đề cột trên.
                            </p>
                           </div>`,
                    confirmButtonColor: '#7f0019'
                });
                return;
            }

            const validatedProducts: any[] = [];
            const errors: string[] = [];

            // Validate rows
            for (let i = 1; i < lines.length; i++) {
                const row = parseCSVLine(lines[i]);
                // Skip completely blank rows
                if (row.length === 1 && !row[0]) continue;

                const name = row[nameIdx]?.trim() || '';
                const price = row[priceIdx]?.trim() || '';
                const categoryId = row[categoryIdx]?.trim() || '';
                const stock = row[stockIdx]?.trim() || '';
                const description = descIdx !== -1 ? row[descIdx]?.trim() : '';
                const slug = slugIdx !== -1 ? row[slugIdx]?.trim() : '';
                const imageUrls = imageIdx !== -1 ? row[imageIdx]?.trim() : '';

                const rowNum = i + 1;
                if (!name) {
                    errors.push(`Dòng ${rowNum}: Tên sản phẩm không được để trống.`);
                }
                const priceNum = Number(price);
                if (isNaN(priceNum) || priceNum <= 0) {
                    errors.push(`Dòng ${rowNum}: Giá bán "${price}" phải là số lớn hơn 0.`);
                }
                const categoryIdNum = Number(categoryId);
                if (isNaN(categoryIdNum) || categoryIdNum <= 0 || !Number.isInteger(categoryIdNum)) {
                    errors.push(`Dòng ${rowNum}: Mã danh mục "${categoryId}" phải là số nguyên dương.`);
                }
                const stockNum = Number(stock);
                if (isNaN(stockNum) || stockNum < 0 || !Number.isInteger(stockNum)) {
                    errors.push(`Dòng ${rowNum}: Tồn kho "${stock}" phải là số nguyên không âm.`);
                }

                if (errors.length > 20) {
                    errors.push('...và còn tiếp tục nhiều lỗi khác. Vui lòng kiểm tra lại tệp CSV.');
                    break;
                }

                if (errors.length === 0) {
                    validatedProducts.push({
                        name,
                        slug: slug || generateSlug(name),
                        price: priceNum,
                        category_id: categoryIdNum,
                        stock: stockNum,
                        description: description || '',
                        imageUrls
                    });
                }
            }

            // Abort import if any compatibility/validation error occurred
            if (errors.length > 0) {
                Swal.fire({
                    icon: 'error',
                    title: 'Nội dung tệp không tương thích',
                    html: `<div style="text-align: left; max-height: 250px; overflow-y: auto; border: 1px solid #eee; padding: 10px; background: #fafafa; font-size: 13px;">
                            ${errors.map(err => `<p style="margin: 4px 0; color: #cc0000;">• ${err}</p>`).join('')}
                           </div>`,
                    confirmButtonColor: '#7f0019'
                });
                return;
            }

            if (validatedProducts.length === 0) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Không tìm thấy dữ liệu',
                    text: 'Tệp CSV không chứa bất kỳ dòng sản phẩm hợp lệ nào.',
                    confirmButtonColor: '#7f0019'
                });
                return;
            }

            // Ask for confirmation before inserting into database
            const confirmResult = await Swal.fire({
                title: 'Xác nhận nhập sản phẩm',
                text: `Tệp CSV hoàn toàn tương thích! Phát hiện ${validatedProducts.length} sản phẩm sẵn sàng. Tiến hành nhập vào cơ sở dữ liệu?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#7f0019',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Đồng ý nhập',
                cancelButtonText: 'Hủy'
            });

            if (!confirmResult.isConfirmed) return;

            // Start bulk request flow with progress updates
            Swal.fire({
                title: 'Đang nhập sản phẩm...',
                html: `Tiến trình: <b>0</b> / ${validatedProducts.length}`,
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            let successCount = 0;
            let failCount = 0;
            const token = localStorage.getItem('access_token');

            if (!token) {
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi xác thực',
                    text: 'Phiên làm việc hết hạn hoặc chưa đăng nhập. Vui lòng đăng nhập lại.',
                    confirmButtonColor: '#7f0019'
                });
                return;
            }

            for (let i = 0; i < validatedProducts.length; i++) {
                const prod = validatedProducts[i];
                try {
                    const payload = {
                        name: prod.name,
                        slug: prod.slug,
                        price: prod.price,
                        category_id: prod.category_id,
                        stock: prod.stock,
                        description: prod.description
                    };
                    const response = await fetch(`${API_BASE}/products`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify(payload),
                    });
                    
                    if (response.ok) {
                        const result = await response.json();
                        const productId = result.id;
                        
                        if (prod.imageUrls) {
                            const urls = prod.imageUrls.split(/[\n,]+/).map((u: string) => u.trim()).filter(Boolean);
                            if (urls.length > 0) {
                                await fetch(`${API_BASE}/products/${productId}/image-urls`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        Authorization: `Bearer ${token}`,
                                    },
                                    body: JSON.stringify({ urls }),
                                });
                            }
                        }
                        successCount++;
                    } else {
                        failCount++;
                    }
                } catch (err) {
                    failCount++;
                }

                // Update Progress Modal in real-time
                if (Swal.getHtmlContainer()) {
                    Swal.getHtmlContainer()!.innerHTML = `Tiến trình: <b>${successCount + failCount}</b> / ${validatedProducts.length}<br/>
                    (Thành công: <span style="color: green; font-weight: bold;">${successCount}</span>, Thất bại: <span style="color: red; font-weight: bold;">${failCount}</span>)`;
                }
            }

            // Summary result Alert
            Swal.fire({
                icon: failCount === 0 ? 'success' : 'warning',
                title: 'Hoàn tất nhập sản phẩm',
                text: `Đã nhập thành công ${successCount} / ${validatedProducts.length} sản phẩm.${failCount > 0 ? ` Thất bại ${failCount} sản phẩm.` : ''}`,
                confirmButtonColor: '#7f0019'
            });

            // Reload listing database table
            fetchProducts();
        };

        reader.readAsText(file, 'UTF-8');
    };

    const handleDelete = async (id: number, name: string) => {
        const result = await Swal.fire({
            title: 'Bạn có chắc chắn?',
            text: `Sản phẩm "${name}" sẽ bị ẩn khỏi cửa hàng!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#7f0019', // Màu đỏ Muji
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Hủy',
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('access_token');
                const response = await fetch(`${API_BASE}/products/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    // Thông báo thành công
                    Swal.fire({
                        title: 'Đã ẩn!',
                        text: 'Sản phẩm đã chuyển sang trạng thái ngưng hoạt động.',
                        icon: 'success',
                        confirmButtonColor: '#7f0019'
                    });
                    setProducts(products.filter(p => p.id !== id));
                } else {
                    Swal.fire('Lỗi!', 'Không thể xóa sản phẩm này.', 'error');
                }
            } catch (error) {
                Swal.fire('Lỗi!', 'Đã xảy ra lỗi kết nối.', 'error');
            }
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    if (showCreateForm) {
        return (
            <div className="admin-section">
                <div className="section-header">
                    <h2 className="section-title">Thêm sản phẩm mới</h2>
                    <button
                        className="btn-secondary"
                        onClick={() => {
                            setShowCreateForm(false);
                            fetchProducts(); // Refresh danh sách khi quay lại
                        }}
                    >
                        Quay lại danh sách
                    </button>
                </div>
                <CreateProduct />
            </div>
        );
    }

    if (editingId) {
        return (
            <div className="admin-section">
                <div className="section-header">
                    <h2 className="section-title">Sửa đổi sản phẩm</h2>
                    <button
                        className="btn-secondary"
                        onClick={() => {
                            setEditingId(null);
                            fetchProducts(); // Refresh danh sách khi quay lại
                        }}
                    >
                        Quay lại danh sách
                    </button>
                </div>
                <UpdateProduct
                    productId={editingId}
                    onBack={() => setEditingId(null)}
                    onSuccess={() => {
                        setEditingId(null);
                        fetchProducts();
                    }}
                />
            </div>
        );
    }

    return (
        <div className="admin-section">
            <div className="section-header">
                <h2 className="section-title">Danh sách sản phẩm</h2>
                <div className="header-actions">
                    <input
                        type="file"
                        accept=".csv"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden-file-input"
                    />
                    <button
                        className="btn-primary btn-upload-csv"
                        onClick={handleUploadClick}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        Tải lên file .csv
                    </button>
                    <button
                        className="btn-primary"
                        onClick={() => setShowCreateForm(true)}
                    >
                        Thêm sản phẩm mới
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="loading-text">Đang tải dữ liệu...</div>
            ) : (
                <table className="muji-table">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Tên sản phẩm</th>
                            <th>Danh mục</th>
                            <th>Giá bán</th>
                            <th>Tồn kho</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length > 0 ? (
                            products.map((p, index) => (
                                <tr key={p.id}>
                                    <td>{index + 1}</td>
                                    <td className="font-medium">{p.name}</td>
                                    <td className='category'>{p.categories?.name || 'Chưa phân loại'}</td>
                                    <td className="price">{formatCurrency(p.price)}</td>
                                    <td className="stock">{p.stock}</td>
                                    <td className="table-actions">
                                        <span
                                            className="action-badge edit"
                                            onClick={() => setEditingId(p.id)}
                                        >
                                            Sửa
                                        </span>
                                        <span
                                            className="action-badge delete"
                                            onClick={() => handleDelete(p.id, p.name)}
                                        >
                                            Xóa
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center' }}>Không có sản phẩm nào.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AdminProducts;