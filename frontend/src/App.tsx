import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import ScrollToTop from './components/common/ScrollToTop';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CategoryPage from './pages/CategoryPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderStatusPage from './pages/OrderStatusPage';
import AdminPage from './pages/AdminPage';
import SignUpPage from './pages/SignUpPage';
import ProtectedRoute from './components/admin-page/ProtectedRoute';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import PaymentResultPage from './pages/PaymentResultPage';
import ProfilePage from './pages/ProfilePage';
import ChatWidget from './components/common/ChatWidget';
import NewArrivalsPage from './pages/NewArrivalsPage';
import BestSellerPage from './pages/BestSellerPage';

function App() {

  // Logic kiểm tra Token tự động khi load trang
  useEffect(() => {
    // 1. CHỨC NĂNG MỚI: Hứng Token từ Google Redirect
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');
    const userFromUrl = params.get('user');

    // Chỉ coi là đăng nhập OAuth khi có cả token + user (redirect Google/Facebook).
    // Tránh nhầm ?token=... trên link đặt lại mật khẩu (/forgot-password?token=...) với JWT.
    if (tokenFromUrl && userFromUrl) {
      localStorage.setItem('access_token', tokenFromUrl);
      localStorage.setItem('user', userFromUrl);
      window.history.replaceState({}, document.title, window.location.pathname);
      console.log("Đăng nhập Google thành công!");
    }

    // 2. LOGIC CŨ: Kiểm tra Token hiện tại
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
          console.warn("Phiên đăng nhập đã hết hạn.");
          handleClearSession();
        }
      } catch (error) {
        console.error("Token không hợp lệ:", error);
        handleClearSession();
      }
    }
  }, []);

  const handleClearSession = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  return (
    <Router>
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login/" element={<LoginPage />} />
        <Route path="/signup/" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/forgot-password/" element={<ForgotPasswordPage />} />
        <Route path="/search/" element={<SearchPage />} />
        <Route path="/new-arrivals/" element={<NewArrivalsPage />} />
        <Route path="/bestseller/" element={<BestSellerPage />} />
        <Route path="/product/:productId" element={<ProductDetailPage />} />
        <Route path="/category/:categoryId" element={<CategoryPage />} />
        <Route path="/cart/" element={<CartPage />} />
        <Route path="/checkout/" element={<CheckoutPage />} />
        <Route path="/payment-result" element={<PaymentResultPage />} />
        <Route path="/payment-result/" element={<PaymentResultPage />} />
        <Route path="/order-status/" element={<OrderStatusPage />} />
        <Route path="/account" element={<ProfilePage />} />
        <Route path="/account/" element={<ProfilePage />} />
        <Route
          path="/admin/"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />
      </Routes>
      <ChatWidget />
    </Router>
  );
}

export default App;