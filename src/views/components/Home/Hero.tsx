
import { ArrowRight, ArrowLeft } from 'lucide-react'
import { heroSneakersImage } from '../../../lib/imageFallback'

export default function Hero() {
  return (
    <section className="relative min-h-[220px] overflow-hidden bg-[#b7181f] text-white sm:min-h-[240px]">
      <div className="mx-auto grid min-h-[220px] max-w-[1440px] grid-cols-[1fr_1fr] items-center gap-2 px-5 py-5 sm:min-h-[240px] sm:px-10 lg:px-16">
        <div className="relative z-10">
          <p className="mb-2 text-[9px] font-medium tracking-wide sm:text-xs">
            LIMITED TIME ONLY
          </p>

          <h1 className="text-4xl leading-[0.84] font-black tracking-tight sm:text-6xl">
            Season
            <br />
            Sale
          </h1>

          <p className="mt-3 text-[10px] font-bold sm:text-xs">UP TO 70% OFF</p>

          <a
            href="/shop"
            className="mt-2 inline-flex items-center gap-3 rounded bg-white px-3 py-2 text-[10px] font-bold text-[#103b91] transition hover:bg-gray-100 sm:mt-3 sm:px-4 sm:py-2.5 sm:text-xs"
          >
            SHOP NOW
            <ArrowRight size={15} />
          </a>
        </div>

        <div className="relative flex h-full min-h-[150px] items-center justify-center sm:min-h-[200px]">
          <img
            src={heroSneakersImage}
            alt="Red, white, and black high-top sneakers"
            className="relative z-10 max-h-[185px] w-full max-w-[440px] object-contain drop-shadow-2xl hue-rotate-[120deg] sm:max-h-[220px]"
          />

          <div className="absolute right-0 top-0 hidden items-center gap-4 sm:flex">
            <span className="text-xs font-bold">01 / 03</span>
          </div>

          <div className="absolute bottom-1 right-0 hidden items-center gap-3 sm:flex">
            <button type="button" aria-label="Previous promotion" className="transition hover:opacity-70">
              <ArrowLeft size={17} />
            </button>
            <button type="button" aria-label="Next promotion" className="transition hover:opacity-70">
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
