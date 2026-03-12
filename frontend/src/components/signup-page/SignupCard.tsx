import React, { useState, useRef, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import "react-day-picker/dist/style.css";
import "./SignupCard.css";
import SignupFooter from "./SignupFooter";

const SignupCard: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const dateInputRef = useRef<HTMLInputElement>(null);
    const [selectedDate, setSelectedDate] = useState<Date>();
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const calendarRef = useRef<HTMLDivElement>(null);

    // --- Thêm state để quản lý gọi API ---
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' }); // type: 'success' | 'error'

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
                setIsCalendarOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // --- Xử lý Submit Form ---
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' }); // Reset message

        // 1. Lấy dữ liệu từ form
        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const fullName = formData.get("fullName") as string;

        // (Tùy chọn) Lấy các trường khác nếu sau này backend cần
        const phone = formData.get("phone") as string;
        const gender = formData.get("gender") as string;
        const dob = formData.get("dob") as string; 
        console.log(gender);
        

        try {
            // 2. Gọi API đến Backend
            // Thay 'http://localhost:3000/auth/register' bằng đường dẫn API thực tế của bạn
            const response = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Đổi tên trường cho khớp với RegisterDto (fullName -> full_name)
                body: JSON.stringify({
                    email,
                    password,
                    full_name: fullName,
                    phone,
                    gender,
                    dob,
                }),
            });

            const data = await response.json();

            // 3. Xử lý kết quả trả về
            if (!response.ok) {
                // Nếu lỗi (vd: Email đã tồn tại - 409)
                throw new Error(data.message || 'Có lỗi xảy ra khi đăng ký!');
            }

            // Nếu thành công
            setMessage({ type: 'success', text: 'Đăng ký tài khoản thành công!' });
            // TODO: Bạn có thể thêm lệnh chuyển hướng người dùng sang trang Đăng nhập tại đây
            window.location.href = '/login';

        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="signup-card">
            <form className="signup-form" onSubmit={handleSubmit}>
                {/* --- Hiển thị thông báo Lỗi / Thành công --- */}
                {message.text && (
                    <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`} style={{ padding: '10px', marginBottom: '15px', borderRadius: '4px', backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da', color: message.type === 'success' ? '#155724' : '#721c24' }}>
                        {message.text}
                    </div>
                )}

                {/* Email */}
                <div className="form-group">
                    <label htmlFor="email">Địa Chỉ Email *</label>
                    <input type="email" id="email" name="email" placeholder="Nhập email" required />
                </div>

                {/* Password */}
                <div className="form-group">
                    <label htmlFor="password">Mật Khẩu *</label>
                    <div className="password-wrapper">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            name="password"
                            placeholder="Nhập mật khẩu"
                            required
                        />
                        <div className="eye-icon" onClick={() => setShowPassword(!showPassword)} style={{ cursor: 'pointer' }}>
                            {/* SVG Icons... */}
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" x2="22" y1="2" y2="22"></line></svg>
                            )}
                        </div>
                    </div>
                </div>

                {/* Phone */}
                <div className="form-group">
                    <label htmlFor="phone">Số điện thoại *</label>
                    <input type="text" id="phone" name="phone" placeholder="Nhập số điện thoại" maxLength={12} required />
                </div>

                {/* Full Name */}
                <div className="form-group">
                    <label htmlFor="fullName">Họ và tên *</label>
                    <input type="text" id="fullName" name="fullName" placeholder="Nhập đầy đủ họ và tên" required />
                </div>

                {/* Date of Birth (Giữ nguyên code cũ của bạn) */}
                <div className="form-group relative" ref={calendarRef}>
                    <label>Ngày sinh *</label>
                    <div className="dob-input-wrapper">
                        <input
                            type="text"
                            readOnly
                            placeholder="dd/mm/yyyy"
                            className="form-dob"
                            name="dob"
                            value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""}
                            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                        />
                        <button
                            className="calendar-btn"
                            type="button"
                            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="lucide-calendar"><path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path></svg>
                        </button>
                    </div>

                    {isCalendarOpen && (
                        <div className="calendar-popover">
                            <DayPicker
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date) => {
                                    setSelectedDate(date);
                                    if (date) setIsCalendarOpen(false);
                                }}
                                captionLayout="dropdown"
                                fromYear={1960}
                                toYear={new Date().getFullYear()}
                                locale={vi}
                            />
                        </div>
                    )}
                </div>

                {/* Gender */}
                <div className="form-group mb-large">
                    <label>Giới tính</label>
                    <select name="gender" className="gender-select">
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                        <option value="Khác">Khác</option>
                    </select>
                </div>

                {/* Checkboxes */}
                <div className="checkbox-group mt-large">
                    <label className="checkbox-item">
                        <input type="checkbox" name="newsletter" />
                        <span>Đăng ký nhận thông tin (Tùy chọn)</span>
                    </label>

                    <label className="checkbox-item">
                        <input type="checkbox" name="terms" required />
                        <span>
                            Tôi trên 16 tuổi và đồng ý với <a href="/terms">Điều khoản và Điều kiện</a>
                        </span>
                    </label>
                </div>

                <p className="privacy-note">
                    Bằng việc tiếp tục đăng ký, tôi xác nhận rằng tôi đã đọc và đồng ý với Điều khoản sử dụng và Chính sách bảo mật của MUJI...
                </p>

                {/* --- Thay đổi Trạng thái Button --- */}
                <button type="submit" className="btn-signup" disabled={isLoading}>
                    {isLoading ? 'Đang xử lý...' : 'Tạo Tài Khoản Mới'}
                </button>
            </form>

            <SignupFooter />
        </div>
    );
};

export default SignupCard;