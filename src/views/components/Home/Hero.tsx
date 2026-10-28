
import { ArrowRight, ArrowLeft } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative min-h-[290px] overflow-hidden bg-sole-red text-white sm:min-h-[320px] lg:min-h-[290px]">
      <div className="mx-auto grid min-h-[290px] max-w-[1440px] grid-cols-1 items-center px-6 py-8 sm:px-10 lg:grid-cols-2 lg:px-16">

        {/* Sale content */}
        <div className="relative z-10">
          <p className="mb-2 text-[10px] font-medium tracking-wide sm:text-xs">
            LIMITED TIME ONLY
          </p>

          <h1 className="text-5xl leading-[0.86] font-black tracking-tight sm:text-6xl lg:text-7xl">
            Season
            <br />
            Sale
          </h1>

          <p className="mt-4 text-xs font-bold">UP TO 70% OFF</p>

          <a
            href="/shop"
            className="mt-3 inline-flex items-center gap-4 rounded bg-white px-4 py-3 text-xs font-bold text-sole-blue transition hover:bg-gray-100"
          >
            SHOP NOW
            <ArrowRight size={17} />
          </a>
        </div>

        {/* Product image */}
        <div className="relative flex min-h-[150px] items-center justify-center lg:h-full">
          <img
            src="/images/hero-jordan.png"
            alt="Red, white, and black high-top basketball sneaker"
            className="relative z-10 w-full max-w-[440px] object-contain drop-shadow-2xl"
          />

          {/* Slider decoration; actual carousel can be added later */}
          <div className="absolute right-0 top-0 hidden items-center gap-4 lg:flex">
            <span className="text-xs font-bold">01 / 03</span>
          </div>

          <div className="absolute bottom-4 right-0 hidden items-center gap-3 lg:flex">
            <button type="button" aria-label="Previous promotion">
              <ArrowLeft size={19} />
            </button>
            <button type="button" aria-label="Next promotion">
              <ArrowRight size={19} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
