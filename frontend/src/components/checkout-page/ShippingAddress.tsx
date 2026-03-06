import React, { useState } from "react";
import "./ShippingAddress.css";

const ShippingAddress: React.FC = () => {
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [province, setProvince] = useState("");
    const [district, setDistrict] = useState("");
    const [ward, setWard] = useState("");
    const [street, setStreet] = useState("");
    const [note, setNote] = useState("");
    const [addrType, setAddrType] = useState<"home" | "office" | "other">("home");

    const provinces = [
        { value: "", label: "Lựa chọn Tỉnh/Thành Phố" },
        { value: "1122", label: "Thành phố Hà Nội" },
        { value: "1171", label: "Thành phố Hồ Chí Minh" },
        { value: "1153", label: "Thành phố Đà Nẵng" },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Ở đây bạn có thể gọi API hoặc truyền lên parent
        console.log({
            email,
            fullName,
            phone,
            province,
            district,
            ward,
            street,
            note,
            addrType,
        });
        // ví dụ reset hoặc feedback
    };

    return (
        <aside className="shipping">
            <h3 className="title">Địa Chỉ Giao Hàng</h3>

            <div className="content">
                <form className="form" onSubmit={handleSubmit} noValidate>
                    <div className="field">
                        <label className="label" htmlFor="email">Email <span className="req">*</span></label>
                        <input id="email" className="input" placeholder="Nhập email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>

                    <div className="field">
                        <label className="label" htmlFor="fullname">Họ và Tên <span className="req">*</span></label>
                        <input id="fullname" className="input" placeholder="Nhập họ tên đầy đủ" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                    </div>

                    <div className="field">
                        <label className="label" htmlFor="phone">Số Điện Thoại <span className="req">*</span></label>
                        <input id="phone" className="input" placeholder="Nhập số điện thoại" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>

                    <div className="field">
                        <label className="label" htmlFor="province">Thành Phố/Tỉnh <span className="req">*</span></label>
                        <div className="selectWrap">
                            <select id="province" className="select" value={province} onChange={(e) => setProvince(e.target.value)}>
                                {provinces.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid2">
                        <div className="field">
                            <label className="label" htmlFor="district">Quận/Huyện <span className="req">*</span></label>
                            <div className="selectWrap">
                                <select id="district" className="select" value={district} onChange={(e) => setDistrict(e.target.value)}>
                                    <option value="">Lựa chọn Quận/Huyện</option>
                                </select>
                            </div>
                        </div>

                        <div className="field">
                            <label className="label" htmlFor="ward">Phường/Xã <span className="req">*</span></label>
                            <div className="selectWrap">
                                <select id="ward" className="select" value={ward} onChange={(e) => setWard(e.target.value)}>
                                    <option value="">Lựa chọn Phường/Xã</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="field">
                        <label className="label" htmlFor="street">Địa Chỉ <span className="req">*</span></label>
                        <input id="street" className="input" placeholder="Nhập địa chỉ giao hàng" value={street} onChange={(e) => setStreet(e.target.value)} />
                    </div>

                    <div className="field">
                        <label className="label" htmlFor="note">Ghi chú</label>
                        <input id="note" className="input" placeholder="Tòa nhà lớn, gọi trước khi giao hàng" value={note} onChange={(e) => setNote(e.target.value)} />
                    </div>

                    <div className="field">
                        <label className="label">Loại địa chỉ</label>
                        <div className="radio">
                            <label className="radioItem">
                                <input type="radio" name="addrType" checked={addrType === "home"} onChange={() => setAddrType("home")} />
                                <span>Nhà riêng</span>
                            </label>
                            <label className="radioItem">
                                <input type="radio" name="addrType" checked={addrType === "office"} onChange={() => setAddrType("office")} />
                                <span>Văn phòng</span>
                            </label>
                            <label className="radioItem grow">
                                <input
                                    type="radio"
                                    name="addrType"
                                    checked={addrType === "other"}
                                    onChange={() => setAddrType("other")}
                                />
                                <span>Khác</span>
                            </label>
                        </div>
                    </div>

                    <div className="actions">
                        <button type="submit" className="btn">XÁC NHẬN ĐỊA CHỈ</button>
                    </div>
                </form>

                {/* optional: minicart preview (mobile) */}
                <div className="minicart">
                    <h4 className="miniTitle">mặt hàng (3)</h4>
                    <div className="miniList">
                        <div className="miniItem">
                            <img className="miniImg" src="https://api.muji.com.vn/media/catalog/product/cache/e272aad8b9caabcd658db26974414701/4/5/4550002794132_org.jpg" alt="item" />
                            <div className="miniInfo">
                                <div className="miniName">Bút Bi Bấm 0.5mm - Xanh Dương MUJI</div>
                                <div className="miniMeta">Màu sắc: Xanh • Số lượng: 2</div>
                                <div className="miniPrice">50.000 VND</div>
                            </div>
                        </div>
                        {/* thêm items nếu cần */}
                    </div>
                </div>
            </div>
        </aside>
    );
}

export default ShippingAddress;