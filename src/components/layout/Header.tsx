import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, Search, ShoppingBag, X, Globe2, User as UserIcon } from 'lucide-react';
import { useLang } from '../../lib/lang';
import { useCart, cartCount } from '../../store/cart';
import { useAuth } from '../../store/auth';
import { Mark, ZigZagBand } from '../brand/Ornaments';
import { cn } from '../../lib/utils';
import SearchModal from './SearchModal';

export default function Header() {
  const { t, lang, toggle } = useLang();
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const lines = useCart((s) => s.lines);
  const open = useCart((s) => s.open);
  const count = cartCount(lines);
  const { user, isAuthenticated, logout } = useAuth();

  const isHome = pathname === '/';
  const transparent = isHome && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenu(false), [pathname]);

  const links = [
    { to: '/', label: t('الرئيسية', 'Home') },
    { to: '/cats', label: t('قطط', 'Cats') },
    { to: '/dogs', label: t('كلاب', 'Dogs') },
    { to: '/story', label: t('قصتنا', 'Our story') },
    { to: '/cart', label: t('السلة', 'Cart') },
  ];

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 transition-all duration-500',
        transparent ? 'bg-transparent text-cream' : 'bg-cream/95 text-ink backdrop-blur-xl shadow-[0_1px_0_rgba(35,37,79,0.10)]'
      )}
      style={{
        color: transparent ? '#FBF6EE' : undefined,
        backgroundColor: !transparent ? 'rgba(251, 246, 238, 0.95)' : undefined,
      }}
    >
      <div className="u-container">
        <div className="flex h-[68px] items-center justify-between gap-4 md:h-[84px]">
          <Link to="/" className="shrink-0" aria-label={t('بلدى — الصفحة الرئيسية', 'BALADI — home')}>
            <Mark tone="red" white={transparent} className="h-8 md:h-10" />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {links.slice(0, 4).map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-full px-4 py-2 text-[13.5px] font-extrabold tracking-wide transition-colors',
                    isActive
                      ? transparent ? 'bg-white/25 text-white' : 'bg-ink text-white'
                      : transparent ? 'text-white/95 hover:text-white' : 'text-ink/85 hover:text-ink'
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggle}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-extrabold transition-colors',
                transparent ? 'text-white hover:bg-white/15' : 'text-ink/85 hover:bg-ink/5'
              )}
              aria-label={t('تغيير اللغة', 'Switch language')}
            >
              <Globe2 className="h-4 w-4" />
              {lang === 'ar' ? 'EN' : 'AR'}
            </button>

            {/* REAL SEARCH BUTTON: Opens instant search modal & links to /search */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className={cn(
                'flex items-center gap-1.5 rounded-full p-2 transition-colors sm:px-2.5',
                transparent ? 'text-white hover:bg-white/15' : 'text-ink hover:bg-ink/5'
              )}
              title={t('ابحث في المتجر', 'Search Store')}
              aria-label={t('البحث', 'Search')}
            >
              <Search className="h-[19px] w-[19px]" />
              <span className="hidden text-xs font-bold md:inline-block">
                {t('بحث', 'Search')}
              </span>
            </button>

            {/* REAL USER ACCOUNT / LOGIN BUTTON: Links to /profile if logged in, /login if not */}
            <Link
              to={isAuthenticated ? '/profile' : '/login'}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-black transition-colors',
                transparent ? 'text-white hover:bg-white/15' : 'text-ink hover:bg-ink/5'
              )}
              title={isAuthenticated ? t('الملف الشخصي وحسابي', 'My Profile & Account') : t('تسجيل الدخول', 'Sign In')}
              aria-label={isAuthenticated ? t('الملف الشخصي وحسابي', 'My Profile & Account') : t('تسجيل الدخول', 'Sign In')}
            >
              {isAuthenticated && user ? (
                <div className="flex items-center gap-1.5">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-baladi-yellow text-xs shadow-sm">
                    {user.avatar || '🐾'}
                  </span>
                  <span className="hidden font-black md:inline-block max-w-[75px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <UserIcon className="h-[19px] w-[19px]" />
                  <span className="hidden font-black sm:inline-block">
                    {t('تسجيل الدخول', 'Sign In')}
                  </span>
                </div>
              )}
            </Link>

            <button
              type="button"
              onClick={open}
              className={cn('relative rounded-full p-2 transition-colors', transparent ? 'text-white hover:bg-white/15' : 'text-ink hover:bg-ink/5')}
              aria-label={t('السلة', 'Cart')}
            >
              <ShoppingBag className="h-[19px] w-[19px]" />
              {count > 0 && (
                <span className="absolute -top-0.5 start-0 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-baladi-red px-1 text-[10px] font-black text-white">
                  {count}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setMenu(true)}
              className={cn('rounded-full p-2 lg:hidden', transparent ? 'text-white hover:bg-white/15' : 'text-ink hover:bg-ink/5')}
              aria-label={t('القائمة', 'Menu')}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      {!transparent && <ZigZagBand height={9} weight={1.5} color="#E84249" />}

      {/* Render instant search modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {menu && (
        <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm lg:hidden" onClick={() => setMenu(false)}>
          <div
            className="animate-[slideIn_.35s_ease-out] ms-auto flex h-full w-[86%] max-w-sm flex-col bg-cream p-6 text-ink overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <Mark tone="red" className="h-9" />
              <button onClick={() => setMenu(false)} aria-label={t('إغلاق', 'Close')}><X className="h-6 w-6" /></button>
            </div>

            {/* Mobile Search Button */}
            <button
              type="button"
              onClick={() => {
                setMenu(false);
                setSearchOpen(true);
              }}
              className="mb-4 flex w-full items-center gap-3 rounded-2xl border hairline bg-white px-4 py-3 text-sm font-bold text-ink/80 hover:bg-cream"
            >
              <Search className="h-4 w-4 text-baladi-red" />
              <span>{t('ابحث في منتجات المتجر...', 'Search store products...')}</span>
            </button>

            {/* Mobile User Section */}
            <div className="mb-6 rounded-2xl border hairline bg-white p-4 shadow-soft">
              {isAuthenticated && user ? (
                <div>
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-baladi-yellow text-xl">
                      {user.avatar || '🐾'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-ink">{user.name}</p>
                      <p className="truncate text-xs font-bold text-ink/75">{user.email}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2 border-t hairline pt-3">
                    <Link
                      to="/profile"
                      className="btn btn-ink !py-2 !px-3 text-xs font-black flex-1"
                    >
                      {t('الملف الشخصي', 'Profile')}
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setMenu(false);
                      }}
                      className="rounded-full border hairline px-3 py-1.5 text-xs font-bold text-baladi-red hover:bg-red-50"
                    >
                      {t('خروج', 'Sign out')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-xs font-bold text-ink/75 mb-3">
                    {t('سجّل دخولك لمتابعة طلباتك وأليفك', 'Sign in to track orders & pets')}
                  </p>
                  <div className="flex gap-2">
                    <Link
                      to="/login"
                      className="btn btn-ink !py-2 text-xs font-black flex-1"
                    >
                      {t('تسجيل الدخول', 'Sign In')}
                    </Link>
                    <Link
                      to="/register"
                      className="btn btn-ghost !py-2 text-xs font-black flex-1"
                    >
                      {t('حساب جديد', 'Register')}
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1">
              {links.map((l) => (
                <Link key={l.to} to={l.to} className="rounded-2xl px-4 py-3 text-base font-extrabold hover:bg-ink/5">
                  {l.label}
                </Link>
              ))}
              {isAuthenticated && (
                <Link to="/profile" className="rounded-2xl px-4 py-3 text-base font-extrabold text-baladi-red hover:bg-ink/5">
                  {t('حسابي وكلمة المرور', 'Account & Security')}
                </Link>
              )}
            </div>
            <div className="mt-auto pt-6">
              <div className="rounded-3xl bg-ink p-5 text-cream">
                <p className="t-eyebrow text-baladi-yellow">{t('صُنع فى مصر', 'Made in Egypt')}</p>
                <p className="mt-2 text-sm leading-relaxed text-cream/90 font-medium">
                  {t('طعام جاف كامل للقطط والكلاب — للبلدى وكل الحيوانات.', 'Complete dry food for cats and dogs — for Baladi animals and all.')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
