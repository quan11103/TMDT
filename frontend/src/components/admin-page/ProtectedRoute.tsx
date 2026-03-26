import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const location = useLocation();

    // Lấy thông tin từ localStorage (hoặc Context/Redux)
    const token = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('user'); // Giả sử bạn lưu user object ở đây
    const user = userStr ? JSON.parse(userStr) : null;

    // 1. Nếu chưa đăng nhập: Chuyển hướng về trang Login
    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 2. Nếu đã đăng nhập nhưng KHÔNG phải Admin
    if (user?.role !== 'admin') {
        Swal.fire({
            icon: 'error',
            title: 'Truy cập bị từ chối',
            text: 'Tài khoản không có quyền truy cập tính năng này!',
            confirmButtonColor: '#7f0019'
        });
        return <Navigate to="/" replace />; // Đẩy về trang chủ
    }

    // 3. Nếu thỏa mãn cả 2: Cho phép vào trang Admin
    return <>{children}</>;
};

export default ProtectedRoute;