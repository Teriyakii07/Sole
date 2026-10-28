
import Hero from '../components/Home/Hero'
import CategorySection from '../components/Home/CategorySection'
import NewArrivals from '../components/Home/NewArrivals'
import PromoBanner from '../components/Home/PromoBanner'

export default function HomePage() {
  return (
    <main>
      <Hero />
      <CategorySection />
      <NewArrivals />
      <PromoBanner />
    </main>
  )
}
