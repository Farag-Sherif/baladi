import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Eye, EyeOff, UserPlus, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../store/auth';
import { useLang } from '../lib/lang';
import { Mark, ZigZagBand } from '../components/brand/Ornaments';

export default function RegisterPage() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [agree, setAgree] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError(t('برجاء إدخال الاسم بالكامل', 'Please enter your full name'));
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError(t('برجاء إدخال بريد إلكتروني صحيح', 'Please enter a valid email address'));
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      setError(t('برجاء إدخال رقم هاتف صحيح', 'Please enter a valid phone number'));
      return;
    }
    if (!password || password.length < 8) {
      setError(t('كلمة المرور يجب أن لا تقل عن 8 أحرف', 'Password must be at least 8 characters'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('كلمتا المرور غير متطابقتين', 'Passwords do not match'));
      return;
    }
    if (!agree) {
      setError(t('يجب الموافقة على الشروط وسياسة الاستخدام', 'You must agree to the terms and privacy policy'));
      return;
    }

    setLoading(true);
    const res = await register({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password,
      password_confirmation: confirmPassword,
    });
    setLoading(false);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/profile', { replace: true });
      }, 450);
    } else {
      setError(res.error || t('حدث خطأ أثناء إنشاء الحساب', 'Error creating account'));
    }
  };

  return (
    <div className="min-h-screen bg-white pt-[68px] md:pt-[84px]">
      <div className="relative overflow-hidden bg-white border-b hairline py-12 text-ink">
        <ZigZagBand color="#E84249" height={16} className="absolute inset-x-0 top-0 opacity-40" />
        <div className="u-container relative text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <Mark tone="red" className="h-10" />
          </div>
          <p className="t-eyebrow text-baladi-red">{t('انضم لعائلة بلدى', 'JOIN THE BALADI FAMILY')}</p>
          <h1 className="t-display mt-2 text-[clamp(2rem,4.5vw,3.2rem)] text-ink">
            {t('إنشاء حساب جديد', 'Create Account')}
          </h1>
          <p className="mt-3 text-[15px] font-medium text-ink/80">
            {t('سجّل حسابك لحفظ عناوينك ومتابعة طلباتك والمفضلة بسهولة.', 'Create your account to save addresses, track orders, and manage favorites.')}
          </p>
        </div>
      </div>

      <div className="u-container py-10 pb-20">
        <div className="mx-auto max-w-xl rounded-[32px] border hairline bg-white p-6 shadow-soft md:p-8">
          <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5 text-center text-sm font-black">
            <Link
              to="/login"
              className="rounded-xl py-2.5 text-ink/75 transition-colors hover:text-ink"
            >
              {t('تسجيل الدخول', 'Sign In')}
            </Link>
            <span className="rounded-xl bg-ink py-2.5 text-white shadow-sm">
              {t('حساب جديد', 'Create Account')}
            </span>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-2.5 rounded-2xl bg-red-50 p-3.5 text-[13px] font-bold text-baladi-red">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 flex items-center gap-2.5 rounded-2xl bg-emerald-50 p-3.5 text-[13px] font-bold text-baladi-green">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>{t('تم إنشاء الحساب بنجاح! جارٍ نقلك لملفك الشخصي...', 'Account created successfully! Redirecting...')}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12.5px] font-extrabold uppercase tracking-wider text-ink/80">
                {t('الاسم بالكامل', 'Full Name')} *
              </label>
              <div className="relative mt-2">
                <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5 text-ink/50">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={lang === 'ar' ? 'مثال: سارة أحمد' : 'e.g. Sarah Ahmed'}
                  className="w-full rounded-2xl border hairline bg-cream/50 py-3 pe-4 ps-10 text-sm font-bold text-ink placeholder:text-ink/40 focus:border-baladi-red focus:bg-white focus:outline-none focus:ring-2 focus:ring-baladi-red/20"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[12.5px] font-extrabold uppercase tracking-wider text-ink/80">
                  {t('البريد الإلكتروني', 'Email')} *
                </label>
                <div className="relative mt-2">
                  <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5 text-ink/50">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    dir="ltr"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-2xl border hairline bg-cream/50 py-3 pe-4 ps-10 text-sm font-bold text-ink placeholder:text-ink/40 focus:border-baladi-red focus:bg-white focus:outline-none focus:ring-2 focus:ring-baladi-red/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12.5px] font-extrabold uppercase tracking-wider text-ink/80">
                  {t('رقم الهاتف / الواتساب', 'Mobile / WhatsApp')} *
                </label>
                <div className="relative mt-2">
                  <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5 text-ink/50">
                    <Phone className="h-4 w-4" />
                  </span>
                  <input
                    type="tel"
                    dir="ltr"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01012345678"
                    className="w-full rounded-2xl border hairline bg-cream/50 py-3 pe-4 ps-10 text-sm font-bold text-ink placeholder:text-ink/40 focus:border-baladi-red focus:bg-white focus:outline-none focus:ring-2 focus:ring-baladi-red/20"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[12.5px] font-extrabold uppercase tracking-wider text-ink/80">
                  {t('كلمة المرور (8 أحرف على الأقل)', 'Password (min 8 chars)')} *
                </label>
                <div className="relative mt-2">
                  <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5 text-ink/50">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type={showPass ? 'text' : 'password'}
                    dir="ltr"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border hairline bg-cream/50 py-3 pe-11 ps-10 text-sm font-bold text-ink placeholder:text-ink/40 focus:border-baladi-red focus:bg-white focus:outline-none focus:ring-2 focus:ring-baladi-red/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute inset-y-0 end-0 flex items-center pe-3.5 text-ink/50 hover:text-ink"
                    aria-label={showPass ? t('إخفاء كلمة المرور', 'Hide password') : t('إظهار كلمة المرور', 'Show password')}
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[12.5px] font-extrabold uppercase tracking-wider text-ink/80">
                  {t('تأكيد كلمة المرور', 'Confirm Password')} *
                </label>
                <div className="relative mt-2">
                  <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5 text-ink/50">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type={showPass ? 'text' : 'password'}
                    dir="ltr"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border hairline bg-cream/50 py-3 pe-4 ps-10 text-sm font-bold text-ink placeholder:text-ink/40 focus:border-baladi-red focus:bg-white focus:outline-none focus:ring-2 focus:ring-baladi-red/20"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex cursor-pointer items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-ink/30 text-baladi-red focus:ring-baladi-red"
                />
                <span className="text-[12.5px] font-bold leading-relaxed text-ink/80">
                  {t(
                    'أوافق على شروط الاستخدام وسياسة الخصوصية الخاصة بمتجر بلدى.',
                    'I agree to the terms of use and privacy policy of BALADI store.'
                  )}
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="btn btn-ink mt-3 w-full text-[15px] font-black shadow-md hover:shadow-lg disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {t('جارٍ إنشاء الحساب...', 'Creating account...')}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  {t('إنشاء الحساب الآن', 'Create Account Now')}
                </span>
              )}
            </button>
          </form>

          <div className="mt-6 border-t hairline pt-5 text-center">
            <p className="text-[13.5px] font-bold text-ink/75">
              {t('لديك حساب بالفعل؟', 'Already have an account?')}{' '}
              <Link to="/login" className="font-black text-baladi-red hover:underline">
                {t('سجل الدخول هنا', 'Sign in here')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
