import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  User as UserIcon,
  Phone,
  MapPin,
  Lock,
  Package,
  Heart,
  Bell,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Edit3,
  ShieldCheck,
  RotateCcw,
  Clock,
  Check,
  Truck,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '../store/auth';
import { useCart } from '../store/cart';
import { useStorefront } from '../store/storefront';
import {
  catalogApi,
  getCategoryTitle,
  getProductFallbackImage,
  getProductTitle,
  resolveProductImage,
  type ApiAddress,
  type ApiOrder,
} from '../lib/api';
import { useLang } from '../lib/lang';
import { egp } from '../lib/utils';
import { Mark, ZigZagBand, BaladiDuoEmblem } from '../components/brand/Ornaments';

type Tab = 'profile' | 'security' | 'orders' | 'addresses' | 'favorites' | 'notifications';
const VALID_TABS: Tab[] = ['profile', 'security', 'orders', 'addresses', 'favorites', 'notifications'];

export default function ProfilePage() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    user,
    isAuthenticated,
    isHydrating,
    logout,
    updateProfile,
    addresses,
    createAddress,
    updateAddress,
    setDefaultAddress,
    deleteAddress,
    orders,
    favorites,
    removeFavorite,
    notifications,
    unreadNotifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useAuth();

  const governorates = useStorefront((s) => s.governorates);
  const catalogProducts = useStorefront((s) => s.products);
  const addCart = useCart((s) => s.add);
  const addById = useCart((s) => s.addById);

  const tabParam = searchParams.get('tab') as Tab | null;
  const activeTab: Tab = tabParam && VALID_TABS.includes(tabParam) ? tabParam : 'profile';

  const setActiveTab = (tab: Tab) => {
    setSearchParams(tab === 'profile' ? {} : { tab }, { replace: true });
  };

  // Profile edit state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  // Security / change password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passMsg, setPassMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [passLoading, setPassLoading] = useState(false);

  // Address form state
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [editingAddrId, setEditingAddrId] = useState<number | null>(null);
  const [addrLabel, setAddrLabel] = useState('');
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrGovId, setAddrGovId] = useState<number>(0);
  const [addrLine, setAddrLine] = useState('');
  const [addrIsDefault, setAddrIsDefault] = useState(false);
  const [addrSaving, setAddrSaving] = useState(false);
  const [addrMsg, setAddrMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [reorderBusyNum, setReorderBusyNum] = useState<string | null>(null);
  const [reorderNotice, setReorderNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!addrGovId && governorates.length > 0) {
      setAddrGovId(governorates[0].id);
    }
  }, [governorates, addrGovId]);

  if (isHydrating && !user) {
    return (
      <div className="grid min-h-[80vh] place-items-center bg-cream pt-[68px] md:pt-[84px]">
        <div className="flex items-center gap-3 rounded-2xl bg-white px-6 py-4 shadow-soft">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-baladi-red border-t-transparent" />
          <span className="text-sm font-black text-ink">{t('جاري تحميل حسابك...', 'Loading your account...')}</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[80vh] bg-cream pt-[68px] md:pt-[84px]">
        <div className="u-container py-20 text-center">
          <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-baladi-yellow/20 text-baladi-ink">
            <UserIcon className="h-10 w-10 text-baladi-red" />
          </div>
          <h1 className="t-display text-3xl md:text-4xl">{t('حسابك الشخصي', 'Your Account')}</h1>
          <p className="mx-auto mt-3 max-w-md text-base font-bold text-ink/75">
            {t(
              'سجل الدخول للاطلاع على طلباتك، إدارة عناوين التوصيل، المفضلة، والإشعارات.',
              'Sign in to manage your orders, delivery addresses, favorites, and notifications.'
            )}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/login" className="btn btn-ink">
              {t('تسجيل الدخول', 'Sign In')}
            </Link>
            <Link to="/register" className="btn btn-outline-light !border-ink/30 !text-ink hover:!bg-ink/5">
              {t('إنشاء حساب جديد', 'Create Account')}
            </Link>
            <Link to="/track" className="btn btn-yellow">
              {t('تتبع طلب كضيف', 'Track Order')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    if (!name.trim() || !phone.trim()) {
      setProfileMsg({ text: t('الاسم ورقم الهاتف مطلوبان', 'Name and phone are required'), type: 'error' });
      return;
    }
    setProfileLoading(true);
    const res = await updateProfile({ name: name.trim(), phone: phone.trim() });
    setProfileLoading(false);

    if (res.success) {
      setProfileMsg({ text: t('تم حفظ التعديلات بنجاح!', 'Profile updated successfully!'), type: 'success' });
      setTimeout(() => setProfileMsg(null), 3500);
    } else {
      setProfileMsg({ text: res.error || t('تعذر تحديث البيانات', 'Could not update profile'), type: 'error' });
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPassMsg(null);
    if (!newPassword || newPassword.length < 8) {
      setPassMsg({
        text: t('كلمة المرور يجب أن لا تقل عن 8 أحرف', 'Password must be at least 8 characters'),
        type: 'error',
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassMsg({ text: t('كلمتا المرور غير متطابقتين', 'Passwords do not match'), type: 'error' });
      return;
    }

    setPassLoading(true);
    const res = await updateProfile({
      password: newPassword,
      password_confirmation: confirmPassword,
    });
    setPassLoading(false);

    if (res.success) {
      setPassMsg({
        text: t('تم تحديث كلمة المرور بنجاح!', 'Password updated successfully!'),
        type: 'success',
      });
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPassMsg(null), 4000);
    } else {
      setPassMsg({ text: res.error || t('تعذر تحديث كلمة المرور', 'Error updating password'), type: 'error' });
    }
  };

  const openCreateAddress = () => {
    setEditingAddrId(null);
    setAddrLabel(t('المنزل', 'Home'));
    setAddrName(user.name || '');
    setAddrPhone(user.phone || '');
    setAddrGovId(governorates[0]?.id ?? 0);
    setAddrLine('');
    setAddrIsDefault(addresses.length === 0);
    setAddrMsg(null);
    setShowAddrForm(true);
  };

  const openEditAddress = (addr: ApiAddress) => {
    setEditingAddrId(addr.id);
    setAddrLabel(addr.label);
    setAddrName(addr.name);
    setAddrPhone(addr.phone);
    setAddrGovId(addr.governorate_id || governorates[0]?.id || 0);
    setAddrLine(addr.line);
    setAddrIsDefault(addr.is_default);
    setAddrMsg(null);
    setShowAddrForm(true);
  };

  const handleAddressSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAddrMsg(null);
    if (!addrLabel.trim() || !addrName.trim() || !addrPhone.trim() || !addrLine.trim() || !addrGovId) {
      setAddrMsg({ text: t('يرجى استكمال جميع حقول العنوان', 'Please fill in all address fields'), type: 'error' });
      return;
    }

    setAddrSaving(true);
    const res = editingAddrId
      ? await updateAddress(editingAddrId, {
          label: addrLabel.trim(),
          name: addrName.trim(),
          phone: addrPhone.trim(),
          governorate_id: Number(addrGovId),
          line: addrLine.trim(),
        })
      : await createAddress({
          label: addrLabel.trim(),
          name: addrName.trim(),
          phone: addrPhone.trim(),
          governorate_id: Number(addrGovId),
          line: addrLine.trim(),
          is_default: addrIsDefault,
        });

    if (res.success && editingAddrId && addrIsDefault) {
      await setDefaultAddress(editingAddrId);
    }

    setAddrSaving(false);

    if (res.success) {
      setShowAddrForm(false);
      setEditingAddrId(null);
    } else {
      setAddrMsg({ text: res.error || t('تعذر حفظ العنوان', 'Could not save address'), type: 'error' });
    }
  };

  const handleReorder = async (order: ApiOrder) => {
    setReorderBusyNum(order.order_number);
    setReorderNotice(null);
    let addedCount = 0;

    for (const item of order.items) {
      let match = catalogProducts.find(
        (p) => p.name === item.name || p.name_ar === item.name || p.name_en === item.name
      );
      if (!match) {
        try {
          const searchRes = await catalogApi.listProducts({ q: item.name, per_page: 5 }, lang);
          match = (searchRes.data || []).find(
            (p) => p.name === item.name || p.name_ar === item.name || p.name_en === item.name
          ) ?? searchRes.data?.[0];
        } catch {
          match = undefined;
        }
      }

      if (match && match.in_stock) {
        const ok = await addById(match.id, item.quantity, false);
        if (ok) addedCount++;
      }
    }

    setReorderBusyNum(null);
    if (addedCount > 0) {
      navigate('/cart');
    } else {
      setReorderNotice(
        t('عذراً، منتجات هذا الطلب غير متوفرة حالياً في المخزون', 'Sorry, items from this order are currently unavailable')
      );
    }
  };

  const statusTone = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('deliver') || s.includes('complet')) return 'bg-emerald-50 text-baladi-green border-baladi-green/25';
    if (s.includes('cancel')) return 'bg-red-50 text-baladi-red border-baladi-red/25';
    return 'bg-amber-50 text-amber-800 border-amber-300';
  };

  return (
    <div className="min-h-screen bg-cream pt-[68px] md:pt-[84px]">
      {/* ── PROFILE HEADER BANNER ──────────────────────────────── */}
      <section className="relative overflow-hidden bg-ink py-10 text-cream md:py-14">
        <ZigZagBand color="#FBBB21" height={20} className="absolute inset-x-0 top-0 opacity-80" />
        <div className="u-container relative">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-start">
              <div className="grid h-20 w-20 place-items-center rounded-3xl border-2 border-baladi-yellow bg-baladi-yellow text-ink shadow-lift overflow-hidden shrink-0">
                <BaladiDuoEmblem size={28} color="#23254F" />
              </div>
              <div>
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <h1 className="text-2xl font-black text-white md:text-3xl">{user.name}</h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-baladi-yellow px-2.5 py-0.5 text-xs font-black text-ink">
                    {t('عضو بلدى', 'Baladi Member')}
                  </span>
                </div>
                <p className="mt-1 text-sm font-medium text-cream/80" dir="ltr">
                  {user.email} · {user.phone}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                void logout().then(() => navigate('/'));
              }}
              className="inline-flex items-center gap-2 rounded-full border border-cream/25 bg-cream/10 px-4 py-2 text-xs font-black text-white transition-colors hover:bg-baladi-red hover:border-baladi-red"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>{t('تسجيل الخروج', 'Sign Out')}</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── MAIN BODY: SIDEBAR + TAB CONTENT ──────────────────── */}
      <div className="u-container py-10 md:py-14">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          {/* Sidebar Nav */}
          <aside className="h-fit space-y-2 rounded-[26px] border hairline bg-white p-3 shadow-soft">
            {[
              { id: 'profile' as Tab, icon: UserIcon, label: t('البيانات الشخصية', 'Profile Info') },
              { id: 'orders' as Tab, icon: Package, label: t('طلباتي', 'My Orders'), count: orders.length },
              { id: 'addresses' as Tab, icon: MapPin, label: t('عناويني', 'Addresses'), count: addresses.length },
              { id: 'favorites' as Tab, icon: Heart, label: t('المفضلة', 'Favorites'), count: favorites.length },
              { id: 'notifications' as Tab, icon: Bell, label: t('الإشعارات', 'Notifications'), count: unreadNotifications },
              { id: 'security' as Tab, icon: Lock, label: t('كلمة المرور والأمان', 'Security') },
            ].map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-black transition-colors ${
                    active ? 'bg-ink text-white' : 'text-ink/80 hover:bg-cream hover:text-ink'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <item.icon className={`h-4 w-4 ${active ? 'text-baladi-yellow' : 'text-ink/60'}`} />
                    <span>{item.label}</span>
                  </span>
                  {item.count !== undefined && item.count > 0 && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-black ${
                        active ? 'bg-baladi-yellow text-ink' : 'bg-cream text-ink/80'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
            <div className="border-t hairline pt-2">
              <Mark tone="red" className="mx-auto my-2 h-6 opacity-60" />
            </div>
          </aside>

          {/* Main Tab Area */}
          <div className="space-y-6">
            {/* ── TAB: PROFILE ───────────────────────────────────── */}
            {activeTab === 'profile' && (
              <div className="rounded-[28px] border hairline bg-white p-6 shadow-soft md:p-8">
                <div className="flex items-center gap-2.5 border-b hairline pb-4">
                  <Edit3 className="h-5 w-5 text-baladi-red" />
                  <h2 className="text-xl font-black text-ink">{t('تعديل البيانات الشخصية', 'Edit Personal Info')}</h2>
                </div>

                {profileMsg && (
                  <div
                    className={`mt-5 flex items-center gap-2.5 rounded-2xl p-3.5 text-xs font-bold ${
                      profileMsg.type === 'success' ? 'bg-emerald-50 text-baladi-green' : 'bg-red-50 text-baladi-red'
                    }`}
                  >
                    {profileMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                    <span>{profileMsg.text}</span>
                  </div>
                )}

                <form onSubmit={handleProfileSubmit} className="mt-6 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-ink/75">
                        {t('الاسم بالكامل', 'Full Name')}
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-2 w-full rounded-2xl border hairline bg-cream/40 px-4 py-3 text-sm font-bold text-ink focus:border-baladi-red focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-ink/75">
                        {t('رقم الهاتف', 'Phone Number')}
                      </label>
                      <input
                        type="tel"
                        dir="ltr"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="mt-2 w-full rounded-2xl border hairline bg-cream/40 px-4 py-3 text-sm font-bold text-ink focus:border-baladi-red focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-ink/75">
                      {t('البريد الإلكتروني', 'Email Address')}
                    </label>
                    <input
                      type="email"
                      dir="ltr"
                      disabled
                      value={user.email}
                      className="mt-2 w-full cursor-not-allowed rounded-2xl border hairline bg-ink/[0.04] px-4 py-3 text-sm font-bold text-ink/60"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={profileLoading}
                      className="btn btn-ink font-black disabled:opacity-60"
                    >
                      {profileLoading ? t('جاري الحفظ...', 'Saving...') : t('حفظ التعديلات', 'Save Changes')}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ── TAB: ORDERS ────────────────────────────────────── */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {reorderNotice && (
                  <div className="rounded-2xl border border-baladi-red/30 bg-red-50 px-4 py-3 text-xs font-black text-baladi-red">
                    {reorderNotice}
                  </div>
                )}
                {orders.length === 0 ? (
                  <div className="rounded-[28px] border hairline bg-white p-12 text-center shadow-soft">
                    <Package className="mx-auto h-10 w-10 text-ink/35" />
                    <p className="mt-3 font-black text-ink">{t('لا توجد طلبات سابقة بعد', 'No orders yet')}</p>
                    <Link to="/cats" className="btn btn-ink mt-5 inline-flex">
                      {t('تصفح المنتجات', 'Browse Products')}
                    </Link>
                  </div>
                ) : (
                  orders.map((ord) => (
                    <div key={ord.order_number} className="rounded-[28px] border hairline bg-white p-6 shadow-soft">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b hairline pb-4">
                        <div>
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono text-base font-black text-baladi-red">{ord.order_number}</span>
                            <span className={`rounded-full border px-3 py-0.5 text-[11px] font-black ${statusTone(ord.status)}`}>
                              {ord.status_label}
                            </span>
                          </div>
                          <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-ink/65">
                            <Clock className="h-3.5 w-3.5" />
                            {new Date(ord.created_at).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                            {' · '}
                            {ord.payment_method === 'online' ? t('دفع إلكتروني', 'Online') : t('عند الاستلام', 'COD')}
                          </p>
                        </div>
                        <div className="text-end">
                          <span className="text-xs font-bold text-ink/60">{t('الإجمالي', 'Total')}</span>
                          <p className="text-lg font-black text-ink">{egp(ord.total, lang)}</p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        {ord.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs font-bold text-ink/85">
                            <span>
                              {item.name} × {item.quantity}
                            </span>
                            <span>{egp(item.total, lang)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t hairline pt-4 text-xs font-bold text-ink/70">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-baladi-red" />
                          {ord.customer_address}
                        </span>
                        <div className="flex flex-wrap gap-2">
                          <Link
                            to={`/track?order=${encodeURIComponent(ord.order_number)}`}
                            className="inline-flex items-center gap-1.5 rounded-full border hairline bg-cream px-3.5 py-2 text-xs font-black text-ink hover:bg-baladi-yellow/30"
                          >
                            <Truck className="h-3.5 w-3.5" />
                            <span>{t('تتبع', 'Track')}</span>
                          </Link>
                          <button
                            type="button"
                            disabled={reorderBusyNum === ord.order_number}
                            onClick={() => void handleReorder(ord)}
                            className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-black text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span>
                              {reorderBusyNum === ord.order_number
                                ? t('جاري الإضافة...', 'Adding...')
                                : t('إعادة الطلب', 'Reorder')}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── TAB: ADDRESSES ─────────────────────────────────── */}
            {activeTab === 'addresses' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between rounded-[28px] border hairline bg-white p-6 shadow-soft">
                  <div>
                    <h2 className="text-xl font-black text-ink">{t('عناوين التوصيل', 'Delivery Addresses')}</h2>
                    <p className="text-xs font-bold text-ink/70">
                      {t('احفظ عناوينك لاستخدامها بنقرة واحدة عند إتمام الطلب', 'Save your addresses for 1-click checkout')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={openCreateAddress}
                    className="btn btn-ink inline-flex items-center gap-1.5 text-xs font-black"
                  >
                    <Plus className="h-4 w-4" />
                    <span>{t('إضافة عنوان', 'Add Address')}</span>
                  </button>
                </div>

                {showAddrForm && (
                  <form onSubmit={handleAddressSubmit} className="space-y-4 rounded-[28px] border hairline bg-white p-6 shadow-soft">
                    <h3 className="text-base font-black text-ink">
                      {editingAddrId ? t('تعديل العنوان', 'Edit Address') : t('إضافة عنوان جديد', 'Add New Address')}
                    </h3>

                    {addrMsg && (
                      <div className="rounded-xl bg-red-50 px-3.5 py-2.5 text-xs font-bold text-baladi-red">
                        {addrMsg.text}
                      </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-black text-ink/75">{t('تسمية العنوان', 'Label')} *</label>
                        <input
                          type="text"
                          value={addrLabel}
                          onChange={(e) => setAddrLabel(e.target.value)}
                          placeholder={t('المنزل / العمل', 'Home / Office')}
                          className="mt-1.5 w-full rounded-xl border hairline bg-cream/40 px-3.5 py-2.5 text-sm font-bold text-ink focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-ink/75">{t('اسم المستلم', 'Recipient Name')} *</label>
                        <input
                          type="text"
                          value={addrName}
                          onChange={(e) => setAddrName(e.target.value)}
                          className="mt-1.5 w-full rounded-xl border hairline bg-cream/40 px-3.5 py-2.5 text-sm font-bold text-ink focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-black text-ink/75">{t('رقم الهاتف', 'Phone')} *</label>
                        <input
                          type="tel"
                          dir="ltr"
                          value={addrPhone}
                          onChange={(e) => setAddrPhone(e.target.value)}
                          className="mt-1.5 w-full rounded-xl border hairline bg-cream/40 px-3.5 py-2.5 text-sm font-bold text-ink focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-ink/75">{t('المحافظة', 'Governorate')} *</label>
                        <select
                          value={addrGovId}
                          onChange={(e) => setAddrGovId(Number(e.target.value))}
                          className="mt-1.5 w-full rounded-xl border hairline bg-cream/40 px-3.5 py-2.5 text-sm font-bold text-ink focus:outline-none"
                        >
                          {governorates.map((g) => (
                            <option key={g.id} value={g.id}>
                              {lang === 'ar' ? g.name_ar || g.name : g.name_en || g.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-ink/75">{t('العنوان التفصيلي', 'Address Line')} *</label>
                      <input
                        type="text"
                        value={addrLine}
                        onChange={(e) => setAddrLine(e.target.value)}
                        placeholder={t('المدينة، الشارع، العمارة، الشقة', 'District, street, building, flat')}
                        className="mt-1.5 w-full rounded-xl border hairline bg-cream/40 px-3.5 py-2.5 text-sm font-bold text-ink focus:outline-none"
                      />
                    </div>

                    <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-ink">
                      <input
                        type="checkbox"
                        checked={addrIsDefault}
                        onChange={(e) => setAddrIsDefault(e.target.checked)}
                        className="h-4 w-4 rounded border-ink/30 text-baladi-red"
                      />
                      <span>{t('تعيين كعنوان افتراضي', 'Set as default address')}</span>
                    </label>

                    <div className="flex gap-2">
                      <button type="submit" disabled={addrSaving} className="btn btn-ink text-xs font-black disabled:opacity-50">
                        {addrSaving ? t('جاري الحفظ...', 'Saving...') : t('حفظ العنوان', 'Save Address')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddrForm(false)}
                        className="rounded-full border hairline px-4 py-2 text-xs font-black text-ink/75 hover:text-ink"
                      >
                        {t('إلغاء', 'Cancel')}
                      </button>
                    </div>
                  </form>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`rounded-[26px] border bg-white p-5 shadow-soft ${
                        addr.is_default ? 'border-baladi-green' : 'hairline'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-black text-ink">{addr.label}</span>
                            {addr.is_default && (
                              <span className="rounded-full bg-baladi-green/10 px-2.5 py-0.5 text-[10px] font-black text-baladi-green">
                                {t('افتراضي', 'Default')}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs font-extrabold text-ink/80">{addr.name}</p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => openEditAddress(addr)}
                            className="rounded-full p-2 text-ink/55 hover:bg-cream hover:text-ink"
                            aria-label={t('تعديل', 'Edit')}
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void deleteAddress(addr.id)}
                            className="rounded-full p-2 text-ink/45 hover:bg-red-50 hover:text-baladi-red"
                            aria-label={t('حذف', 'Delete')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <p className="mt-2 text-xs font-medium leading-relaxed text-ink/75">
                        {addr.full_address || `${addr.governorate} · ${addr.line}`}
                      </p>
                      <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-ink/65" dir="ltr">
                        <Phone className="h-3.5 w-3.5 text-baladi-red" />
                        {addr.phone}
                      </p>
                      {!addr.is_default && (
                        <button
                          type="button"
                          onClick={() => void setDefaultAddress(addr.id)}
                          className="mt-3 text-xs font-black text-baladi-red hover:underline"
                        >
                          {t('تعيين كافتراضي', 'Set as default')}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── TAB: FAVORITES ─────────────────────────────────── */}
            {activeTab === 'favorites' && (
              <div className="space-y-4">
                {favorites.length === 0 ? (
                  <div className="rounded-[28px] border hairline bg-white p-12 text-center shadow-soft">
                    <Heart className="mx-auto h-10 w-10 text-ink/35" />
                    <p className="mt-3 font-black text-ink">{t('قائمة المفضلة فارغة', 'No favorite products yet')}</p>
                    <Link to="/cats" className="btn btn-ink mt-5 inline-flex">
                      {t('استكشف المنتجات', 'Explore Products')}
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {favorites.map((prod) => (
                      <div key={prod.id} className="flex gap-4 rounded-[26px] border hairline bg-white p-4 shadow-soft">
                        <Link
                          to={`/product/${prod.slug}`}
                          className="grid h-24 w-24 shrink-0 place-items-center rounded-2xl bg-cream p-1.5"
                        >
                          <img
                            src={resolveProductImage(prod.image, prod.species)}
                            alt={getProductTitle(prod, lang)}
                            className="max-h-20 w-auto object-contain"
                            onError={(e) => {
                              e.currentTarget.src = getProductFallbackImage(prod.species);
                            }}
                          />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-black text-ink/60">{getCategoryTitle(prod.category, lang)}</p>
                          <Link
                            to={`/product/${prod.slug}`}
                            className="block truncate text-sm font-black text-ink hover:text-baladi-red"
                          >
                            {getProductTitle(prod, lang)}
                          </Link>
                          <p className="mt-1 text-sm font-black text-baladi-red">{egp(prod.price, lang)}</p>
                          <div className="mt-3 flex items-center gap-2">
                            <button
                              type="button"
                              disabled={!prod.in_stock}
                              onClick={() => void addCart(prod, 1, true)}
                              className="inline-flex items-center gap-1 rounded-full bg-ink px-3 py-1.5 text-[11px] font-black text-white hover:opacity-90 disabled:opacity-40"
                            >
                              <ShoppingBag className="h-3 w-3" />
                              <span>{t('أضف للسلة', 'Add')}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => void removeFavorite(prod.id)}
                              className="inline-flex items-center gap-1 rounded-full border hairline px-3 py-1.5 text-[11px] font-black text-ink/70 hover:text-baladi-red"
                            >
                              <Trash2 className="h-3 w-3" />
                              <span>{t('إزالة', 'Remove')}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── TAB: NOTIFICATIONS ─────────────────────────────── */}
            {activeTab === 'notifications' && (
              <div className="rounded-[28px] border hairline bg-white p-6 shadow-soft md:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b hairline pb-4">
                  <div className="flex items-center gap-2.5">
                    <Bell className="h-5 w-5 text-baladi-red" />
                    <h2 className="text-xl font-black text-ink">{t('الإشعارات', 'Notifications')}</h2>
                  </div>
                  {unreadNotifications > 0 && (
                    <button
                      type="button"
                      onClick={() => void markAllNotificationsRead()}
                      className="inline-flex items-center gap-1.5 rounded-full bg-cream px-3.5 py-1.5 text-xs font-black text-ink hover:bg-baladi-yellow/35"
                    >
                      <Check className="h-3.5 w-3.5 text-baladi-green" />
                      <span>{t('تحديد الكل كمقروء', 'Mark all read')}</span>
                    </button>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <p className="py-10 text-center text-sm font-bold text-ink/60">
                    {t('لا توجد إشعارات حالياً', 'No notifications yet')}
                  </p>
                ) : (
                  <ul className="mt-4 divide-y divide-ink/10">
                    {notifications.map((n) => (
                      <li
                        key={n.id}
                        className={`flex items-start justify-between gap-4 py-4 ${
                          !n.read ? 'bg-baladi-yellow/[0.08] -mx-3 px-3 rounded-2xl' : ''
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {!n.read && <span className="h-2 w-2 rounded-full bg-baladi-red" />}
                            <p className="text-sm font-extrabold text-ink">{n.message}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-ink/60">
                            <span>{new Date(n.created_at).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')}</span>
                            {n.data?.order_number && (
                              <Link
                                to={`/track?order=${encodeURIComponent(n.data.order_number)}`}
                                className="font-mono font-black text-baladi-red hover:underline"
                              >
                                {n.data.order_number}
                              </Link>
                            )}
                          </div>
                        </div>
                        {!n.read && (
                          <button
                            type="button"
                            onClick={() => void markNotificationRead(n.id)}
                            className="shrink-0 rounded-full border hairline bg-white px-3 py-1 text-[11px] font-black text-ink hover:bg-cream"
                          >
                            {t('تمت القراءة', 'Mark read')}
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* ── TAB: SECURITY ──────────────────────────────────── */}
            {activeTab === 'security' && (
              <div className="rounded-[28px] border hairline bg-white p-6 shadow-soft md:p-8">
                <div className="flex items-center gap-2.5 border-b hairline pb-4">
                  <ShieldCheck className="h-5 w-5 text-baladi-green" />
                  <h2 className="text-xl font-black text-ink">{t('تغيير كلمة المرور', 'Update Password')}</h2>
                </div>

                {passMsg && (
                  <div
                    className={`mt-5 flex items-center gap-2.5 rounded-2xl p-3.5 text-xs font-bold ${
                      passMsg.type === 'success' ? 'bg-emerald-50 text-baladi-green' : 'bg-red-50 text-baladi-red'
                    }`}
                  >
                    {passMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                    <span>{passMsg.text}</span>
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit} className="mt-6 max-w-md space-y-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-ink/75">
                      {t('كلمة المرور الجديدة (8 أحرف على الأقل)', 'New Password (min 8 chars)')}
                    </label>
                    <input
                      type="password"
                      dir="ltr"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="mt-2 w-full rounded-2xl border hairline bg-cream/40 px-4 py-3 text-sm font-bold text-ink focus:border-baladi-red focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-ink/75">
                      {t('تأكيد كلمة المرور الجديدة', 'Confirm New Password')}
                    </label>
                    <input
                      type="password"
                      dir="ltr"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="mt-2 w-full rounded-2xl border hairline bg-cream/40 px-4 py-3 text-sm font-bold text-ink focus:border-baladi-red focus:bg-white focus:outline-none"
                    />
                  </div>

                  <button type="submit" disabled={passLoading} className="btn btn-ink font-black disabled:opacity-60">
                    {passLoading ? t('جاري التحديث...', 'Updating...') : t('تحديث كلمة المرور', 'Update Password')}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
