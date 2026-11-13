
import { ArrowRight, ArrowLeft } from 'lucide-react'
import redShoes from '../../../assets/images/redshoes.png'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-sole-red text-white">
      <div className="mx-auto grid min-h-[280px] max-w-[1200px] grid-cols-1 items-center px-6 py-7 sm:px-10 lg:min-h-[280px] lg:grid-cols-[0.85fr_1.15fr] lg:px-10 lg:py-5">

        {/* Sale content */}
        <div className="relative z-10">
          <p className="mb-2 text-[10px] font-medium tracking-wide sm:text-xs">
            LIMITED TIME ONLY
          </p>

          <h1 className="text-5xl leading-[0.88] font-black tracking-tight sm:text-6xl lg:text-[64px]">
            Season
            <br />
            Sale
          </h1>

          <p className="mt-3 text-xs font-bold">
            UP TO 70% OFF
          </p>

          <a
            href="/shop"
            className="mt-3 inline-flex items-center gap-4 rounded bg-white px-4 py-3 text-xs font-bold text-sole-blue transition hover:bg-gray-100"
          >
            SHOP NOW
            <ArrowRight size={17} />
          </a>
        </div>

        {/* Product image and slider controls */}
        <div className="relative flex min-h-[220px] items-center justify-start lg:min-h-[280px]">
          <img
  src={redShoes}
  alt="Red, white, and black high-top basketball sneaker"
  className="relative z-10 h-[270px] w-full max-w-[720px] scale-110 object-contain drop-shadow-2xl sm:h-[300px] lg:h-[350px] lg:scale-125 lg:-translate-x-8"
/>

          {/* Slide number */}
          <div className="absolute right-0 top-0 z-20 hidden lg:block">
            <span className="text-xs font-bold">01 / 03</span>
          </div>

          {/* Slider arrows */}
          <div className="absolute right-0 top-9 z-20 hidden items-center gap-4 lg:flex">
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
