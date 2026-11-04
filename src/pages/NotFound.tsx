import { Link } from 'react-router-dom';
import { useLang } from '../lib/lang';
import { Mark } from '../components/brand/Ornaments';

export default function NotFound() {
  const { t } = useLang();
  return (
    <div className="grid min-h-[80vh] place-items-center bg-cream px-6 pt-24 text-center">
      <div>
        <Mark tone="red" className="mx-auto h-12" />
        <p className="t-eyebrow mt-8 text-baladi-red">404</p>
        <h1 className="t-display mt-3 text-3xl">{t('الصفحة مش موجودة', 'Page not found')}</h1>
        <div className="mt-7 flex justify-center gap-3">
          <Link to="/" className="btn btn-ink">{t('الرئيسية', 'Home')}</Link>
          <Link to="/cats" className="btn btn-ghost">{t('قطط', 'Cats')}</Link>
        </div>
      </div>
    </div>
  );
}
