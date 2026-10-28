
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './views/components/Home/Navbar'
import HomePage from './views/pages/HomePage'

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
        <Route path="/about" element={<PlaceholderPage title="About SOLE" />} />
        <Route path="/contact" element={<PlaceholderPage title="Contact" />} />
        <Route path="/favorites" element={<PlaceholderPage title="Favorites" />} />
        <Route path="/cart" element={<PlaceholderPage title="Shopping Bag" />} />
        <Route path="/profile" element={<PlaceholderPage title="My Profile" />} />
        <Route path="*" element={<PlaceholderPage title="Page not found" />} />
      </Routes>

      <footer className="border-t border-gray-200 px-4 py-5 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} SOLE. All rights reserved.
      </footer>
    </BrowserRouter>
  )
}
