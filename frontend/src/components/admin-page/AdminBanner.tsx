import React, { useState, useRef } from 'react';
import './AdminBanner.css';

// Tái sử dụng interface từ file của bạn
interface SlideData {
    id: number;
    title: string;
    link: string;
    imgSrc: string;
}

// Dữ liệu mẫu ban đầu (Sau này bạn sẽ fetch từ API)
const initialBanners: SlideData[] = [
    {
        id: 1,
        title: "Feb.26 - Vali vỏ ngoài trong suốt",
        link: "https://www.muji.com.vn/vn/product/muji-vietnam-limited-hard-shell-suitcase",
        imgSrc: "https://api.muji.com.vn/media/mageplaza/bannerslider/banner/image/v/a/vali_trong_suo_t_1.png"
    },
    {
        id: 2,
        title: "Feb.26 - PYJAMA",
        link: "https://www.muji.com.vn/vn/search?q=pyjama",
        imgSrc: "https://api.muji.com.vn/media/mageplaza/bannerslider/banner/image/p/y/pyjama.png"
    },
    {
        id: 3,
        title: "Aug - New Skincare Series 1",
        link: "https://www.muji.com.vn/vn/category/2506-booster-essence-sensitive-care-series",
        imgSrc: "https://api.muji.com.vn/media/mageplaza/bannerslider/banner/image/a/r/artboard_3.png"
    }
];

const AdminBanner: React.FC = () => {
    const [banners, setBanners] = useState<SlideData[]>(initialBanners);

    // Lưu trữ index của item đang được kéo và vị trí nó đang lướt qua
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    // Xử lý logic đổi vị trí khi thả chuột
    const handleSort = () => {
        if (dragItem.current === null || dragOverItem.current === null) return;

        const _banners = [...banners];
        // Xóa item ở vị trí cũ và lấy ra data của nó
        const draggedItemContent = _banners.splice(dragItem.current, 1)[0];
        // Chèn item đó vào vị trí mới
        _banners.splice(dragOverItem.current, 0, draggedItemContent);

        // Reset ref và cập nhật state
        dragItem.current = null;
        dragOverItem.current = null;
        setBanners(_banners);
    };

    const handleDelete = (id: number) => {
        const confirmMsg = window.confirm("Bạn có chắc muốn xóa banner này?");
        if (confirmMsg) {
            setBanners(banners.filter(b => b.id !== id));
        }
    };

    const handleSaveOrder = async () => {
        // Gửi mảng `banners` mới (đã có thứ tự cập nhật) lên API của bạn
        console.log("Dữ liệu cập nhật gửi lên API:", banners);
        alert("Đã lưu thứ tự banner mới!");
    };

    return (
        <div className="admin-section">
            <div className="section-header">
                <h2 className="section-title">Quản lý banner</h2>
                <div className="table-actions">
                    <button className="btn-primary" onClick={handleSaveOrder}>
                        Lưu thứ tự
                    </button>
                    <button className="btn-primary" style={{ backgroundColor: '#333' }}>
                        + Thêm mới
                    </button>
                </div>
            </div>

            <table className="muji-table">
                <thead>
                    <tr>
                        <th style={{ width: '50px' }}></th>
                        <th style={{ width: '200px' }}>HÌNH ẢNH</th>
                        <th>THÔNG TIN BANNER</th>
                        <th style={{ width: '150px' }}>THAO TÁC</th>
                    </tr>
                </thead>
                <tbody>
                    {banners.map((banner, index) => (
                        <tr
                            key={banner.id}
                            draggable
                            onDragStart={() => (dragItem.current = index)}
                            onDragEnter={() => (dragOverItem.current = index)}
                            onDragEnd={handleSort}
                            onDragOver={(e) => e.preventDefault()}
                        >
                            <td className="drag-handle">☰</td>
                            <td className="banner-img-cell">
                                <img src={banner.imgSrc} alt={banner.title} />
                            </td>
                            <td className="text-left">
                                <span className="banner-name">{banner.title}</span>
                                <div className="banner-url">{banner.link}</div>
                            </td>
                            <td>
                                <div className="table-actions">
                                    <span className="action-badge edit">Sửa</span>
                                    <span
                                        className="action-badge delete"
                                        onClick={() => handleDelete(banner.id)}
                                    >
                                        Xóa
                                    </span>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminBanner;