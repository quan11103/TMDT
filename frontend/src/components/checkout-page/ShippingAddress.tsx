import React from "react";
import "./ShippingAddress.css";
import type { ShippingInfo } from "../../types";

interface ShippingAddressProps {
    address: ShippingInfo;
    setAddress: React.Dispatch<React.SetStateAction<ShippingInfo>>;
}

const ShippingAddress: React.FC<ShippingAddressProps> = ({ address, setAddress }) => {

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setAddress(prev => ({ ...prev, [id]: value }));
    };

    const provinces = [
        { value: "", label: "Lựa chọn Tỉnh/Thành Phố" },
        { value: "1122", label: "Thành phố Hà Nội" },
        { value: "1171", label: "Thành phố Hồ Chí Minh" },
        { value: "1153", label: "Thành phố Đà Nẵng" },
    ];

    return (
        <aside className="shipping">
            <h3 className="title">Địa Chỉ Giao Hàng</h3>

            <div className="content">
                <form className="form">
                    <div className="field">
                        <label className="label" htmlFor="email">Email <span className="req">*</span></label>
                        <input
                            id="email"
                            type="email" // Tự động check định dạng email
                            className="shipping-input"
                            placeholder="Nhập email"
                            value={address.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="field">
                        <label className="label" htmlFor="fullName">Họ và Tên <span className="req">*</span></label>
                        <input
                            id="fullName"
                            className="shipping-input"
                            placeholder="Nhập họ tên đầy đủ"
                            value={address.fullName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="field">
                        <label className="label" htmlFor="phone">Số Điện Thoại <span className="req">*</span></label>
                        <input
                            id="phone"
                            type="tel"
                            className="shipping-input"
                            placeholder="Nhập số điện thoại"
                            value={address.phone}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="field">
                        <label className="label" htmlFor="province">Thành Phố/Tỉnh <span className="req">*</span></label>
                        <div className="selectWrap">
                            <select
                                id="province"
                                className="select"
                                value={address.province}
                                onChange={handleChange}
                                required
                            >
                                {provinces.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="field">
                        <label className="label" htmlFor="ward">Phường/Xã <span className="req">*</span></label>
                        <div className="selectWrap">
                            <select
                                id="ward"
                                className="select"
                                value={address.ward}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Lựa chọn Phường/Xã</option>
                                <option value="p1">Phường 1</option>
                                <option value="p2">Phường 2</option>
                            </select>
                        </div>
                    </div>

                    <div className="field">
                        <label className="label" htmlFor="street">Địa Chỉ <span className="req">*</span></label>
                        <input
                            id="street"
                            className="shipping-input"
                            placeholder="Số nhà, tên đường..."
                            value={address.street}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="field">
                        <label className="label" htmlFor="note">Ghi chú</label>
                        <input id="note" className="shipping-input" placeholder="Tòa nhà lớn, gọi trước khi giao hàng" value={address.note} onChange={handleChange} />
                    </div>

                    <div className="field">
                        <label className="label">Loại địa chỉ</label>
                        <div className="radio">
                            <label className="radioItem">
                                <input type="radio" name="addrType" checked={address.addrType === "home"} onChange={() => setAddress({ ...address, addrType: "home" })} />
                                <span>Nhà riêng</span>
                            </label>
                            <label className="radioItem">
                                <input type="radio" name="addrType" checked={address.addrType === "office"} onChange={() => setAddress({ ...address, addrType: "office" })} />
                                <span>Văn phòng</span>
                            </label>
                            <label className="radioItem grow">
                                <input
                                    type="radio"
                                    name="addrType"
                                    checked={address.addrType === "other"}
                                    onChange={() => setAddress({ ...address, addrType: "other" })}
                                />
                                <span>Khác</span>
                            </label>
                        </div>
                    </div>
                </form>
            </div>
        </aside>
    );
}

export default ShippingAddress;