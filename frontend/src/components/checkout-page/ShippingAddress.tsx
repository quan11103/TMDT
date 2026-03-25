import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ShippingAddress.css";
import type { ShippingInfo } from "../../types";

interface ShippingAddressProps {
    address: ShippingInfo;
    setAddress: React.Dispatch<React.SetStateAction<ShippingInfo>>;
}

const ShippingAddress: React.FC<ShippingAddressProps> = ({ address, setAddress }) => {
    const [provinces, setProvinces] = useState<any[]>([]);
    const [districts, setDistricts] = useState<any[]>([]);
    const [wards, setWards] = useState<any[]>([]);

    // Lấy danh sách Tỉnh/Thành khi component mount
    useEffect(() => {
        axios.get("https://provinces.open-api.vn/api/p/").then((res) => setProvinces(res.data));
    }, []);

    // Lấy danh sách Quận/Huyện/Thành phố thuộc tỉnh khi provinceCode thay đổi
    useEffect(() => {
        if (address.provinceCode) {
            axios.get(`https://provinces.open-api.vn/api/p/${address.provinceCode}?depth=2`)
                // Thêm vào trong useEffect lấy districts
                .then((res) => {
                    console.log("Danh sách huyện nhận được:", res.data.districts);
                    setDistricts(res.data.districts || []);
                });
        } else {
            setDistricts([]);
        }
    }, [address.provinceCode]);

    // Lấy danh sách Phường/Xã khi districtCode thay đổi
    useEffect(() => {
        if (address.districtCode) {
            axios.get(`https://provinces.open-api.vn/api/d/${address.districtCode}?depth=2`)
                .then((res) => setWards(res.data.wards));
        } else {
            setWards([]);
        }
    }, [address.districtCode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;

        if (id === "province") {
            // Tìm object tỉnh tương ứng để lấy tên
            const selectedProvince = provinces.find(p => String(p.code) === String(value));
            setAddress(prev => ({
                ...prev,
                province: selectedProvince?.name || "",
                provinceCode: value,
                // Reset các cấp dưới khi đổi cấp trên
                district: "", districtCode: "",
                ward: "", wardCode: ""
            }));
            // Xóa danh sách cũ để buộc re-render
            setDistricts([]);
            setWards([]);
        } else if (id === "district") {
            const selectedDistrict = districts.find(d => String(d.code) === String(value));
            setAddress(prev => ({
                ...prev,
                district: selectedDistrict?.name || "",
                districtCode: value,
                ward: "", wardCode: ""
            }));
            setWards([]);
        } else if (id === "ward") {
            const selectedWard = wards.find(w => String(w.code) === String(value));
            setAddress(prev => ({
                ...prev,
                ward: selectedWard?.name || "",
                wardCode: value
            }));
        } else {
            setAddress(prev => ({ ...prev, [id]: value }));
        }
    };

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

                    {/* Tỉnh / Thành Phố */}
                    <div className="field">
                        <label className="label" htmlFor="province">Tỉnh / Thành Phố <span className="req">*</span></label>
                        <div className="selectWrap">
                            <select id="province" className="select" value={address.provinceCode} onChange={handleChange} required>
                                <option value="">Chọn Tỉnh/Thành Phố</option>
                                {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Quận / Huyện / TP Thuộc Tỉnh */}
                    <div className="field">
                        <label className="label" htmlFor="district">Quận / Huyện <span className="req">*</span></label>
                        <div className="selectWrap">
                            <select id="district" className="select" value={address.districtCode} onChange={handleChange} required>
                                <option value="">Chọn Quận/Huyện/TP</option>
                                {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Phường / Xã */}
                    <div className="field">
                        <label className="label" htmlFor="ward">Phường / Xã <span className="req">*</span></label>
                        <div className="selectWrap">
                            <select id="ward" className="select" value={address.wardCode} onChange={handleChange} required>
                                <option value="">Chọn Phường/Xã</option>
                                {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
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