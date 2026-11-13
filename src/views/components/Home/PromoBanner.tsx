
import { ArrowRight } from 'lucide-react';
import dunkImage from '../../../assets/images/dunkshomepage.png';

export default function PromoBanner() {
  return (
    <section className="w-full bg-[#F1F2F4] py-6 sm:py-8">
      <div className="relative mx-5 grid min-h-[320px] overflow-hidden bg-[#F1F2F4] sm:mx-8 md:grid-cols-[1.05fr_0.95fr]">

        {/* Left content */}
        <div className="relative z-10 flex flex-col justify-center bg-sole-blue px-7 py-10 text-white sm:px-12 md:px-14">
          <div className="mb-5 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-white" />
            <p className="text-[11px] font-bold tracking-[0.22em]">
              NEW ARRIVAL
            </p>
          </div>

          <p className="mb-1 text-sm font-medium tracking-[0.18em] text-white/80 sm:text-base">
            JUST DROPPED
          </p>

          <h2 className="text-4xl leading-[0.95] font-black tracking-tight sm:text-5xl lg:text-[58px]">
            NIKE
            <br />
            DUNK LOW
          </h2>

          <p className="mt-4 max-w-[300px] text-sm leading-relaxed text-white/85 sm:text-base">
            Timeless style. Everyday comfort.
            <br />
            Make every step count.
          </p>

          <a
            href="/shop"
            className="group mt-7 flex w-full max-w-[210px] items-center justify-between bg-white px-5 py-4 text-xs font-extrabold tracking-wider text-sole-blue transition duration-200 hover:bg-gray-100"
          >
            SHOP NOW
            <ArrowRight
              size={18}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </a>

          {/* Diagonal cut */}
          <div
            className="absolute right-[-1px] top-0 hidden h-full w-[100px] bg-[#F1F2F4] md:block"
            style={{
              clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
            }}
          />
        </div>

        {/* Right image */}
        <div className="relative flex min-h-[250px] items-center justify-center overflow-hidden px-4 py-5 sm:min-h-[300px] md:min-h-[320px]">
          <div className="absolute right-[8%] top-1/2 h-[230px] w-[230px] -translate-y-1/2 rounded-full border border-gray-300/70 sm:h-[280px] sm:w-[280px]" />

          <img
            src={dunkImage}
            alt="Black and white Nike Dunk Low sneakers"
            className="relative z-10 h-[260px] w-full max-w-[520px] scale-110 object-contain transition-transform duration-500 hover:scale-[1.15] sm:h-[300px] md:h-[340px]"
            loading="lazy"
          />

          <span className="absolute bottom-5 right-6 text-[10px] font-bold tracking-[0.2em] text-gray-400 sm:right-10">
            SOLE. COLLECTION
          </span>
        </div>
      </div>
    </section>
  );
}
