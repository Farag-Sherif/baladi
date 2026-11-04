import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, KeyRound, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../store/auth';
import { useLang } from '../lib/lang';
import { Mark, ZigZagBand, DiamondBadge } from '../components/brand/Ornaments';

type Step = 'request' | 'verify' | 'new_password' | 'completed';

export default function ForgotPasswordPage() {
  const { t, lang, dir } = useLang();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const [step, setStep] = useState<Step>('request');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(45);

  const handleRequestSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!identifier.trim()) {
      setError(t('برجاء إدخال البريد الإلكتروني أو رقم الهاتف', 'Please enter your email or phone'));
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('verify');
    }, 600);
  };

  const handleOtpSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const code = otp.join('');
    if (code.length < 4) {
      setError(t('برجاء إدخال رمز التحقق المكون من 4 أرقام', 'Please enter the 4-digit verification code'));
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('new_password');
    }, 600);
  };

  const handleOtpChange = (val: string, index: number) => {
    if (val.length > 1) val = val.slice(-1);
    const updated = [...otp];
    updated[index] = val;
    setOtp(updated);

    // auto focus next input
    if (val && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!newPassword || newPassword.length < 6) {
      setError(t('كلمة المرور يجب أن لا تقل عن 6 أحرف', 'Password must be at least 6 characters'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t('كلمتا المرور غير متطابقتين', 'Passwords do not match'));
      return;
    }

    setLoading(true);
    const res = await resetPassword(identifier, newPassword);
    setLoading(false);

    if (res.success) {
      setStep('completed');
    } else {
      setError(res.error || t('حدث خطأ أثناء تغيير كلمة المرور', 'Error resetting password'));
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
          <p className="t-eyebrow text-baladi-yellow">{t('استعادة الحساب والأمان', 'ACCOUNT SECURITY')}</p>
          <h1 className="t-display mt-2 text-[clamp(2rem,4.5vw,3.2rem)] text-white">
            {t('نسيت كلمة المرور؟', 'Reset Password')}
          </h1>
          <p className="mt-3 text-[15px] font-medium text-cream/90">
            {t('سنساعدك في استعادة حسابك وتعيين كلمة مرور جديدة بسهولة.', 'We will help you recover your account and set a new password easily.')}
          </p>
        </div>
      </div>

      <div className="u-container -mt-6 pb-20">
        <div className="mx-auto max-w-md rounded-[32px] border hairline bg-white p-6 shadow-soft md:p-8">
          {/* Step Indicators */}
          <div className="mb-8 flex items-center justify-between">
            {[
              { id: 'request', label: t('البريد', 'Email'), num: '1' },
              { id: 'verify', label: t('الرمز', 'Code'), num: '2' },
              { id: 'new_password', label: t('كلمة المرور', 'Password'), num: '3' },
            ].map((s, idx) => {
              const isActive = step === s.id;
              const isPast =
                (step === 'verify' && idx === 0) ||
                (step === 'new_password' && idx <= 1) ||
                step === 'completed';
              return (
                <div key={s.id} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`grid h-8 w-8 place-items-center rounded-full text-xs font-black transition-colors ${
                        isPast
                          ? 'bg-baladi-green text-white'
                          : isActive
                          ? 'bg-baladi-red text-white'
                          : 'bg-ink/10 text-ink/70'
                      }`}
                    >
                      {isPast ? '✓' : s.num}
                    </div>
                    <span className="mt-1 text-[11px] font-extrabold text-ink/80">{s.label}</span>
                  </div>
                  {idx < 2 && (
                    <div
                      className={`mx-2 h-0.5 flex-1 transition-colors ${
                        isPast ? 'bg-baladi-green' : 'bg-ink/10'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-2.5 rounded-2xl bg-red-50 p-3.5 text-[13px] font-bold text-baladi-red">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Request */}
          {step === 'request' && (
            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <p className="text-[13.5px] font-bold leading-relaxed text-ink/80">
                {t(
                  'أدخل بريدك الإلكتروني أو رقم الهاتف المسجل وسنرسل لك رمز تحقق من 4 أرقام لتأكيد هويتك.',
                  'Enter your registered email or phone and we will send you a 4-digit code to verify your identity.'
                )}
              </p>

              <div>
                <label className="block text-[12.5px] font-extrabold uppercase tracking-wider text-ink/80">
                  {t('البريد الإلكتروني أو رقم الهاتف', 'Email or Phone Number')}
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
                    placeholder="ahmed@baladi.pet"
                    className="w-full rounded-2xl border hairline bg-cream/50 py-3 ps-10 pe-4 text-sm font-bold text-ink placeholder:text-ink/40 focus:border-baladi-red focus:bg-white focus:outline-none focus:ring-2 focus:ring-baladi-red/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-ink mt-3 w-full text-[15px] font-black shadow-md hover:shadow-lg disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {t('جارٍ إرسال الرمز...', 'Sending code...')}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4" />
                    {t('إرسال رمز التحقق', 'Send Verification Code')}
                  </span>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: Verify OTP */}
          {step === 'verify' && (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <p className="text-[13.5px] font-bold leading-relaxed text-ink/80">
                {t('تم إرسال رمز التحقق إلى:', 'Verification code sent to:')}{' '}
                <span className="font-black text-ink">{identifier}</span>
              </p>

              <div className="my-6 flex justify-center gap-3" dir="ltr">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, i)}
                    className="h-14 w-12 rounded-2xl border hairline bg-cream/50 text-center text-2xl font-black text-ink focus:border-baladi-red focus:bg-white focus:outline-none focus:ring-2 focus:ring-baladi-red/20"
                  />
                ))}
              </div>

              <p className="text-center text-xs font-bold text-ink/65">
                {t('أدخل رمز التحقق المكون من 4 أرقام للمتابعة', 'Enter the 4-digit verification code to continue')}
              </p>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-ink mt-3 w-full text-[15px] font-black shadow-md hover:shadow-lg disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {t('جارٍ التحقق...', 'Verifying...')}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {t('تأكيد الرمز والمتابعة', 'Verify & Proceed')}
                  </span>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setStep('request')}
                  className="text-xs font-bold text-baladi-red hover:underline"
                >
                  {t('تغيير البريد أو رقم الهاتف', 'Change email or phone')}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: New Password */}
          {step === 'new_password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <p className="text-[13.5px] font-bold leading-relaxed text-ink/80">
                {t(
                  'أدخل كلمة المرور الجديدة لحسابك ويُفضل أن تحتوي على حروف وأرقام.',
                  'Enter a new password for your account, ideally with letters and numbers.'
                )}
              </p>

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
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border hairline bg-cream/50 py-3 ps-10 pe-11 text-sm font-bold text-ink placeholder:text-ink/40 focus:border-baladi-red focus:bg-white focus:outline-none focus:ring-2 focus:ring-baladi-red/20"
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
                    type={showPass ? 'text' : 'password'}
                    dir="ltr"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border hairline bg-cream/50 py-3 ps-10 pe-4 text-sm font-bold text-ink placeholder:text-ink/40 focus:border-baladi-red focus:bg-white focus:outline-none focus:ring-2 focus:ring-baladi-red/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-ink mt-3 w-full text-[15px] font-black shadow-md hover:shadow-lg disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {t('جارٍ حفظ كلمة المرور...', 'Saving password...')}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    {t('حفظ كلمة المرور الجديدة', 'Save New Password')}
                  </span>
                )}
              </button>
            </form>
          )}

          {/* STEP 4: Completed */}
          {step === 'completed' && (
            <div className="py-4 text-center">
              <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-baladi-green">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <h2 className="text-xl font-black text-ink">
                {t('تم تغيير كلمة المرور بنجاح!', 'Password Changed Successfully!')}
              </h2>
              <p className="mt-2 text-sm font-bold text-ink/75">
                {t(
                  'يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.',
                  'You can now sign in using your new password.'
                )}
              </p>
              <Link to="/login" className="btn btn-ink mt-6 w-full font-black">
                {t('الانتقال لتسجيل الدخول', 'Go to Sign In')}
              </Link>
            </div>
          )}

          <div className="mt-8 border-t hairline pt-5 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-black text-ink/75 transition-colors hover:text-baladi-red"
            >
              <span className="inline-block rtl:rotate-180">←</span>
              <span>{t('العودة لصفحة تسجيل الدخول', 'Back to Sign In')}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
