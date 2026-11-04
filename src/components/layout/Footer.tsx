import { Link } from 'react-router-dom';
import { Instagram, Facebook, Mail, MapPin } from 'lucide-react';
import { useLang } from '../../lib/lang';
import { Mark, ZigZagBand, DiamondBadge } from '../brand/Ornaments';

export default function Footer() {
  const { t } = useLang();
  const linkCls = "text-cream/90 hover:text-white transition-colors inline-block py-0.5";

  return (
    <footer className="relative mt-0 overflow-hidden bg-ink text-cream" style={{ backgroundColor: '#23254F', color: '#FBF6EE' }}>
      <ZigZagBand color="#FBBB21" height={26} className="opacity-90" />
      <div className="u-container grid gap-10 py-16 md:grid-cols-[1.3fr_0.9fr_0.9fr_0.9fr_1fr]">
        <div>
          <Mark tone="red" white className="h-11" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-cream/95 font-medium">
            {t(
              'طعام جاف كامل للقطط والكلاب، معمول فى مصر عشان البلدى وكل الحيوانات ما تنامش جيعانة.',
              'Complete dry food for cats and dogs, made in Egypt so Baladi animals — and every animal — never sleep hungry.'
            )}
          </p>
          <div className="mt-6 flex gap-2">
            {[Instagram, Facebook, Mail].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="grid h-10 w-10 place-items-center rounded-full border border-cream/40 text-cream transition-colors hover:border-baladi-yellow hover:text-baladi-yellow hover:bg-white/10"
                aria-label="social"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="t-eyebrow text-baladi-yellow">{t('المتجر', 'Shop')}</p>
          <ul className="mt-4 space-y-2.5 text-sm font-semibold">
            <li><Link className={linkCls} to="/cats">{t('عالم القطط', 'Cats world')}</Link></li>
            <li><Link className={linkCls} to="/dogs">{t('عالم الكلاب', 'Dogs world')}</Link></li>
            <li><Link className={linkCls} to="/cats/dry">{t('طعام جاف للقطط', 'Cat dry food')}</Link></li>
            <li><Link className={linkCls} to="/dogs/dry">{t('طعام جاف للكلاب', 'Dog dry food')}</Link></li>
          </ul>
        </div>

        <div>
          <p className="t-eyebrow text-baladi-yellow">{t('حسابي', 'Account')}</p>
          <ul className="mt-4 space-y-2.5 text-sm font-semibold">
            <li><Link className={linkCls} to="/login">{t('تسجيل الدخول', 'Sign in')}</Link></li>
            <li><Link className={linkCls} to="/register">{t('حساب جديد', 'Register')}</Link></li>
            <li><Link className={linkCls} to="/profile">{t('الملف الشخصي', 'My profile')}</Link></li>
            <li><Link className={linkCls} to="/forgot-password">{t('استعادة كلمة المرور', 'Password reset')}</Link></li>
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
            <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-baladi-yellow" />{t('الجيزة، مصر', 'Giza, Egypt')}</li>
            <li className="flex items-start gap-2"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-baladi-yellow" />hello@baladi.pet</li>
          </ul>
          <div className="mt-5 flex items-center gap-2 rounded-2xl bg-cream/10 p-3">
            <DiamondBadge size={26} accent="#E84249" dot="#FBBB21" />
            <p className="text-[12px] font-semibold leading-snug text-cream/90">
              {t('مُصنَّع فى مصر · جودة مطابقة للمواصفة ٣٢١٥/٢٠٠٢', 'Made in Egypt · ES 3215/2002 compliant')}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-cream/20">
        <div className="u-container flex flex-col items-center justify-between gap-3 py-5 text-[12px] font-semibold text-cream/80 sm:flex-row">
          <p>© {new Date().getFullYear()} BALADI · {t('كل الحقوق محفوظة', 'All rights reserved')}</p>
          <p>{t('صُنع بحب للحيوانات البلدى', 'Made with love for Baladi animals')}</p>
        </div>
      </div>
    </footer>
  );
}
