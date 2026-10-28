
import { ArrowRight } from 'lucide-react'

export default function PromoBanner() {
  return (
    <section className="grid min-h-[190px] overflow-hidden bg-[#d9d9d9] md:grid-cols-[1.15fr_0.85fr]">
      <div className="relative flex flex-col justify-center bg-sole-blue px-7 py-8 text-white sm:px-12">
        <p className="text-base font-light tracking-wide sm:text-lg">
          JUST DROPPED
        </p>

        <h2 className="text-2xl leading-tight font-black sm:text-3xl">
          NIKE DUNK LOW
        </h2>

        <p className="text-sm sm:text-base">
          Timeless style. Everyday comfort.
        </p>

        <a
          href="/shop"
          className="mt-7 flex w-full max-w-[220px] items-center justify-between bg-white px-5 py-4 text-xs font-bold text-sole-blue transition hover:bg-gray-100"
        >
          SHOP NOW
          <ArrowRight size={18} />
        </a>

        <div className="absolute -right-5 top-0 hidden h-full w-10 skew-x-[-20deg] bg-[#d9d9d9] md:block" />
      </div>

      <div className="flex min-h-[180px] items-center justify-center p-5">
        <img
          src="/images/promo-dunk-low.png"
          alt="Black and white low-top sneakers"
          className="max-h-[210px] w-full max-w-[400px] object-contain"
          loading="lazy"
        />
      </div>
    </section>
  )
}
