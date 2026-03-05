import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // Cuộn về đầu trang ngay lập tức khi pathname thay đổi
        window.scrollTo(0, 0);
    }, [pathname]);

    return null; // Component này không hiển thị gì cả
};

export default ScrollToTop;