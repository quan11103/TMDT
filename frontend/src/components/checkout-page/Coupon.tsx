import React, { useState } from "react";
import "./Coupon.css";

const Coupon: React.FC = () => {
    const [code, setCode] = useState("");
    const [msg, setMsg] = useState<string | null>(null);
    const [type, setType] = useState<"error" | "success" | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setMsg(null);
        setType(null);

        const trimmed = code.trim();
        if (!trimmed) {
            setMsg("Vui lòng nhập mã giảm giá");
            setType("error");
            return;
        }

        // TODO: call API to validate code. For demo, fake success when code === "MUJI10"
        if (trimmed.toUpperCase() === "MUJI10") {
            setMsg("Áp dụng mã thành công - Giảm 10%");
            setType("success");
        } else {
            setMsg("Mã không hợp lệ hoặc đã hết hạn");
            setType("error");
        }
    };

    return (
        <aside className="coupon">
            <h3 className="title">Mã giảm giá</h3>

            <form className="coupon-form" onSubmit={handleSubmit} noValidate>
                <input
                    className="input"
                    id="coupon_code"
                    name="coupon_code"
                    type="text"
                    placeholder="Mã giảm giá"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    aria-label="Mã giảm giá"
                />

                <button className="btn" type="submit" aria-label="Áp dụng mã">
                    ÁP DỤNG
                </button>
            </form>

            {msg && (
                <p className={`msg ${type === "error" ? "err" : "ok"}`} role="status">
                    {msg}
                </p>
            )}
        </aside>
    );
};

export default Coupon;