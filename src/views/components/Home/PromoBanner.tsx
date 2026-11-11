
import { ArrowRight } from 'lucide-react'
import {
  handleImageError,
  heroSneakersImage,
} from '../../../lib/imageFallback'

export default function PromoBanner() {
  return (
    <section className="relative grid min-h-[210px] grid-cols-[1.2fr_0.8fr] overflow-hidden bg-[#d9d9d9] sm:min-h-[240px]">
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-[68%] bg-[#173f8f] [clip-path:polygon(0_0,100%_0,83%_100%,0_100%)] sm:w-[64%]"
      />

      <div className="relative z-10 flex min-w-0 flex-col justify-center px-5 py-7 text-white sm:px-10 lg:px-12">
        <p className="text-sm font-light tracking-wide sm:text-base">
          JUST DROPPED
        </p>

        <h2 className="line-clamp-2 text-xl leading-tight font-black sm:text-3xl">
          BLUE HIGH-TOP SNEAKERS
        </h2>

        <p className="line-clamp-2 text-xs sm:text-sm">
          Discover your next favorite pair.
        </p>

        <a
          href="/shop"
          className="mt-5 flex w-full max-w-[190px] items-center justify-between bg-white px-4 py-3 text-[10px] font-bold text-[#173f8f] transition hover:bg-gray-100 sm:mt-6 sm:px-6 sm:py-4 sm:text-xs"
        >
          SHOP NOW
          <ArrowRight size={16} />
        </a>
      </div>

      <div className="relative z-10 flex min-h-[180px] items-center justify-center py-4 pl-0 pr-3 sm:min-h-[220px] sm:pr-8">
        <img
          src={heroSneakersImage}
          alt="Blue, white, and black high-top sneakers"
          className="max-h-[160px] w-full max-w-[320px] object-contain mix-blend-multiply sm:max-h-[205px]"
          loading="lazy"
          onError={handleImageError}
        />
      </div>
    </section>
  )
}
