import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  useLocation,
} from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/Cartcontext';
import { FavoritesProvider } from './context/Favoritescontext';

import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';
import GuestRoute from './routes/GuestRoute';

import Navbar from './views/components/Home/Navbar';
import Footer from './views/components/Home/Footer';

import HomePage from './views/pages/HomePage';
import ShoppingCartView from './views/pages/Cart';
import FavoritesPage from './views/pages/Favorites';
import Profile from './views/pages/Profile';
import AboutUs from './views/pages/Aboutus';
import ContactUs from './views/pages/ContactUs';
import AdminDashboard from './views/pages/AdminDashboard';
import FAQPage from './views/pages/FAQPage';
import { LoginPage } from './views/pages/Login';
import { SignUpPage } from './views/pages/Signup';
import ProductCatalog from './views/pages/ProductCatalog';
import Checkout from './views/pages/Checkout'
import Shop from './views/pages/Shop';
import Favorites from './views/pages/Favorites';

function MainLayout() {
  const location = useLocation();

  const isAuthPage =
    location.pathname === '/login' ||
    location.pathname === '/signup';

  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAuthPage && !isAdmin && <Navbar />}

      <Outlet />

      {!isAuthPage && !isAdmin && <Footer />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            {/* Guest-only routes */}
{/* Login is guest-only */}
            <Route element={<GuestRoute />}>
              <Route path="/login" element={<LoginPage />} />
            </Route>

            {/* Signup must remain accessible until OTP verification */}
            <Route path="/signup" element={<SignUpPage />} />

            {/* Admin-only routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>
            </Route>

            {/* Customer/public pages */}
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/cart" element={<ShoppingCartView />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/faqs" element={<FAQPage />} />
            <Route path="/product/:id" element={<ProductCatalog />} />
            <Route path="/checkout" element={<Checkout />} />

            {/* Unknown routes */}
            <Route path="*" element={<div>Page not found.</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;