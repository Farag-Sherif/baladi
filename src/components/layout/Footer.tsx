import { Link } from 'react-router-dom';
import { Instagram, Facebook, Mail, MapPin, Phone } from 'lucide-react';
import { useLang } from '../../lib/lang';
import { useStorefront } from '../../store/storefront';
import { Mark, ZigZagBand, DiamondBadge, GpfBadge } from '../brand/Ornaments';

export default function Footer() {
  const { t, lang } = useLang();
  const settings = useStorefront((s) => s.settings);
  const categories = useStorefront((s) => s.categories);
  const linkCls = 'text-cream/90 hover:text-white transition-colors inline-block py-0.5';

  const catDry = categories.find((c) => c.species === 'cat');
  const dogDry = categories.find((c) => c.species === 'dog');

  const email = settings?.store_email || 'hello@baladi.pet';
  const phone = settings?.store_phone || settings?.whatsapp;
  const igUrl = settings?.instagram;
  const fbUrl = settings?.facebook;

  return (
    <footer className="relative mt-0 overflow-hidden bg-ink text-cream" style={{ backgroundColor: '#23254F', color: '#FBF6EE' }}>
      <ZigZagBand color="#FBBB21" height={26} className="opacity-90" />
      <div className="u-container grid gap-10 py-16 md:grid-cols-[1.3fr_0.9fr_0.9fr_0.9fr_1fr]">
        <div>
          <div className="flex flex-col items-start gap-3">
            <Mark tone="green" className="h-11" />
            <GpfBadge />
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/95 font-medium">
            {t(
              'طعام جاف كامل للقطط والكلاب، معمول فى مصر عشان البلدى وكل الحيوانات ما تنامش جعانة.',
              'Complete dry food for cats and dogs, made in Egypt so Baladi animals — and every animal — never sleep hungry.'
            )}
          </p>
          <div className="mt-6 flex gap-2">
            {igUrl && (
              <a
                href={igUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-10 w-10 place-items-center rounded-full border border-cream/40 text-cream transition-colors hover:border-baladi-yellow hover:text-baladi-yellow hover:bg-white/10"
                aria-label={t('إنستجرام', 'Instagram')}
              >
                <Instagram className="h-4 w-4" />
              </a>
            )}
            {fbUrl && (
              <a
                href={fbUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-10 w-10 place-items-center rounded-full border border-cream/40 text-cream transition-colors hover:border-baladi-yellow hover:text-baladi-yellow hover:bg-white/10"
                aria-label={t('فيسبوك', 'Facebook')}
              >
                <Facebook className="h-4 w-4" />
              </a>
            )}
            {email && (
              <a
                href={`mailto:${email}`}
                className="grid h-10 w-10 place-items-center rounded-full border border-cream/40 text-cream transition-colors hover:border-baladi-yellow hover:text-baladi-yellow hover:bg-white/10"
                aria-label={t('البريد الإلكتروني', 'Email')}
              >
                <Mail className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        <div>
          <p className="t-eyebrow text-baladi-yellow">{t('المتجر', 'Shop')}</p>
          <ul className="mt-4 space-y-2.5 text-sm font-semibold">
            <li><Link className={linkCls} to="/cats">{t('عالم القطط', 'Cats world')}</Link></li>
            <li><Link className={linkCls} to="/dogs">{t('عالم الكلاب', 'Dogs world')}</Link></li>
            {catDry && (
              <li><Link className={linkCls} to={`/cats/${catDry.slug}`}>{catDry.name}</Link></li>
            )}
            {dogDry && (
              <li><Link className={linkCls} to={`/dogs/${dogDry.slug}`}>{dogDry.name}</Link></li>
            )}
            <li><Link className={linkCls} to="/search">{t('تصفح كل المنتجات', 'All products')}</Link></li>
          </ul>
        </div>

        <div>
          <p className="t-eyebrow text-baladi-yellow">{t('حسابي', 'Account')}</p>
          <ul className="mt-4 space-y-2.5 text-sm font-semibold">
            <li><Link className={linkCls} to="/login">{t('تسجيل الدخول', 'Sign in')}</Link></li>
            <li><Link className={linkCls} to="/register">{t('حساب جديد', 'Register')}</Link></li>
            <li><Link className={linkCls} to="/profile">{t('الملف الشخصي', 'My profile')}</Link></li>
            <li><Link className={linkCls} to="/track">{t('تتبع الطلب', 'Track order')}</Link></li>
          </ul>
        </div>

        <div>
          <p className="t-eyebrow text-baladi-yellow">{t('البراند', 'Brand')}</p>
          <ul className="mt-4 space-y-2.5 text-sm font-semibold">
            <li><Link className={linkCls} to="/story">{t('قصتنا', 'Our story')}</Link></li>
            <li><Link className={linkCls} to="/story#standard">{t('المعايير والجودة', 'Standards')}</Link></li>
            <li><Link className={linkCls} to="/story#feeding">{t('نصائح التغذية', 'Feeding guide')}</Link></li>
          </ul>
        </div>

        <div>
          <p className="t-eyebrow text-baladi-yellow">{t('تواصل', 'Contact')}</p>
          <ul className="mt-4 space-y-3 text-sm font-semibold text-cream/95">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-baladi-yellow" />
              {t('الجيزة، مصر', 'Giza, Egypt')}
            </li>
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-baladi-yellow" />
              <a href={`mailto:${email}`} className="hover:underline">{email}</a>
            </li>
            {phone && (
              <li className="flex items-start gap-2" dir="ltr">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-baladi-yellow" />
                <a href={`tel:${phone}`} className="hover:underline">{phone}</a>
              </li>
            )}
          </ul>
          <div className="mt-5 flex items-center gap-2 rounded-2xl bg-cream/10 p-3">
            <DiamondBadge size={26} accent="#E84249" dot="#FBBB21" />
            <p className="text-[12px] font-semibold leading-snug text-cream/90">
              {settings?.free_shipping_threshold
                ? t(
                    `شحن مجاني للطلبات فوق ${settings.free_shipping_threshold} ${lang === 'ar' ? 'ج.م' : 'EGP'}`,
                    `Free shipping over ${settings.free_shipping_threshold} EGP`
                  )
                : t('مُصنَّع فى مصر · جودة مطابقة للمواصفة ٣٢١٥/٢٠٠٢', 'Made in Egypt · ES 3215/2002 compliant')}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-cream/20">
        <div className="u-container flex flex-col items-center justify-between gap-3 py-5 text-[12px] font-semibold text-cream/80 sm:flex-row">
          <p>© {new Date().getFullYear()} {settings?.store_name || t('بلدي', 'BALADI')} · {t('كل الحقوق محفوظة', 'All rights reserved')}</p>
          <p>{t('صُنع بحب للحيوانات البلدى', 'Made with love for Baladi animals')}</p>
        </div>
      </div>
    </footer>
  );
}
