import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import './ProfilePage.css';

const API_BASE = 'http://localhost:3000/api';

type MeResponse = {
    id: number;
    email: string;
    full_name: string | null;
    phone?: string | null;
    gender?: string | null;
    dob?: string | null;
    created_at?: string;
    updated_at?: string | null;
    is_active?: boolean;
    roles?: { role: string };
    _count?: { orders: number };
};

const parseApiError = async (response: Response) => {
    const data = await response.json().catch(() => ({}));
    const msg = Array.isArray(data?.message) ? data.message.join(', ') : data?.message;
    return msg || `Lỗi ${response.status}`;
};

const dobToInput = (iso?: string | null) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return iso.slice(0, 10);
};

const syncUserCache = (me: MeResponse) => {
    try {
        const raw = localStorage.getItem('user');
        const prev = raw ? JSON.parse(raw) : {};
        localStorage.setItem(
            'user',
            JSON.stringify({
                ...prev,
                full_name: me.full_name ?? prev.full_name,
                email: me.email ?? prev.email,
            }),
        );
    } catch {
        localStorage.setItem(
            'user',
            JSON.stringify({
                full_name: me.full_name,
                email: me.email,
            }),
        );
    }
};

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('access_token') || '';

    const [loadError, setLoadError] = useState('');
    const [loading, setLoading] = useState(true);

    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [gender, setGender] = useState('');
    const [dob, setDob] = useState('');
    const [orderCount, setOrderCount] = useState<number | null>(null);

    const [profileMsg, setProfileMsg] = useState('');
    const [profileErr, setProfileErr] = useState('');
    const [savingProfile, setSavingProfile] = useState(false);

    const [curPwd, setCurPwd] = useState('');
    const [newPwd, setNewPwd] = useState('');
    const [confirmPwd, setConfirmPwd] = useState('');
    const [pwdMsg, setPwdMsg] = useState('');
    const [pwdErr, setPwdErr] = useState('');
    const [savingPwd, setSavingPwd] = useState(false);

    const applyMe = useCallback((me: MeResponse) => {
        setEmail(me.email || '');
        setFullName(me.full_name?.trim() || '');
        setPhone(me.phone?.trim() || '');
        setGender(me.gender?.trim() || '');
        setDob(dobToInput(me.dob));
        if (me._count && typeof me._count.orders === 'number') {
            setOrderCount(me._count.orders);
        }
    }, []);

    const loadProfile = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setLoadError('');
        try {
            const response = await fetch(`${API_BASE}/users/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) {
                setLoadError(await parseApiError(response));
                return;
            }
            const me = (await response.json()) as MeResponse;
            applyMe(me);
            syncUserCache(me);
        } catch {
            setLoadError('Không tải được hồ sơ. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    }, [token, applyMe]);

    useEffect(() => {
        if (!token) {
            navigate('/login/', { replace: true });
            return;
        }
        loadProfile();
    }, [token, navigate, loadProfile]);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileMsg('');
        setProfileErr('');
        setSavingProfile(true);
        try {
            const body: Record<string, unknown> = {
                full_name: fullName.trim() || undefined,
            };
            const p = phone.trim();
            if (p === '') body.phone = null;
            else body.phone = p;

            const g = gender.trim();
            if (g === '') body.gender = null;
            else body.gender = g;

            if (!dob.trim()) body.dob = null;
            else body.dob = dob.trim();

            const response = await fetch(`${API_BASE}/users/me`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });
            if (!response.ok) {
                setProfileErr(await parseApiError(response));
                return;
            }
            const updated = (await response.json()) as MeResponse;
            applyMe(updated);
            syncUserCache(updated);
            setProfileMsg('Đã cập nhật hồ sơ.');
            window.dispatchEvent(new Event('userCacheUpdated'));
        } catch {
            setProfileErr('Lỗi kết nối.');
        } finally {
            setSavingProfile(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPwdMsg('');
        setPwdErr('');
        if (newPwd.length < 6) {
            setPwdErr('Mật khẩu mới cần ít nhất 6 ký tự.');
            return;
        }
        if (newPwd !== confirmPwd) {
            setPwdErr('Mật khẩu mới không khớp.');
            return;
        }
        setSavingPwd(true);
        try {
            const response = await fetch(`${API_BASE}/users/me/password`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    current_password: curPwd,
                    new_password: newPwd,
                }),
            });
            if (!response.ok) {
                setPwdErr(await parseApiError(response));
                return;
            }
            setPwdMsg('Đã đổi mật khẩu.');
            setCurPwd('');
            setNewPwd('');
            setConfirmPwd('');
        } catch {
            setPwdErr('Lỗi kết nối.');
        } finally {
            setSavingPwd(false);
        }
    };

    if (!token) {
        return null;
    }

    return (
        <>
            <Header />
            <div className="profile-page">
                <div className="profile-container">
                    <h1 className="profile-page-title">Hồ sơ tài khoản</h1>

                    {loadError ? (
                        <div className="profile-banner profile-banner-error">{loadError}</div>
                    ) : null}

                    {loading ? (
                        <div className="profile-loading">
                            <div className="profile-spinner" />
                            <p>Đang tải hồ sơ…</p>
                        </div>
                    ) : (
                        <>
                            <section className="profile-card">
                                <h2 className="profile-card-title">Thông tin cá nhân</h2>
                                {orderCount != null ? (
                                    <p className="profile-meta">
                                        Bạn đã có <strong>{orderCount}</strong> đơn hàng trên hệ thống.
                                    </p>
                                ) : null}

                                {profileMsg ? (
                                    <div className="profile-banner profile-banner-success">
                                        {profileMsg}
                                    </div>
                                ) : null}
                                {profileErr ? (
                                    <div className="profile-banner profile-banner-error">
                                        {profileErr}
                                    </div>
                                ) : null}

                                <form className="profile-form" onSubmit={handleSaveProfile}>
                                    <div className="profile-field">
                                        <label htmlFor="profile-email">Email</label>
                                        <input
                                            id="profile-email"
                                            type="email"
                                            value={email}
                                            readOnly
                                            className="profile-input profile-input-readonly"
                                        />
                                        <span className="profile-hint">Email dùng để đăng nhập, không đổi được tại đây.</span>
                                    </div>
                                    <div className="profile-field">
                                        <label htmlFor="profile-name">Họ và tên</label>
                                        <input
                                            id="profile-name"
                                            type="text"
                                            value={fullName}
                                            onChange={(ev) => setFullName(ev.target.value)}
                                            className="profile-input"
                                            autoComplete="name"
                                        />
                                    </div>
                                    <div className="profile-field">
                                        <label htmlFor="profile-phone">Số điện thoại</label>
                                        <input
                                            id="profile-phone"
                                            type="tel"
                                            value={phone}
                                            onChange={(ev) => setPhone(ev.target.value)}
                                            placeholder="0xxxxxxxxx hoặc +84xxxxxxxxx"
                                            className="profile-input"
                                            autoComplete="tel"
                                        />
                                    </div>
                                    <div className="profile-field">
                                        <label htmlFor="profile-gender">Giới tính</label>
                                        <select
                                            id="profile-gender"
                                            value={gender}
                                            onChange={(ev) => setGender(ev.target.value)}
                                            className="profile-input"
                                        >
                                            <option value="">— Chưa chọn —</option>
                                            <option value="Nam">Nam</option>
                                            <option value="Nữ">Nữ</option>
                                            <option value="Khác">Khác</option>
                                        </select>
                                    </div>
                                    <div className="profile-field">
                                        <label htmlFor="profile-dob">Ngày sinh</label>
                                        <input
                                            id="profile-dob"
                                            type="date"
                                            value={dob}
                                            onChange={(ev) => setDob(ev.target.value)}
                                            className="profile-input"
                                        />
                                    </div>
                                    <div className="profile-actions">
                                        <button
                                            type="submit"
                                            className="profile-btn-primary"
                                            disabled={savingProfile}
                                        >
                                            {savingProfile ? 'Đang lưu…' : 'Lưu thay đổi'}
                                        </button>
                                    </div>
                                </form>
                            </section>

                            <section className="profile-card">
                                <h2 className="profile-card-title">Đổi mật khẩu</h2>
                                {pwdMsg ? (
                                    <div className="profile-banner profile-banner-success">{pwdMsg}</div>
                                ) : null}
                                {pwdErr ? (
                                    <div className="profile-banner profile-banner-error">{pwdErr}</div>
                                ) : null}
                                <form className="profile-form" onSubmit={handleChangePassword}>
                                    <div className="profile-field">
                                        <label htmlFor="pwd-current">Mật khẩu hiện tại</label>
                                        <input
                                            id="pwd-current"
                                            type="password"
                                            value={curPwd}
                                            onChange={(ev) => setCurPwd(ev.target.value)}
                                            className="profile-input"
                                            autoComplete="current-password"
                                        />
                                    </div>
                                    <div className="profile-field">
                                        <label htmlFor="pwd-new">Mật khẩu mới</label>
                                        <input
                                            id="pwd-new"
                                            type="password"
                                            value={newPwd}
                                            onChange={(ev) => setNewPwd(ev.target.value)}
                                            className="profile-input"
                                            autoComplete="new-password"
                                            minLength={6}
                                        />
                                    </div>
                                    <div className="profile-field">
                                        <label htmlFor="pwd-confirm">Nhập lại mật khẩu mới</label>
                                        <input
                                            id="pwd-confirm"
                                            type="password"
                                            value={confirmPwd}
                                            onChange={(ev) => setConfirmPwd(ev.target.value)}
                                            className="profile-input"
                                            autoComplete="new-password"
                                            minLength={6}
                                        />
                                    </div>
                                    <div className="profile-actions">
                                        <button
                                            type="submit"
                                            className="profile-btn-secondary"
                                            disabled={savingPwd}
                                        >
                                            {savingPwd ? 'Đang cập nhật…' : 'Đổi mật khẩu'}
                                        </button>
                                    </div>
                                </form>
                            </section>
                        </>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default ProfilePage;
