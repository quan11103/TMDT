import React, { useState } from "react";
import "./PaymentMethod.css";

interface Props {
    selected: string | null;
    onSelect: (id: string) => void;
}

const PaymentMethod: React.FC<Props> = ({ selected, onSelect }) => {
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

    return (
        <aside className="pm">
            <h3 className="pm-title">Phương thức thanh toán</h3>

            <div className="pm-list">
                {methods.map((m) => (
                    <div
                        key={m.id}
                        className={`pm-item ${selected === m.id ? "active" : ""}`}
                        onClick={() => onSelect(m.id)} // Sử dụng hàm từ Props
                        role="button"
                        tabIndex={0}
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