
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './views/components/Home/Navbar'
import HomePage from './views/pages/HomePage'
import ShoppingCartView from './views/pages/Cart'
import Footer from './views/components/Home/Footer'
import Profile from './views/pages/Profile'
import AboutUs from './views/pages/Aboutus'
import ContactUs from './views/pages/ContactUs'


function PlaceholderPage({ title }: { title: string }) {
  return (
    <main className="mx-auto min-h-[60vh] max-w-6xl px-6 py-16">
      <h1 className="text-3xl font-bold text-sole-blue">{title}</h1>
      <p className="mt-3 text-gray-600">
        This page is under development.
      </p>
    </main>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<PlaceholderPage title="Shop" />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/favorites" element={<PlaceholderPage title="Favorites" />} />
        <Route path="/cart" element={<ShoppingCartView />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<PlaceholderPage title="Page not found" />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  )
}
