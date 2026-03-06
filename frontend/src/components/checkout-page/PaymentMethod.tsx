import React, { useState } from "react";
import "./PaymentMethod.css";

const PaymentMethod: React.FC = () => {
    const [selected, setSelected] = useState<string | null>(null);

    const methods = [
        {
            id: "vnpay",
            title: "VNPAY",
            subtitle: "Hỗ trợ thanh toán mọi hình thức",
            icons: [
                "/images/vnpayqr.webp",
                "/images/unionpay.webp",
                "/images/visa.webp",
                "/images/master.webp",
                "/images/jcb.webp",
                "/images/amex.webp",
            ],
            img: "/images/vnpay.webp",
        },
        {
            id: "momo",
            title: "Ví MoMo hoặc Chuyển Khoản",
            subtitle: "",
            icons: [],
            img: "/images/momo.webp",
        },
        {
            id: "cod",
            title: "Thanh Toán Khi Nhận Hàng",
            subtitle: "",
            icons: [],
            img: "/images/cod.svg",
        },
    ];

    const handleSelect = (id: string) => {
        setSelected(id);
    };

    return (
        <aside className="pm">
            <h3 className="pm-title">Phương thức thanh toán</h3>

            <div className="pm-list">
                {methods.map((m) => (
                    <div
                        key={m.id}
                        className={`pm-item ${selected === m.id ? "active" : ""}`}
                        onClick={() => handleSelect(m.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleSelect(m.id);
                        }}
                    >
                        <div className="pm-left">
                            <img className="pm-logo" src={m.img} alt={m.title} />
                            <div className="pm-meta">
                                <p className="pm-titleline">{m.title}</p>
                                {m.subtitle && <p className="pm-sub">{m.subtitle}</p>}
                                {m.icons.length > 0 && (
                                    <div className="pm-icons">
                                        {m.icons.map((src, i) => (
                                            <img
                                                key={i}
                                                className="pm-icon"
                                                src={src}
                                                alt=""
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pm-right">
                            <span className="pm-radio-outer">
                                {selected === m.id && <span className="pm-radio-dot" />}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    );
};

export default PaymentMethod;