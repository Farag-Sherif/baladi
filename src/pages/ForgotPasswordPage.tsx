import { useState, useEffect, useRef, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Mail,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  RotateCcw,
  MessageCircle,
} from 'lucide-react';
import { useAuth } from '../store/auth';
import { useStorefront } from '../store/storefront';
import { useLang } from '../lib/lang';
import { Mark, ZigZagBand } from '../components/brand/Ornaments';

type Step = 'request' | 'reset' | 'success';

export default function ForgotPasswordPage() {
  const { t, lang } = useLang();
  const isRtl = lang === 'ar';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { forgotPassword, resetPassword, isAuthenticated } = useAuth();
  const settings = useStorefront((s) => s.settings);

  const initialEmail = searchParams.get('email') || '';
  const initialToken = searchParams.get('token') || searchParams.get('code') || '';

  const [step, setStep] = useState<Step>(initialToken ? 'reset' : 'request');
  const [email, setEmail] = useState(initialEmail);
  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync token or email from query parameters if loaded via email link
  useEffect(() => {
    if (initialToken) {
      setToken(initialToken);
      setStep('reset');
    }
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialToken, initialEmail]);

  // Handle 60s cooldown timer for backend throttle
  useEffect(() => {
    if (resendCooldown <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resendCooldown]);

  const handleRequestCode = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setInfoMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError(t('برجاء إدخال بريد إلكتروني صحيح', 'Please enter a valid email address'));
      return;
    }

    setLoading(true);
    const res = await forgotPassword(cleanEmail);
    setLoading(false);

    if (res.success) {
      setStep('reset');
      setResendCooldown(60);
      setInfoMessage(
        t(
          'تم إرسال كود الاستعادة إلى بريدك الإلكتروني (صالح لمدة 60 دقيقة). تفقد البريد الوارد أو مجلد الرسائل غير المرغوب فيها (Spam).',
          'A reset code has been sent to your email (valid for 60 minutes). Please check your inbox or spam folder.'
        )
      );
    } else {
      setError(res.error || t('تعذر إرسال كود الاستعادة', 'Failed to send reset code'));
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    const cleanEmail = email.trim();
    const cleanToken = token.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError(t('برجاء إدخال البريد الإلكتروني', 'Please enter your email'));
      return;
    }
    if (!cleanToken) {
      setError(t('برجاء إدخال كود الاستعادة المكون من 64 رمزاً', 'Please enter the reset code received in your email'));
      return;
    }
    if (!password || password.length < 8) {
      setError(t('كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل', 'New password must be at least 8 characters'));
      return;
    }
    if (password !== passwordConfirmation) {
      setError(t('كلمتا المرور غير متطابقتين', 'Passwords do not match'));
      return;
    }

    setLoading(true);
    const res = await resetPassword({
      email: cleanEmail,
      token: cleanToken,
      password,
      password_confirmation: passwordConfirmation,
    });
    setLoading(false);

    if (res.success) {
      setStep('success');
    } else {
      setError(
        res.error ||
          t('كود الاستعادة غير صحيح أو انتهت صلاحيته. يرجى طلب كود جديد.', 'The reset code is invalid or has expired.')
      );
    }
  };

  const whatsappDigits = (settings?.whatsapp || settings?.store_phone || '').replace(/[^\d]/g, '');

  return (
    <div className="min-h-screen bg-white pt-[68px] md:pt-[84px]">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-white border-b hairline py-12 text-ink">
        <ZigZagBand color="#E84249" height={16} className="absolute inset-x-0 top-0 opacity-40" />
        <div className="u-container relative text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <Mark tone="red" className="h-10" />
          </div>
          <p className="t-eyebrow text-baladi-red">{t('استعادة الحساب والأمان', 'ACCOUNT RECOVERY')}</p>
          <h1 className="t-display mt-2 text-[clamp(2rem,4.5vw,3.2rem)] text-ink">
            {t('استعادة كلمة المرور', 'Password Recovery')}
          </h1>
          <p className="mt-3 text-[15px] font-medium text-ink/80 max-w-md mx-auto">
            {t(
              'أدخل بريدك الإلكتروني لإعادة تعيين كلمة المرور واستعادة الوصول إلى حسابك.',
              'Reset your password securely and regain access to your Baladi account.'
            )}
          </p>
        </div>
      </div>

      <div className="u-container py-10 pb-20">
        <div className="mx-auto max-w-md rounded-[32px] border hairline bg-white p-6 shadow-soft md:p-8">
          {/* Progress Indicators */}
          {step !== 'success' && (
            <div className="mb-6 flex items-center justify-between border-b hairline pb-4 text-xs font-black">
              <button
                type="button"
                onClick={() => setStep('request')}
                className={`flex items-center gap-1.5 transition-colors ${
                  step === 'request' ? 'text-baladi-red' : 'text-ink/60 hover:text-ink'
                }`}
              >
                <span
                  className={`grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold ${
                    step === 'request' ? 'bg-baladi-red text-white' : 'bg-cream text-ink'
                  }`}
                >
                  1
                </span>
                <span>{t('طلب الكود', 'Request Code')}</span>
              </button>

              <div className="h-0.5 flex-1 mx-3 bg-cream" />

              <button
                type="button"
                onClick={() => setStep('reset')}
                className={`flex items-center gap-1.5 transition-colors ${
                  step === 'reset' ? 'text-baladi-red' : 'text-ink/60 hover:text-ink'
                }`}
              >
                <span
                  className={`grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold ${
                    step === 'reset' ? 'bg-baladi-red text-white' : 'bg-cream text-ink'
                  }`}
                >
                  2
                </span>
                <span>{t('تعيين كلمة المرور', 'New Password')}</span>
              </button>
            </div>
          )}

          {/* Feedback messages */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-2xl bg-red-50 p-3.5 text-[13px] font-bold text-baladi-red animate-in fade-in">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {infoMessage && (
            <div className="mb-5 flex items-start gap-2.5 rounded-2xl bg-emerald-50 p-3.5 text-[13px] font-bold text-baladi-green animate-in fade-in">
              <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{infoMessage}</span>
            </div>
          )}

          {/* STEP 1: REQUEST RESET CODE */}
          {step === 'request' && (
            <form onSubmit={handleRequestCode} className="space-y-4">
              <div className="rounded-2xl border hairline bg-cream/30 p-4 text-xs font-bold text-ink/80 leading-relaxed">
                <ShieldCheck className="h-5 w-5 text-baladi-green mb-1.5 inline-block me-1.5" />
                {t(
                  'أدخل البريد الإلكتروني المسجل لدينا وسنرسل لك كود تحقق سري صالح لمدة 60 دقيقة لإعادة تعيين كلمة المرور.',
                  'Enter your registered email address and we will send you a 60-minute reset code.'
                )}
              </div>

              <div>
                <label className="block text-[12.5px] font-extrabold uppercase tracking-wider text-ink/80">
                  {t('البريد الإلكتروني', 'Email Address')}
                </label>
                <div className="relative mt-2">
                  <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5 text-ink/50">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    dir="ltr"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-2xl border hairline bg-cream/50 py-3 pe-4 ps-10 text-sm font-bold text-ink placeholder:text-ink/40 focus:border-baladi-red focus:bg-white focus:outline-none focus:ring-2 focus:ring-baladi-red/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-red flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black shadow-md disabled:opacity-50"
              >
                <span>{loading ? t('جارٍ الإرسال...', 'Sending...') : t('إرسال كود الاستعادة', 'Send Reset Code')}</span>
                {isRtl ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep('reset')}
                  className="text-xs font-black text-ink/70 hover:text-baladi-red hover:underline"
                >
                  {t('لديك كود بالفعل؟ أدخل الكود هنا', 'Already have a code? Enter it here')}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: RESET PASSWORD */}
          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-[12.5px] font-extrabold uppercase tracking-wider text-ink/80">
                    {t('البريد الإلكتروني', 'Email Address')}
                  </label>
                  <button
                    type="button"
                    onClick={() => setStep('request')}
                    className="text-[11px] font-black text-baladi-red hover:underline"
                  >
                    {t('تغيير البريد', 'Change Email')}
                  </button>
                </div>
                <div className="relative mt-2">
                  <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5 text-ink/50">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    dir="ltr"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-2xl border hairline bg-cream/50 py-3 pe-4 ps-10 text-sm font-bold text-ink placeholder:text-ink/40 focus:border-baladi-red focus:bg-white focus:outline-none focus:ring-2 focus:ring-baladi-red/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12.5px] font-extrabold uppercase tracking-wider text-ink/80">
                  {t('كود الاستعادة (من البريد الإلكتروني)', 'Reset Code (from email)')}
                </label>
                <div className="relative mt-2">
                  <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5 text-ink/50">
                    <KeyRound className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    dir="ltr"
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder={t('الصق كود الاستعادة المكون من 64 رمزاً...', 'Paste 64-char reset code...')}
                    className="w-full font-mono rounded-2xl border hairline bg-cream/50 py-3 pe-4 ps-10 text-xs font-bold text-ink placeholder:text-ink/40 focus:border-baladi-red focus:bg-white focus:outline-none focus:ring-2 focus:ring-baladi-red/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12.5px] font-extrabold uppercase tracking-wider text-ink/80">
                  {t('كلمة المرور الجديدة', 'New Password')}
                </label>
                <div className="relative mt-2">
                  <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5 text-ink/50">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type={showPass ? 'text' : 'password'}
                    dir="ltr"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="•••••••• (8 أحرف فأكثر)"
                    className="w-full rounded-2xl border hairline bg-cream/50 py-3 pe-11 ps-10 text-sm font-bold text-ink placeholder:text-ink/40 focus:border-baladi-red focus:bg-white focus:outline-none focus:ring-2 focus:ring-baladi-red/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute inset-y-0 end-0 flex items-center pe-3.5 text-ink/50 hover:text-ink"
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[12.5px] font-extrabold uppercase tracking-wider text-ink/80">
                  {t('تأكيد كلمة المرور الجديدة', 'Confirm New Password')}
                </label>
                <div className="relative mt-2">
                  <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5 text-ink/50">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    dir="ltr"
                    required
                    minLength={8}
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border hairline bg-cream/50 py-3 pe-11 ps-10 text-sm font-bold text-ink placeholder:text-ink/40 focus:border-baladi-red focus:bg-white focus:outline-none focus:ring-2 focus:ring-baladi-red/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute inset-y-0 end-0 flex items-center pe-3.5 text-ink/50 hover:text-ink"
                  >
                    {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-red flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black shadow-md disabled:opacity-50"
              >
                <span>{loading ? t('جارٍ الحفظ...', 'Saving...') : t('تأكيد كلمة المرور الجديدة', 'Save New Password')}</span>
                {isRtl ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </button>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => setStep('request')}
                  className="font-black text-ink/60 hover:text-ink hover:underline"
                >
                  {t('العودة للخطوة السابقة', 'Back to step 1')}
                </button>

                <button
                  type="button"
                  disabled={resendCooldown > 0 || loading}
                  onClick={() => void handleRequestCode()}
                  className="font-black text-baladi-red hover:underline disabled:opacity-40 disabled:hover:no-underline"
                >
                  {resendCooldown > 0
                    ? `${t('إعادة الإرسال بعد', 'Resend in')} ${resendCooldown} ${t('ثانية', 's')}`
                    : t('إعادة إرسال الكود', 'Resend Code')}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: SUCCESS */}
          {step === 'success' && (
            <div className="text-center py-4 space-y-4 animate-in zoom-in-95">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-baladi-green border-2 border-baladi-green/30">
                <CheckCircle2 className="h-9 w-9 stroke-[2.5]" />
              </div>

              <h2 className="t-display text-2xl text-ink">
                {t('تم تغيير كلمة المرور بنجاح!', 'Password Reset Successfully!')}
              </h2>

              <p className="text-xs font-bold text-ink/75 leading-relaxed max-w-sm mx-auto">
                {t(
                  'تم تحديث كلمة المرور لحسابك، وتم إلغاء كافة الجلسات السابقة لحماية أمان بياناتك. يمكنك الآن تسجيل الدخول مباشرة بكلمة المرور الجديدة.',
                  'Your password has been updated and all active sessions revoked. You can now sign in with your new credentials.'
                )}
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/login', { state: { email } })}
                  className="btn btn-red flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black shadow-md"
                >
                  <span>{t('تسجيل الدخول الآن', 'Sign In Now')}</span>
                  {isRtl ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Quick links & support footer */}
          <div className="mt-8 border-t hairline pt-5">
            <div className="flex items-center justify-between text-xs font-black">
              <Link to="/login" className="text-baladi-red hover:underline">
                {t('العودة لتسجيل الدخول', 'Back to Sign In')}
              </Link>

              {whatsappDigits && (
                <a
                  href={`https://wa.me/${whatsappDigits}?text=${encodeURIComponent(
                    t('مرحباً فريق بلدي، أحتاج مساعدة في استعادة كلمة مرور حسابي.', 'Hello Baladi support, I need help recovering my account password.')
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-baladi-green hover:underline"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>{t('مساعدة عبر واتساب', 'Support on WhatsApp')}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
