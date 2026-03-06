import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/common/ScrollToTop';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CategoryPage from './pages/CategoryPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminPage from './pages/AdminPage';
import SignUpPage from './pages/SignUpPage';

function App() {
  return (
    <Router>
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/login/" element={<LoginPage />} />

        <Route path="/signup/" element={<SignUpPage />} />

        <Route path="/product/:id" element={<ProductDetailPage />} />

        <Route path="/category/" element={<CategoryPage />} />

        <Route path="/cart/" element={<CartPage />} />

        <Route path="/checkout/" element={<CheckoutPage />} />

        <Route path="/admin/" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;