import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { fetchStoreSettings, updateStoreSettings, STORE_SETTINGS_UPDATED_EVENT } from '../../lib/storeSettings';
import './AdminUI.css';

const AdminUI: React.FC = () => {
    const [productsPerPage, setProductsPerPage] = useState<number | string>(12);
    const [productsPerRow, setProductsPerRow] = useState<number | string>(4);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const token = useMemo(() => localStorage.getItem('access_token') || '', []);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setLoadError('');
            const s = await fetchStoreSettings();
            setProductsPerPage(s.products_per_page);
            setProductsPerRow(s.products_per_row);
        } catch (e) {
            setLoadError(e instanceof Error ? e.message : 'Không tải được cấu hình');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const handleChangePage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val === '') {
            setProductsPerPage('');
            return;
        }
        const v = parseInt(val, 10);
        if (!isNaN(v)) setProductsPerPage(v);
    };

    const handleChangeRow = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val === '') {
            setProductsPerRow('');
            return;
        }
        const v = parseInt(val, 10);
        if (!isNaN(v)) setProductsPerRow(v);
    };

    const handleBlurPage = () => {
        if (productsPerPage === '' || Number(productsPerPage) < 1) {
            setProductsPerPage(1);
        } else if (Number(productsPerPage) > 200) {
            setProductsPerPage(200);
        }
    };

    const handleBlurRow = () => {
        if (productsPerRow === '' || Number(productsPerRow) < 1) {
            setProductsPerRow(1);
        } else if (Number(productsPerRow) > 12) {
            setProductsPerRow(12);
        }
    };

    const handleSave = async () => {
        if (!token) {
            await Swal.fire({
                title: 'Chưa đăng nhập',
                text: 'Vui lòng đăng nhập admin để lưu.',
                icon: 'warning',
                confirmButtonColor: '#7f0019',
            });
            return;
        }

        const finalPage = Number(productsPerPage);
        const finalRow = Number(productsPerRow);

        if (finalPage < 1 || finalPage > 200) {
            await Swal.fire({
                title: 'Giá trị không hợp lệ',
                text: 'Số sản phẩm mỗi trang phải từ 1 đến 200.',
                icon: 'error',
                confirmButtonColor: '#7f0019',
            });
            return;
        }

        if (finalRow < 1 || finalRow > 12) {
            await Swal.fire({
                title: 'Giá trị không hợp lệ',
                text: 'Số cột mỗi hàng phải từ 1 đến 12.',
                icon: 'error',
                confirmButtonColor: '#7f0019',
            });
            return;
        }

        setIsSaving(true);
        try {
            const saved = await updateStoreSettings(token, {
                products_per_page: finalPage,
                products_per_row: finalRow,
            });
            window.dispatchEvent(
                new CustomEvent(STORE_SETTINGS_UPDATED_EVENT, { detail: saved }),
            );
            await Swal.fire({
                title: 'Cập nhật thành công!',
                text: 'Cấu hình hiển thị sản phẩm đã được lưu. Trang chủ / tìm kiếm sẽ dùng ngay (tab đang mở).',
                icon: 'success',
                confirmButtonColor: '#7f0019',
                width: '380px',
            });
        } catch (e) {
            await Swal.fire({
                title: 'Lỗi!',
                text: e instanceof Error ? e.message : 'Không thể lưu cấu hình.',
                icon: 'error',
                confirmButtonColor: '#7f0019',
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="admin-section">
            <div className="section-header">
                <h2 className="section-title">Quản lý giao diện cửa hàng</h2>
                <button className="btn-primary" onClick={handleSave} disabled={isSaving || loading}>
                    {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
            </div>

            {loadError && <div className="ui-load-error">{loadError}</div>}

            <div className="ui-config-container">
                {loading ? (
                    <div className="ui-loading">Đang tải cấu hình...</div>
                ) : (
                    <div className="config-grid">
                        <div className="config-item">
                            <label htmlFor="productsPerPage">Số sản phẩm mỗi trang</label>
                            <input
                                type="number"
                                id="productsPerPage"
                                name="productsPerPage"
                                value={productsPerPage}
                                onChange={handleChangePage}
                                onBlur={handleBlurPage}
                                min={1}
                                max={200}
                            />
                        </div>

                        <div className="config-item">
                            <label htmlFor="productsPerRow">Số sản phẩm mỗi hàng</label>
                            <input
                                type="number"
                                id="productsPerRow"
                                name="productsPerRow"
                                value={productsPerRow}
                                onChange={handleChangeRow}
                                onBlur={handleBlurRow}
                                min={1}
                                max={12}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminUI;
