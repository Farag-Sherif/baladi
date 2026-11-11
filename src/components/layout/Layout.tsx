import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import { useCart } from '../../store/cart';

export default function Layout() {
  const { pathname } = useLocation();
  const pendingAdd = useCart((s) => s.pendingAdd);
  const commitPendingAdd = useCart((s) => s.commitPendingAdd);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'auto' }); }, [pathname]);

  // If a customer navigates away during the add-to-cart grace timer, commit it immediately to the cart.
  useEffect(() => {
    if (pendingAdd && pendingAdd.sourcePath !== pathname) {
      commitPendingAdd(false);
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
