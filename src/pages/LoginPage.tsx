import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../store/auth';
import { useLang } from '../lib/lang';
import { Mark, ZigZagBand, DiamondBadge } from '../components/brand/Ornaments';

export default function LoginPage() {
  const { t, lang, dir } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // If already logged in, show logged-in prompt or allow redirect
  const from = (location.state as { from?: string })?.from || '/profile';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!identifier.trim()) {
      setError(t('برجاء إدخال البريد الإلكتروني أو رقم الهاتف', 'Please enter your email or phone number'));
      return;
    }
    if (!password) {
      setError(t('برجاء إدخال كلمة المرور', 'Please enter your password'));
      return;
    }

    setLoading(true);
    const res = await login(identifier, password);
    setLoading(false);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 700);
    } else {
      setError(res.error || t('حدث خطأ أثناء تسجيل الدخول', 'Error signing in'));
    }
  };

  return (
    <div className="min-h-screen bg-cream pt-[68px] md:pt-[84px]">
      <div className="relative overflow-hidden bg-ink py-12 text-cream">
        <ZigZagBand color="#FBBB21" height={20} className="absolute inset-x-0 top-0 opacity-80" />
        <div className="u-container relative text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <Mark tone="red" white className="h-10" />
          </div>
          <p className="t-eyebrow text-baladi-yellow">{t('أهلاً بك مجدداً', 'WELCOME BACK')}</p>
          <h1 className="t-display mt-2 text-[clamp(2rem,4.5vw,3.2rem)] text-white">
            {t('تسجيل الدخول', 'Sign In')}
          </h1>
          <p className="mt-3 text-[15px] font-medium text-cream/90">
            {t('تابع طلباتك وأكل قططك وكلابك البلدى من مكان واحد.', 'Track your orders and your pets’ nourishment in one place.')}
          </p>
        </div>
      </div>

      <div className="u-container -mt-6 pb-20">
        <div className="mx-auto max-w-md rounded-[32px] border hairline bg-white p-6 shadow-soft md:p-8">
          {/* Top navigation tabs between Sign In & Register */}
          <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-cream p-1.5 text-center text-sm font-black">
            <span className="rounded-xl bg-ink py-2.5 text-white shadow-sm">
              {t('تسجيل الدخول', 'Sign In')}
            </span>
            <Link
              to="/register"
              className="rounded-xl py-2.5 text-ink/75 transition-colors hover:text-ink"
            >
              {t('حساب جديد', 'Create Account')}
            </Link>
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
              <span>{t('تم تسجيل الدخول بنجاح! جارٍ التحويل...', 'Signed in successfully! Redirecting...')}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12.5px] font-extrabold uppercase tracking-wider text-ink/80">
                {t('البريد الإلكتروني أو رقم الهاتف', 'Email or Mobile Number')}
              </label>
              <div className="relative mt-2">
                <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5 text-ink/50">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  dir="ltr"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={lang === 'ar' ? 'name@example.com أو 010xxxxxxxx' : 'name@example.com or 010xxxxxxxx'}
                  className="w-full rounded-2xl border hairline bg-cream/50 py-3 ps-10 pe-4 text-sm font-bold text-ink placeholder:text-ink/40 focus:border-baladi-red focus:bg-white focus:outline-none focus:ring-2 focus:ring-baladi-red/20"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-[12.5px] font-extrabold uppercase tracking-wider text-ink/80">
                  {t('كلمة المرور', 'Password')}
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[12px] font-black text-baladi-red hover:underline"
                >
                  {t('نسيت كلمة المرور؟', 'Forgot Password?')}
                </Link>
              </div>
              <div className="relative mt-2">
                <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5 text-ink/50">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type={showPass ? 'text' : 'password'}
                  dir="ltr"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border hairline bg-cream/50 py-3 ps-10 pe-11 text-sm font-bold text-ink placeholder:text-ink/40 focus:border-baladi-red focus:bg-white focus:outline-none focus:ring-2 focus:ring-baladi-red/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute inset-y-0 end-0 flex items-center pe-3.5 text-ink/50 hover:text-ink"
                  aria-label={showPass ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-ink/30 text-baladi-red focus:ring-baladi-red"
                />
                <span className="text-[13px] font-bold text-ink/80">{t('تذكرني على هذا الجهاز', 'Remember me')}</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="btn btn-ink mt-2 w-full text-[15px] font-black shadow-md hover:shadow-lg disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {t('جارٍ التحقق...', 'Verifying...')}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  {t('تسجيل الدخول', 'Sign In')}
                </span>
              )}
            </button>
          </form>

          <div className="mt-6 border-t hairline pt-5 text-center">
            <p className="text-[13.5px] font-bold text-ink/75">
              {t('ليس لديك حساب بعد؟', "Don't have an account yet?")}{' '}
              <Link to="/register" className="font-black text-baladi-red hover:underline">
                {t('أنشئ حسابك الآن', 'Create account now')}
              </Link>
            </p>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-ink/60">
            <DiamondBadge size={18} accent="#E84249" dot="#FBBB21" />
            <span>{t('طعام بلدى أصيل للحيوانات البلدى وكل الحيوانات', 'Authentic Baladi food for all animals')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
