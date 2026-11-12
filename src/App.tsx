
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  useLocation,
} from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { AuthPromptProvider } from './context/AuthPromptContext';

import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';
import GuestRoute from './routes/GuestRoute';

import Navbar from './views/components/Home/Navbar';
import Footer from './views/components/Home/Footer';

import HomePage from './views/pages/HomePage';
import ShoppingCartView from './views/pages/Cart';
import Profile from './views/pages/Profile';
import AboutUs from './views/pages/Aboutus';
import ContactUs from './views/pages/ContactUs';
import AdminDashboard from './views/pages/AdminDashboard';
import FAQPage from './views/pages/FAQPage';
import { LoginPage } from './views/pages/Login';
import { SignUpPage } from './views/pages/Signup';
import ProductCatalog from './views/pages/ProductCatalog';
import Checkout from './views/pages/Checkout';
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

      <div className={location.pathname === '/shop' ? 'pb-16' : ''}>
        <Outlet />
      </div>

      {!isAuthPage && !isAdmin && <Footer />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AuthPromptProvider>
          <Routes>
            <Route element={<MainLayout />}>

              {/* Login is for guests */}
              <Route element={<GuestRoute />}>
                <Route path="/login" element={<LoginPage />} />
              </Route>

              {/* Signup remains accessible for OTP verification */}
              <Route path="/signup" element={<SignUpPage />} />

              {/* Require a signed-in user before entering the homepage. */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<HomePage />} />
              </Route>

              {/* Public pages */}
              <Route path="/shop" element={<Shop />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/faqs" element={<FAQPage />} />
              <Route path="/product/:id" element={<ProductCatalog />} />

              {/* Customer-only pages */}
              <Route element={<ProtectedRoute />}>
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/cart" element={<ShoppingCartView />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/checkout" element={<Checkout />} />
              </Route>

              {/* Admin-only pages */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AdminRoute />}>
                  <Route
                    path="/admin"
                    element={<AdminDashboard />}
                  />
                </Route>
              </Route>

              {/* Unknown routes */}
              <Route
                path="*"
                element={<div>Page not found.</div>}
              />

            </Route>
          </Routes>
        </AuthPromptProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
