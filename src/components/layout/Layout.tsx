import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import { useCart } from '../../store/cart';
import { useStorefront } from '../../store/storefront';
import { useAuth } from '../../store/auth';
import { useLang } from '../../lib/lang';
import { prefetch3DAssets } from '../../lib/3dPreloader';

export default function Layout() {
  const { pathname } = useLocation();
  const { lang } = useLang();
  const pendingAdd = useCart((s) => s.pendingAdd);
  const commitPendingAdd = useCart((s) => s.commitPendingAdd);
  const fetchCart = useCart((s) => s.fetchCart);
  const initStorefront = useStorefront((s) => s.initStorefront);
  const initAuth = useAuth((s) => s.initAuth);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  // Load live catalog, categories, FAQs, story, settings, governorates & user/cart data in active locale
  useEffect(() => {
    void initStorefront(lang, true);
    void initAuth(lang);
    void fetchCart(lang);
    prefetch3DAssets();
  }, [lang, initStorefront, initAuth, fetchCart]);

  // If a customer navigates away during the add-to-cart grace timer, commit it immediately to the cart.
  useEffect(() => {
    if (pendingAdd && pendingAdd.sourcePath !== pathname) {
      void commitPendingAdd(false);
    }
  }, [pathname, pendingAdd, commitPendingAdd]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
