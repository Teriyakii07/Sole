
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Footprints,
  ShoppingBag,
  Tag,
  Star,
  X
} from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  activeTab: 'login' | 'signup';
  onTabChange: (tab: 'login' | 'signup') => void;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  activeTab
}) => {
  const navigate = useNavigate();

  const features = [
    { icon: Footprints, label: 'COMFORT' },
    { icon: Star, label: 'QUALITY' },
    { icon: Tag, label: 'STYLE' }
  ];

  const categories = ['CASUAL', 'RUNNING', 'LIFESTYLE'];

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white overflow-hidden">

      {/* LEFT PANEL - 60% */}
      <section className="relative md:w-[60%] w-full min-h-[620px] md:min-h-screen bg-[#123A8C] text-white flex flex-col justify-between p-7 md:p-10 lg:p-12 overflow-hidden">

        {/* Background decorations */}
        <div className="absolute -top-40 -right-32 w-[500px] h-[500px] rounded-full border border-white/[0.08]" />
        <div className="absolute -top-24 -right-16 w-[350px] h-[350px] rounded-full border border-white/[0.08]" />
        <div className="absolute -bottom-48 -left-32 w-[450px] h-[450px] rounded-full bg-white/[0.04]" />

        {/* Decorative footprints */}
        <Footprints
          size={220}
          strokeWidth={1}
          className="absolute top-32 right-0 rotate-[-28deg] text-white/[0.06]"
        />

        <Footprints
          size={110}
          strokeWidth={1}
          className="absolute bottom-28 left-8 rotate-[25deg] text-white/[0.06]"
        />

        {/* Top red accent */}
        <div className="absolute top-0 right-16 h-2 w-28 bg-[#D7192D]" />

        {/* HEADER */}
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-wider">
              SOLE<span className="text-[#D7192D]">.</span>
            </h1>

            <p className="mt-1 text-[10px] font-bold tracking-[4px] text-blue-200">
              SNEAKER STORE
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold tracking-widest text-blue-200">
            <ShoppingBag size={16} />
            <span>STEP INTO STYLE</span>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="relative z-10 w-full max-w-2xl mx-auto flex-1 flex flex-col justify-center py-10">

          {/* Heading */}
          <div className="mb-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[10px] font-bold tracking-[2px] text-blue-100">
              <span className="h-2 w-2 rounded-full bg-[#D7192D]" />
              YOUR SNEAKER DESTINATION
            </span>
          </div>

          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[0.98] tracking-tight">
            STEP INTO
            <br />
            YOUR
            <span className="text-[#D7192D]"> STYLE.</span>
          </h2>

          {/* Category tags */}
          <div className="flex flex-wrap gap-2 mt-7">
            {categories.map((category) => (
              <span
                key={category}
                className="rounded-full border border-white/25 bg-white/[0.05] px-4 py-2 text-[10px] font-bold tracking-widest transition duration-200 hover:bg-[#D7192D] hover:border-[#D7192D]"
              >
                {category}
              </span>
            ))}
          </div>

          {/* Sneaker-inspired feature display */}
          <div className="relative mt-9 rounded-2xl border border-white/15 bg-white/[0.08] p-5 md:p-6 backdrop-blur-sm">

            {/* Decorative shoe lace lines */}
            <div className="absolute top-0 right-8 flex gap-2 opacity-20">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-10 w-1 rotate-45 rounded-full bg-white"
                />
              ))}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">

              <div>
                <p className="text-[10px] font-bold tracking-[3px] text-blue-200">
                  THE SOLE EXPERIENCE
                </p>

                <h3 className="mt-2 text-xl md:text-2xl font-extrabold">
                  Find your perfect fit.
                </h3>

                <p className="mt-2 text-xs leading-5 text-blue-100/70 max-w-xs">
                  Comfort, quality, and style in every step.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {features.map((feature) => {
                  const Icon = feature.icon;

                  return (
                    <div
                      key={feature.label}
                      className="flex flex-col items-center justify-center gap-2 h-[76px] w-[76px] rounded-xl bg-white/10 border border-white/10"
                    >
                      <Icon size={22} className="text-white" />

                      <span className="text-[8px] font-bold tracking-wider text-blue-100">
                        {feature.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom slogan */}
          <div className="flex items-center gap-3 mt-7">
            <div className="h-[3px] w-10 bg-[#D7192D]" />

            <p className="text-xs font-bold tracking-[2px] text-blue-100">
              FIND YOUR FIT. MAKE YOUR STATEMENT.
            </p>
          </div>
        </div>

        {/* LEFT FOOTER */}
        <div className="relative z-10 flex items-center justify-between border-t border-white/15 pt-5">
          <p className="text-[11px] text-blue-200">
            © SOLE Inc. All Rights Reserved.
          </p>

          <p className="hidden sm:block text-[10px] tracking-widest text-blue-200/70">
            MADE FOR SNEAKER LOVERS
          </p>
        </div>

        {/* Bottom accent */}
        <div className="absolute bottom-0 right-0 h-1.5 w-1/3 bg-[#D7192D]" />
      </section>

      {/* RIGHT PANEL - 40% */}
      <section className="relative md:w-[40%] w-full min-h-screen flex flex-col justify-center items-center px-5 py-8 sm:px-8 md:px-7 lg:px-10 bg-[#F5F6FA] overflow-hidden">

        {/* Background circles */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-80 w-80 rounded-full border border-[#123A8C]/[0.07]" />

        <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full border border-[#123A8C]/[0.07]" />

        <div className="pointer-events-none absolute -bottom-32 -left-28 h-80 w-80 rounded-full bg-[#123A8C]/[0.035]" />

        {/* Decorative shoe print */}
        <Footprints
          size={130}
          strokeWidth={1}
          className="pointer-events-none absolute right-0 top-12 rotate-[-25deg] text-[#123A8C]/[0.05]"
        />

        {/* Red accent */}
        <div className="pointer-events-none absolute top-16 right-0 h-1 w-16 bg-[#D7192D]" />

        {/* FORM CONTAINER WITH TRANSITION */}
        <div
          key={activeTab}
          className="relative z-10 w-full max-w-sm auth-form-enter"
        >
          {/* X BUTTON */}
          <button
            type="button"
            onClick={() => navigate('/')}
            aria-label="Continue browsing"
            title="Continue browsing"
            className="absolute -top-3 right-0 flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition hover:bg-white hover:text-[#D7192D]"
          >
            <X size={22} />
          </button>

          {children}

          {/* CONTINUE BROWSING BUTTON */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-5 flex w-full items-center justify-center gap-2 text-sm font-semibold text-[#123A8C] transition hover:text-[#D7192D]"
          >
            ← Continue Browsing
          </button>
        </div>

        {/* Bottom footer */}
        <div className="absolute bottom-6 left-0 right-0 text-center">
          <p className="text-[10px] text-gray-400">
            Find your style. Make every step count.
          </p>
        </div>

        {/* Watermark */}
        <span className="pointer-events-none absolute bottom-12 right-5 select-none text-6xl font-black tracking-tighter text-[#123A8C]/[0.035]">
          SOLE.
        </span>
      </section>
    </div>
  );
};
