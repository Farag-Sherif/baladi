import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Lock,
  Package,
  Heart,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Edit3,
  ShieldCheck,
  RotateCcw,
  Clock,
  Sparkles,
  ChevronRight,
  Truck,
} from 'lucide-react';
import { useAuth, type Pet, type UserAddress } from '../store/auth';
import { useCart } from '../store/cart';
import { useLang } from '../lib/lang';
import { egp } from '../lib/utils';
import { PRODUCTS } from '../data/catalog';
import { Mark, ZigZagBand, DiamondBadge } from '../components/brand/Ornaments';

const GOVS = [
  { ar: 'الجيزة', en: 'Giza' },
  { ar: 'القاهرة', en: 'Cairo' },
  { ar: 'الإسكندرية', en: 'Alexandria' },
  { ar: 'الدقهلية', en: 'Dakahlia' },
  { ar: 'الشرقية', en: 'Sharqia' },
  { ar: 'القليوبية', en: 'Qalyubia' },
  { ar: 'أسيوط', en: 'Assiut' },
  { ar: 'الأقصر', en: 'Luxor' },
];

const AVATARS = ['🐾', '🐱', '🐈', '🐕', '🐶', '❤️', '🦁', '🌿'];

export default function ProfilePage() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated,
    logout,
    updateProfile,
    changePassword,
    pets,
    addPet,
    removePet,
    addresses,
    addAddress,
    removeAddress,
    setDefaultAddress,
    orders,
  } = useAuth();
  const addCart = useCart((s) => s.add);

  type Tab = 'profile' | 'security' | 'pets' | 'orders' | 'addresses';
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  // Edit profile state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [governorate, setGovernorate] = useState(user?.governorate || 'الجيزة');
  const [address, setAddress] = useState(user?.address || '');
  const [avatar, setAvatar] = useState(user?.avatar || '🐾');
  const [preferredSpecies, setPreferredSpecies] = useState<'cats' | 'dogs' | 'both'>(
    user?.preferredSpecies || 'both'
  );
  const [profileMsg, setProfileMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Change password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passMsg, setPassMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [passLoading, setPassLoading] = useState(false);

  // New Pet state
  const [showAddPet, setShowAddPet] = useState(false);
  const [petName, setPetName] = useState('');
  const [petSpecies, setPetSpecies] = useState<'cat' | 'dog'>('cat');
  const [petAge, setPetAge] = useState('');
  const [petWeight, setPetWeight] = useState('');
  const [petFood, setPetFood] = useState('');

  // New Address state
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addrTitle, setAddrTitle] = useState('');
  const [addrGov, setAddrGov] = useState('الجيزة');
  const [addrCity, setAddrCity] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrIsDefault, setAddrIsDefault] = useState(false);

  // If not logged in
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
              'قم بتسجيل الدخول للاطلاع على طلباتك السابقة، إدارة حيواناتك الأليفة، وتعديل بياناتك.',
              'Sign in to view your order history, manage your pets, and edit your details.'
            )}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/login" className="btn btn-ink">
              {t('تسجيل الدخول', 'Sign In')}
            </Link>
            <Link to="/register" className="btn btn-outline-light !text-ink !border-ink/30 hover:!bg-ink/5">
              {t('إنشاء حساب جديد', 'Create Account')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleProfileSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setProfileMsg({ text: t('برجاء إدخال الاسم', 'Please enter your name'), type: 'error' });
      return;
    }
    updateProfile({
      name,
      email,
      phone,
      governorate,
      address,
      avatar,
      preferredSpecies,
    });
    setProfileMsg({ text: t('تم حفظ التعديلات بنجاح!', 'Profile updated successfully!'), type: 'success' });
    setTimeout(() => setProfileMsg(null), 3000);
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPassMsg(null);
    if (!newPassword || newPassword.length < 6) {
      setPassMsg({
        text: t('كلمة المرور يجب أن لا تقل عن 6 أحرف', 'Password must be at least 6 characters'),
        type: 'error',
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassMsg({ text: t('كلمتا المرور غير متطابقتين', 'Passwords do not match'), type: 'error' });
      return;
    }

    setPassLoading(true);
    const res = await changePassword(oldPassword, newPassword);
    setPassLoading(false);

    if (res.success) {
      setPassMsg({
        text: t('تم تغيير كلمة المرور بنجاح!', 'Password changed successfully!'),
        type: 'success',
      });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPassMsg(null), 4000);
    } else {
      setPassMsg({ text: res.error || t('حدث خطأ', 'An error occurred'), type: 'error' });
    }
  };

  const handleAddPet = (e: FormEvent) => {
    e.preventDefault();
    if (!petName.trim()) return;
    addPet({
      name: petName,
      species: petSpecies,
      age: petAge || (petSpecies === 'cat' ? 'سنة واحدة' : 'سنتين'),
      weight: petWeight || (petSpecies === 'cat' ? '4 كجم' : '15 كجم'),
      food: petFood || (petSpecies === 'cat' ? 'طعام بلدى للقطط' : 'طعام بلدى للكلاب'),
    });
    setPetName('');
    setPetAge('');
    setPetWeight('');
    setPetFood('');
    setShowAddPet(false);
  };

  const handleAddAddress = (e: FormEvent) => {
    e.preventDefault();
    if (!addrTitle.trim() || !addrStreet.trim()) return;
    addAddress({
      title: addrTitle,
      governorate: addrGov,
      city: addrCity,
      street: addrStreet,
      isDefault: addrIsDefault,
    });
    setAddrTitle('');
    setAddrCity('');
    setAddrStreet('');
    setAddrIsDefault(false);
    setShowAddAddress(false);
  };

  const handleReorder = (order: typeof orders[0]) => {
    order.items.forEach((item) => {
      const prod = PRODUCTS.find((p) => p.slug === item.slug) || PRODUCTS[0];
      addCart(prod, item.qty);
    });
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-cream pt-[68px] md:pt-[84px]">
      {/* ── PROFILE HEADER BANNER ──────────────────────────────── */}
      <section className="relative overflow-hidden bg-ink py-10 text-cream md:py-14">
        <ZigZagBand color="#FBBB21" height={20} className="absolute inset-x-0 top-0 opacity-80" />
        <div className="u-container relative">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-start">
              <div className="relative">
                <div className="grid h-20 w-20 place-items-center rounded-3xl border-2 border-baladi-yellow bg-ink/80 text-4xl shadow-lift">
                  {user.avatar || '🐾'}
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <h1 className="text-2xl font-black text-white md:text-3xl">{user.name}</h1>
                  <span className="rounded-full bg-baladi-yellow px-2.5 py-0.5 text-xs font-black text-ink">
                    {user.preferredSpecies === 'cats'
                      ? t('محب القطط 🐱', 'Cat Lover 🐱')
                      : user.preferredSpecies === 'dogs'
                      ? t('محب الكلاب 🐕', 'Dog Lover 🐕')
                      : t('صديق كل الحيوانات 🐾', 'Friend of All 🐾')}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-cream/90 sm:justify-start">
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-baladi-yellow" /> {user.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-baladi-yellow" /> {user.phone}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-baladi-yellow" /> {user.governorate}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="flex items-center gap-2 rounded-full border border-red-400/40 bg-red-500/10 px-4 py-2 text-xs font-black text-red-200 transition-colors hover:bg-red-500/20"
              >
                <LogOut className="h-3.5 w-3.5" />
                {t('تسجيل الخروج', 'Sign Out')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROFILE DASHBOARD BODY ─────────────────────────────── */}
      <div className="u-container py-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Navigation Sidebar */}
          <aside className="h-fit rounded-[28px] border hairline bg-white p-3 shadow-soft">
            <nav className="space-y-1">
              {[
                { id: 'profile', icon: UserIcon, label: t('البيانات الشخصية', 'Personal Info') },
                { id: 'security', icon: Lock, label: t('كلمة المرور والأمان', 'Password & Security') },
                { id: 'pets', icon: Heart, label: t('حيواناتي الأليفة', 'My Pets'), count: pets.length },
                { id: 'orders', icon: Package, label: t('طلباتي', 'My Orders'), count: orders.length },
                { id: 'addresses', icon: MapPin, label: t('عناوين التوصيل', 'Addresses'), count: addresses.length },
              ].map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as Tab)}
                    className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-extrabold transition-all ${
                      isActive
                        ? 'bg-ink text-white shadow-sm'
                        : 'text-ink/80 hover:bg-ink/5 hover:text-ink'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`h-4 w-4 ${isActive ? 'text-baladi-yellow' : 'text-ink/60'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.count !== undefined && (
                      <span
                        className={`grid h-5 min-w-[20px] place-items-center rounded-full px-1.5 text-[11px] font-black ${
                          isActive ? 'bg-baladi-red text-white' : 'bg-ink/10 text-ink'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="mt-4 border-t hairline pt-4">
              <Link
                to="/cats"
                className="flex items-center justify-between rounded-2xl bg-baladi-yellow/15 p-3 text-xs font-black text-ink transition-colors hover:bg-baladi-yellow/25"
              >
                <span>{t('تسوق للقطط والكلاب', 'Shop for pets')}</span>
                <ChevronRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </div>
          </aside>

          {/* Tab Content Panel */}
          <main className="min-w-0">
            {/* 1. PERSONAL INFO TAB */}
            {activeTab === 'profile' && (
              <div className="rounded-[32px] border hairline bg-white p-6 shadow-soft md:p-8">
                <div className="flex items-center justify-between border-b hairline pb-5">
                  <div>
                    <h2 className="text-xl font-black text-ink">{t('البيانات الشخصية', 'Personal Info')}</h2>
                    <p className="mt-1 text-xs font-bold text-ink/75">
                      {t('قم بتحديث اسمك وبيانات التواصل الخاصة بك.', 'Update your name and contact details.')}
                    </p>
                  </div>
                  <DiamondBadge size={28} accent="#E84249" dot="#FBBB21" />
                </div>

                {profileMsg && (
                  <div
                    className={`mt-4 flex items-center gap-2 rounded-2xl p-3.5 text-xs font-bold ${
                      profileMsg.type === 'success'
                        ? 'bg-emerald-50 text-baladi-green'
                        : 'bg-red-50 text-baladi-red'
                    }`}
                  >
                    {profileMsg.type === 'success' ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                    ) : (
                      <AlertCircle className="h-4 w-4 shrink-0" />
                    )}
                    <span>{profileMsg.text}</span>
                  </div>
                )}

                <form onSubmit={handleProfileSubmit} className="mt-6 space-y-5">
                  {/* Avatar Picker */}
                  <div>
                    <label className="block text-[12.5px] font-extrabold uppercase tracking-wider text-ink/80">
                      {t('أيقونة الحساب / الصورة الرمزية', 'Account Avatar')}
                    </label>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {AVATARS.map((av) => (
                        <button
                          key={av}
                          type="button"
                          onClick={() => setAvatar(av)}
                          className={`grid h-11 w-11 place-items-center rounded-2xl text-xl transition-all ${
                            avatar === av
                              ? 'scale-110 border-2 border-baladi-red bg-red-50 shadow-sm'
                              : 'border hairline bg-cream/50 hover:bg-white'
                          }`}
                        >
                          {av}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[12.5px] font-extrabold uppercase tracking-wider text-ink/80">
                        {t('الاسم بالكامل', 'Full Name')}
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-2 w-full rounded-2xl border hairline bg-cream/50 py-3 px-4 text-sm font-bold text-ink focus:border-baladi-red focus:bg-white focus:outline-none focus:ring-2 focus:ring-baladi-red/20"
                      />
                    </div>

                    <div>
                      <label className="block text-[12.5px] font-extrabold uppercase tracking-wider text-ink/80">
                        {t('رقم الهاتف', 'Phone Number')}
                      </label>
                      <input
                        type="tel"
                        dir="ltr"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="mt-2 w-full rounded-2xl border hairline bg-cream/50 py-3 px-4 text-sm font-bold text-ink focus:border-baladi-red focus:bg-white focus:outline-none focus:ring-2 focus:ring-baladi-red/20"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[12.5px] font-extrabold uppercase tracking-wider text-ink/80">
                        {t('البريد الإلكتروني', 'Email Address')}
                      </label>
                      <input
                        type="email"
                        dir="ltr"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-2 w-full rounded-2xl border hairline bg-cream/50 py-3 px-4 text-sm font-bold text-ink focus:border-baladi-red focus:bg-white focus:outline-none focus:ring-2 focus:ring-baladi-red/20"
                      />
                    </div>

                    <div>
                      <label className="block text-[12.5px] font-extrabold uppercase tracking-wider text-ink/80">
                        {t('المحافظة', 'Governorate')}
                      </label>
                      <select
                        value={governorate}
                        onChange={(e) => setGovernorate(e.target.value)}
                        className="mt-2 w-full rounded-2xl border hairline bg-cream/50 py-3 px-4 text-sm font-bold text-ink focus:border-baladi-red focus:bg-white focus:outline-none focus:ring-2 focus:ring-baladi-red/20"
                      >
                        {GOVS.map((g) => (
                          <option key={g.en} value={g.ar}>
                            {lang === 'ar' ? g.ar : g.en}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12.5px] font-extrabold uppercase tracking-wider text-ink/80">
                      {t('العنوان الافتراضي للتوصيل', 'Default Delivery Address')}
                    </label>
                    <textarea
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder={lang === 'ar' ? 'الشارع، المنطقة، رقم العقار والشقة...' : 'Street, district, building and flat...'}
                      className="mt-2 w-full rounded-2xl border hairline bg-cream/50 p-3 text-sm font-bold text-ink focus:border-baladi-red focus:bg-white focus:outline-none focus:ring-2 focus:ring-baladi-red/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[12.5px] font-extrabold uppercase tracking-wider text-ink/80">
                      {t('اهتمامك المفضل', 'Pet Preference')}
                    </label>
                    <div className="mt-2 flex max-w-sm gap-2">
                      {[
                        { id: 'cats', label: t('قطط 🐱', 'Cats 🐱') },
                        { id: 'dogs', label: t('كلاب 🐕', 'Dogs 🐕') },
                        { id: 'both', label: t('كلاهما 🐾', 'Both 🐾') },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setPreferredSpecies(item.id as 'cats' | 'dogs' | 'both')}
                          className={`flex-1 rounded-2xl py-2.5 text-xs font-black transition-colors ${
                            preferredSpecies === item.id
                              ? 'bg-ink text-white'
                              : 'border hairline bg-cream/50 text-ink/80 hover:bg-cream'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <button type="submit" className="btn btn-ink">
                      {t('حفظ التعديلات', 'Save Changes')}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 2. PASSWORD & SECURITY TAB */}
            {activeTab === 'security' && (
              <div className="rounded-[32px] border hairline bg-white p-6 shadow-soft md:p-8">
                <div className="flex items-center justify-between border-b hairline pb-5">
                  <div>
                    <h2 className="text-xl font-black text-ink">{t('كلمة المرور والأمان', 'Password & Security')}</h2>
                    <p className="mt-1 text-xs font-bold text-ink/75">
                      {t('قم بتعيين كلمة مرور قوية لحماية حسابك.', 'Set a strong password to protect your account.')}
                    </p>
                  </div>
                  <ShieldCheck className="h-7 w-7 text-baladi-green" />
                </div>

                {passMsg && (
                  <div
                    className={`mt-4 flex items-center gap-2 rounded-2xl p-3.5 text-xs font-bold ${
                      passMsg.type === 'success'
                        ? 'bg-emerald-50 text-baladi-green'
                        : 'bg-red-50 text-baladi-red'
                    }`}
                  >
                    {passMsg.type === 'success' ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                    ) : (
                      <AlertCircle className="h-4 w-4 shrink-0" />
                    )}
                    <span>{passMsg.text}</span>
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit} className="mt-6 max-w-md space-y-4">
                  <div>
                    <label className="block text-[12.5px] font-extrabold uppercase tracking-wider text-ink/80">
                      {t('كلمة المرور الحالية', 'Current Password')}
                    </label>
                    <input
                      type="password"
                      dir="ltr"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="••••••••"
                      className="mt-2 w-full rounded-2xl border hairline bg-cream/50 py-3 px-4 text-sm font-bold text-ink focus:border-baladi-red focus:bg-white focus:outline-none focus:ring-2 focus:ring-baladi-red/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[12.5px] font-extrabold uppercase tracking-wider text-ink/80">
                      {t('كلمة المرور الجديدة', 'New Password')}
                    </label>
                    <input
                      type="password"
                      dir="ltr"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="mt-2 w-full rounded-2xl border hairline bg-cream/50 py-3 px-4 text-sm font-bold text-ink focus:border-baladi-red focus:bg-white focus:outline-none focus:ring-2 focus:ring-baladi-red/20"
                    />
                    <p className="mt-1 text-[11px] font-bold text-ink/65">
                      {t('يجب أن تحتوي على 6 أحرف على الأقل', 'Must be at least 6 characters')}
                    </p>
                  </div>

                  <div>
                    <label className="block text-[12.5px] font-extrabold uppercase tracking-wider text-ink/80">
                      {t('تأكيد كلمة المرور الجديدة', 'Confirm New Password')}
                    </label>
                    <input
                      type="password"
                      dir="ltr"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="mt-2 w-full rounded-2xl border hairline bg-cream/50 py-3 px-4 text-sm font-bold text-ink focus:border-baladi-red focus:bg-white focus:outline-none focus:ring-2 focus:ring-baladi-red/20"
                    />
                  </div>

                  <div className="pt-2">
                    <button type="submit" disabled={passLoading} className="btn btn-ink">
                      {passLoading ? t('جارٍ الحفظ...', 'Saving...') : t('تحديث كلمة المرور', 'Update Password')}
                    </button>
                  </div>
                </form>

                <div className="mt-8 rounded-2xl bg-cream/60 p-4">
                  <p className="text-xs font-black text-ink">{t('نصيحة أمان', 'Security Tip')}</p>
                  <p className="mt-1 text-xs font-bold leading-relaxed text-ink/75">
                    {t(
                      'استخدم كلمة مرور فريدة ولا تشاركها مع أحد. فريق بلدى لن يطلب منك كلمة المرور أبداً.',
                      'Use a unique password and never share it. The BALADI team will never ask for your password.'
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* 3. MY PETS TAB */}
            {activeTab === 'pets' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between rounded-[32px] border hairline bg-white p-6 shadow-soft">
                  <div>
                    <h2 className="text-xl font-black text-ink">{t('حيواناتي الأليفة', 'My Pets')}</h2>
                    <p className="mt-1 text-xs font-bold text-ink/75">
                      {t('سجّل قططك وكلابك لنقدم لك أنسب التوصيات الغذائية.', 'Register your pets for tailored nutritional recommendations.')}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddPet(!showAddPet)}
                    className="btn btn-accent !py-2.5 !px-4 text-xs font-black shadow-sm"
                  >
                    <Plus className="h-4 w-4" />
                    {t('إضافة أليف جديد', 'Add Pet')}
                  </button>
                </div>

                {showAddPet && (
                  <form
                    onSubmit={handleAddPet}
                    className="rounded-[32px] border-2 border-baladi-yellow/70 bg-white p-6 shadow-soft"
                  >
                    <h3 className="text-base font-black text-ink">{t('إضافة حيوان أليف جديد', 'Add New Pet')}</h3>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-extrabold uppercase text-ink/80">{t('اسم الأليف', 'Pet Name')} *</label>
                        <input
                          type="text"
                          required
                          value={petName}
                          onChange={(e) => setPetName(e.target.value)}
                          placeholder={lang === 'ar' ? 'مثال: فلفل، تايجر، لونا...' : 'e.g. Luna, Rocky...'}
                          className="mt-1.5 w-full rounded-2xl border hairline bg-cream/50 py-2.5 px-3.5 text-sm font-bold text-ink focus:border-baladi-red focus:bg-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold uppercase text-ink/80">{t('النوع', 'Species')}</label>
                        <div className="mt-1.5 grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setPetSpecies('cat')}
                            className={`rounded-2xl py-2.5 text-xs font-black transition-colors ${
                              petSpecies === 'cat' ? 'bg-baladi-green text-white' : 'border hairline bg-cream/50 text-ink/80'
                            }`}
                          >
                            🐱 {t('قطة / قط', 'Cat')}
                          </button>
                          <button
                            type="button"
                            onClick={() => setPetSpecies('dog')}
                            className={`rounded-2xl py-2.5 text-xs font-black transition-colors ${
                              petSpecies === 'dog' ? 'bg-baladi-red text-white' : 'border hairline bg-cream/50 text-ink/80'
                            }`}
                          >
                            🐕 {t('كلب', 'Dog')}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold uppercase text-ink/80">{t('العمر التقريبي', 'Age')}</label>
                        <input
                          type="text"
                          value={petAge}
                          onChange={(e) => setPetAge(e.target.value)}
                          placeholder={lang === 'ar' ? 'مثال: 8 شهور، سنتين...' : 'e.g. 8 months, 2 years...'}
                          className="mt-1.5 w-full rounded-2xl border hairline bg-cream/50 py-2.5 px-3.5 text-sm font-bold text-ink focus:border-baladi-red focus:bg-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold uppercase text-ink/80">{t('الوزن (كجم)', 'Weight (kg)')}</label>
                        <input
                          type="text"
                          value={petWeight}
                          onChange={(e) => setPetWeight(e.target.value)}
                          placeholder={lang === 'ar' ? 'مثال: 4 كجم' : 'e.g. 4 kg'}
                          className="mt-1.5 w-full rounded-2xl border hairline bg-cream/50 py-2.5 px-3.5 text-sm font-bold text-ink focus:border-baladi-red focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-xs font-extrabold uppercase text-ink/80">{t('الأكل المفضل / ملاحظات التغذية', 'Favorite Food / Notes')}</label>
                      <input
                        type="text"
                        value={petFood}
                        onChange={(e) => setPetFood(e.target.value)}
                        placeholder={lang === 'ar' ? 'مثال: طعام جاف بالدجاج والسمك' : 'e.g. Chicken & fish dry food'}
                        className="mt-1.5 w-full rounded-2xl border hairline bg-cream/50 py-2.5 px-3.5 text-sm font-bold text-ink focus:border-baladi-red focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="mt-5 flex gap-2">
                      <button type="submit" className="btn btn-ink !py-2.5 !px-5 text-xs font-black">
                        {t('حفظ الأليف', 'Save Pet')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddPet(false)}
                        className="btn btn-ghost !py-2.5 !px-4 text-xs font-black"
                      >
                        {t('إلغاء', 'Cancel')}
                      </button>
                    </div>
                  </form>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  {pets.map((p) => {
                    const isCat = p.species === 'cat';
                    return (
                      <div
                        key={p.id}
                        className={`relative flex flex-col justify-between overflow-hidden rounded-[28px] border bg-white p-5 shadow-soft transition-all hover:shadow-lift ${
                          isCat ? 'border-baladi-green/30' : 'border-baladi-red/30'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-cream text-2xl">
                                {isCat ? '🐱' : '🐕'}
                              </span>
                              <div>
                                <h4 className="text-lg font-black text-ink">{p.name}</h4>
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[11px] font-black ${
                                    isCat
                                      ? 'bg-baladi-green/10 text-baladi-green'
                                      : 'bg-baladi-red/10 text-baladi-red'
                                  }`}
                                >
                                  {isCat ? t('قط بلدي', 'Baladi Cat') : t('كلب بلدي', 'Baladi Dog')}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => removePet(p.id)}
                              className="rounded-full p-2 text-ink/40 transition-colors hover:bg-red-50 hover:text-baladi-red"
                              aria-label={t('حذف', 'Remove')}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="mt-4 space-y-1.5 text-xs font-bold text-ink/80">
                            <div className="flex justify-between border-b hairline py-1.5">
                              <span className="text-ink/60">{t('العمر', 'Age')}</span>
                              <span className="font-black text-ink">{p.age}</span>
                            </div>
                            <div className="flex justify-between border-b hairline py-1.5">
                              <span className="text-ink/60">{t('الوزن', 'Weight')}</span>
                              <span className="font-black text-ink">{p.weight}</span>
                            </div>
                            <div className="flex justify-between py-1.5">
                              <span className="text-ink/60">{t('التغذية المفضلة', 'Favorite Food')}</span>
                              <span className="max-w-[180px] truncate text-end font-black text-ink">{p.food}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t hairline">
                          <Link
                            to={isCat ? '/cats' : '/dogs'}
                            className={`inline-flex items-center gap-1.5 text-xs font-black ${
                              isCat ? 'text-baladi-green hover:underline' : 'text-baladi-red hover:underline'
                            }`}
                          >
                            <span>{t('تسوق أكل مناسب لـ', 'Shop food for')} {p.name}</span>
                            <span className="inline-block rtl:rotate-180">→</span>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between rounded-[32px] border hairline bg-white p-6 shadow-soft">
                  <div>
                    <h2 className="text-xl font-black text-ink">{t('سجل الطلبات', 'Order History')}</h2>
                    <p className="mt-1 text-xs font-bold text-ink/75">
                      {t('تابع حالة شحناتك وأعد طلب المنتجات بضغطة واحدة.', 'Track shipments and re-order with a single tap.')}
                    </p>
                  </div>
                  <Package className="h-7 w-7 text-baladi-red" />
                </div>

                {orders.length === 0 ? (
                  <div className="rounded-[32px] border hairline bg-white p-12 text-center shadow-soft">
                    <Package className="mx-auto h-12 w-12 text-ink/30" />
                    <h3 className="mt-3 text-lg font-black text-ink">{t('لا توجد طلبات سابقة', 'No past orders')}</h3>
                    <p className="mt-1 text-sm font-bold text-ink/70">
                      {t('اطلب الآن وجبة بلدى المغذية لحيواناتك.', 'Order nutritious Baladi meals for your pets today.')}
                    </p>
                    <Link to="/cats" className="btn btn-ink mt-5">
                      {t('ابدأ التسوق الآن', 'Start Shopping Now')}
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((ord) => {
                      const isDelivered = ord.status === 'delivered';
                      return (
                        <div
                          key={ord.id}
                          className="overflow-hidden rounded-[30px] border hairline bg-white shadow-soft transition-all hover:shadow-lift"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3 border-b hairline bg-cream/40 p-5 text-xs font-bold text-ink/80">
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="rounded-xl bg-ink px-3 py-1 font-mono font-black text-white">
                                {ord.orderNumber}
                              </span>
                              <span className="flex items-center gap-1.5 text-ink/70">
                                <Clock className="h-3.5 w-3.5" />
                                {ord.date}
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <span
                                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black ${
                                  isDelivered
                                    ? 'bg-emerald-100 text-baladi-green'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {isDelivered ? (
                                  <>
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    {t('تم التسليم', 'Delivered')}
                                  </>
                                ) : (
                                  <>
                                    <Truck className="h-3.5 w-3.5" />
                                    {t('قيد التوصيل', 'In Transit')}
                                  </>
                                )}
                              </span>
                            </div>
                          </div>

                          <div className="p-5">
                            <div className="space-y-3">
                              {ord.items.map((item) => (
                                <div key={item.id} className="flex items-center gap-3.5">
                                  <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-cream p-1">
                                    <img src={item.image} alt="" className="max-h-14 w-auto object-contain" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-black text-ink">
                                      {lang === 'ar' ? item.nameAr : item.nameEn}
                                    </p>
                                    <p className="text-xs font-bold text-ink/70">
                                      {item.weight} · {item.qty} × {egp(item.price, lang)}
                                    </p>
                                  </div>
                                  <span className="text-sm font-black text-ink">
                                    {egp(item.price * item.qty, lang)}
                                  </span>
                                </div>
                              ))}
                            </div>

                            <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t hairline pt-4">
                              <div className="text-xs font-bold text-ink/75">
                                <span className="text-ink/60">{t('العنوان:', 'Address:')}</span>{' '}
                                <span className="text-ink">{ord.address}</span>
                              </div>

                              <div className="flex items-center gap-4">
                                <div className="text-end">
                                  <p className="text-xs font-bold text-ink/60">{t('الإجمالي مع الشحن', 'Total with shipping')}</p>
                                  <p className="text-base font-black text-ink">{egp(ord.total, lang)}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleReorder(ord)}
                                  className="inline-flex items-center gap-1.5 rounded-full bg-baladi-yellow px-4 py-2 text-xs font-black text-ink shadow-sm transition-transform hover:-translate-y-0.5"
                                >
                                  <RotateCcw className="h-3.5 w-3.5" />
                                  {t('إعادة الطلب', 'Reorder')}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 5. ADDRESSES TAB */}
            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between rounded-[32px] border hairline bg-white p-6 shadow-soft">
                  <div>
                    <h2 className="text-xl font-black text-ink">{t('عناوين التوصيل', 'Delivery Addresses')}</h2>
                    <p className="mt-1 text-xs font-bold text-ink/75">
                      {t('احفظ عناوينك لتسريع عملية الطلب مستقبلاً.', 'Save addresses to speed up future checkout.')}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddAddress(!showAddAddress)}
                    className="btn btn-accent !py-2.5 !px-4 text-xs font-black shadow-sm"
                  >
                    <Plus className="h-4 w-4" />
                    {t('إضافة عنوان', 'Add Address')}
                  </button>
                </div>

                {showAddAddress && (
                  <form
                    onSubmit={handleAddAddress}
                    className="rounded-[32px] border-2 border-baladi-yellow/70 bg-white p-6 shadow-soft"
                  >
                    <h3 className="text-base font-black text-ink">{t('إضافة عنوان توصيل جديد', 'Add New Address')}</h3>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-extrabold uppercase text-ink/80">{t('اسم العنوان (مثال: المنزل، المكتب)', 'Title')} *</label>
                        <input
                          type="text"
                          required
                          value={addrTitle}
                          onChange={(e) => setAddrTitle(e.target.value)}
                          placeholder={lang === 'ar' ? 'المنزل' : 'Home'}
                          className="mt-1.5 w-full rounded-2xl border hairline bg-cream/50 py-2.5 px-3.5 text-sm font-bold text-ink focus:border-baladi-red focus:bg-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold uppercase text-ink/80">{t('المحافظة', 'Governorate')}</label>
                        <select
                          value={addrGov}
                          onChange={(e) => setAddrGov(e.target.value)}
                          className="mt-1.5 w-full rounded-2xl border hairline bg-cream/50 py-2.5 px-3.5 text-sm font-bold text-ink focus:border-baladi-red focus:bg-white focus:outline-none"
                        >
                          {GOVS.map((g) => (
                            <option key={g.en} value={g.ar}>
                              {lang === 'ar' ? g.ar : g.en}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold uppercase text-ink/80">{t('المدينة / الحي', 'City / District')}</label>
                        <input
                          type="text"
                          value={addrCity}
                          onChange={(e) => setAddrCity(e.target.value)}
                          placeholder={lang === 'ar' ? 'الدقي / المعادي / سموحة...' : 'District or area'}
                          className="mt-1.5 w-full rounded-2xl border hairline bg-cream/50 py-2.5 px-3.5 text-sm font-bold text-ink focus:border-baladi-red focus:bg-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold uppercase text-ink/80">{t('الشارع وتفاصيل العمارة', 'Street & Details')} *</label>
                        <input
                          type="text"
                          required
                          value={addrStreet}
                          onChange={(e) => setAddrStreet(e.target.value)}
                          placeholder={lang === 'ar' ? 'شارع الهرم، عمارة 14 الدور 3 شقة 6' : 'Street name, building and floor'}
                          className="mt-1.5 w-full rounded-2xl border hairline bg-cream/50 py-2.5 px-3.5 text-sm font-bold text-ink focus:border-baladi-red focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={addrIsDefault}
                          onChange={(e) => setAddrIsDefault(e.target.checked)}
                          className="h-4 w-4 rounded border-ink/30 text-baladi-red focus:ring-baladi-red"
                        />
                        <span className="text-xs font-bold text-ink/80">{t('تعيين كعنوان افتراضي للتوصيل', 'Set as default delivery address')}</span>
                      </label>
                    </div>

                    <div className="mt-5 flex gap-2">
                      <button type="submit" className="btn btn-ink !py-2.5 !px-5 text-xs font-black">
                        {t('حفظ العنوان', 'Save Address')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddAddress(false)}
                        className="btn btn-ghost !py-2.5 !px-4 text-xs font-black"
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
                      className={`relative flex flex-col justify-between rounded-[28px] border bg-white p-5 shadow-soft ${
                        addr.isDefault ? 'border-2 border-baladi-yellow bg-yellow-50/20' : 'hairline'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-baladi-red" />
                            <h4 className="text-base font-black text-ink">{addr.title}</h4>
                          </div>
                          {addr.isDefault ? (
                            <span className="rounded-full bg-baladi-yellow px-2.5 py-0.5 text-[10.5px] font-black text-ink">
                              {t('الافتراضي', 'Default')}
                            </span>
                          ) : (
                            <button
                              onClick={() => setDefaultAddress(addr.id)}
                              className="text-xs font-bold text-baladi-red hover:underline"
                            >
                              {t('جعله الافتراضي', 'Set default')}
                            </button>
                          )}
                        </div>

                        <p className="mt-3 text-xs font-bold leading-relaxed text-ink/80">
                          {addr.street}
                        </p>
                        <p className="mt-1 text-xs font-black text-ink/65">
                          {addr.city ? `${addr.city}، ` : ''}{addr.governorate}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-end border-t hairline pt-3">
                        <button
                          onClick={() => removeAddress(addr.id)}
                          className="rounded-full p-1.5 text-ink/40 transition-colors hover:bg-red-50 hover:text-baladi-red"
                          aria-label={t('حذف', 'Remove')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
