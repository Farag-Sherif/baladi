import { Link } from 'react-router-dom';
import { ShieldCheck, Phone, Mail, MessageCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../store/auth';
import { useStorefront } from '../store/storefront';
import { useLang } from '../lib/lang';
import { Mark, ZigZagBand } from '../components/brand/Ornaments';

export default function ForgotPasswordPage() {
  const { t, lang } = useLang();
  const isRtl = lang === 'ar';
  const isAuthenticated = useAuth((s) => s.isAuthenticated);
  const settings = useStorefront((s) => s.settings);

  const whatsappDigits = (settings?.whatsapp || settings?.store_phone || '').replace(/[^\d]/g, '');

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
            {t('استعادة كلمة المرور', 'Password Recovery')}
          </h1>
          <p className="mt-3 text-[15px] font-medium text-cream/90">
            {t('حماية حسابك وتغيير كلمة المرور عبر إعدادات الحساب أو دعم المتجر.', 'Manage your password via account settings or contact store support.')}
          </p>
        </div>
      </div>

      <div className="u-container -mt-6 pb-20">
        <div className="mx-auto max-w-md rounded-[32px] border hairline bg-white p-6 shadow-soft md:p-8">
          <div className="mb-5 flex items-center gap-3 rounded-2xl border hairline bg-cream/60 p-4">
            <ShieldCheck className="h-6 w-6 shrink-0 text-baladi-green" />
            <p className="text-xs font-extrabold leading-relaxed text-ink/85">
              {isAuthenticated
                ? t(
                    'أنت مسجل الدخول حالياً — يمكنك تغيير كلمة المرور مباشرة من تبويب الأمان في حسابك الشخصي.',
                    'You are currently signed in — you can update your password directly from the Security tab in your profile.'
                  )
                : t(
                    'لإعادة تعيين كلمة المرور لحسابك، تواصل مع فريق خدمة العملاء لتأكيد هويتك واستعادة الوصول فوراً.',
                    'To reset your account password, contact our support team to verify your ownership and restore access.'
                  )}
            </p>
          </div>

          {isAuthenticated ? (
            <Link to="/profile?tab=security" className="btn btn-ink flex w-full items-center justify-center gap-2 text-sm font-black">
              <span>{t('الانتقال لتغيير كلمة المرور', 'Go to Security Settings')}</span>
              {isRtl ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            </Link>
          ) : (
            <div className="space-y-3">
              {whatsappDigits && (
                <a
                  href={`https://wa.me/${whatsappDigits}?text=${encodeURIComponent(
                    t('مرحباً فريق بلدي، أحتاج مساعدة في استعادة كلمة مرور حسابي.', 'Hello Baladi support, I need help recovering my account password.')
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-yellow flex w-full items-center justify-center gap-2 text-sm font-black"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>{t('تواصل عبر واتساب', 'Chat on WhatsApp')}</span>
                </a>
              )}

              {settings?.store_phone && (
                <a
                  href={`tel:${settings.store_phone}`}
                  className="flex w-full items-center justify-center gap-2 rounded-full border hairline bg-cream/40 px-4 py-3 text-xs font-black text-ink transition-colors hover:bg-cream"
                >
                  <Phone className="h-4 w-4 text-baladi-red" />
                  <span dir="ltr">{settings.store_phone}</span>
                </a>
              )}

              {settings?.store_email && (
                <a
                  href={`mailto:${settings.store_email}`}
                  className="flex w-full items-center justify-center gap-2 rounded-full border hairline bg-cream/40 px-4 py-3 text-xs font-black text-ink transition-colors hover:bg-cream"
                >
                  <Mail className="h-4 w-4 text-baladi-red" />
                  <span dir="ltr">{settings.store_email}</span>
                </a>
              )}
            </div>
          )}

          <div className="mt-6 border-t hairline pt-5 text-center">
            <Link to="/login" className="text-xs font-black text-baladi-red hover:underline">
              {t('العودة لتسجيل الدخول', 'Back to Sign In')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
