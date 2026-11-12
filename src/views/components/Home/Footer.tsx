
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

import instalogo from '../../../assets/images/instalogo.png';
import facebooklogo from '../../../assets/images/facebooklogo.png';
import xlogo from '../../../assets/images/xlogo.png';

import { supabase } from '../../../lib/supabaseClient';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) return;

    setLoading(true);
    setMessage('');

    try {
      const { data, error } = await supabase.functions.invoke(
        'send-welcome-coupon',
        {
          body: { email: cleanEmail },
        }
      );

      if (error) {
        throw error;
      }

      if (!data?.success) {
        setMessage(data?.message || 'Unable to send your voucher. Please try again.');
        return;
      }

      setMessage(data.message);
      setEmail('');

    } catch (error) {
      console.error('Newsletter error:', error);
      setMessage('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const linkStyle =
    "mb-3 block break-words text-sm leading-[1.5] text-[#222] no-underline hover:text-[#123A8C] hover:underline max-[600px]:text-xs";

  const headingStyle =
    "mb-5 mt-[5px] text-base font-extrabold text-[#123A8C] max-[600px]:text-[13px]";

  const columnStyle =
    "min-w-0 border-l border-[#d2d8e2] pl-5 max-[600px]:pl-3";

  return (
    <footer className="mt-[30px] w-full bg-white px-[4%] pb-5 pt-10 font-sans text-[#171717] max-[600px]:px-[18px] max-[600px]:pt-[30px]">

      {/* MAIN FOOTER */}
      <div className="grid grid-cols-[1fr_1fr_1.3fr_1fr_1.5fr] gap-[25px] pb-[35px] max-[1000px]:grid-cols-3 max-[1000px]:gap-x-[18px] max-[600px]:grid-cols-2 max-[600px]:gap-x-3">

        {/* BRAND */}
        <div className="min-w-0">
          <Link to="/" className="inline-flex flex-col no-underline">
            <span className="text-[30px] font-black text-[#123A8C]">
              SOLE.
            </span>
          </Link>

          <p className="my-[18px] text-[15px]">
            Step into your style.
          </p>

          {/* SOCIAL MEDIA */}
          <div className="mt-5 flex items-center gap-[18px]">
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <img
                src={instalogo}
                alt="Instagram"
                className="h-[26px] w-[26px] object-contain transition-transform hover:-translate-y-[3px]"
              />
            </a>

            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <img
                src={facebooklogo}
                alt="Facebook"
                className="h-[26px] w-[26px] object-contain transition-transform hover:-translate-y-[3px]"
              />
            </a>

            <a
              href="https://x.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X"
            >
              <img
                src={xlogo}
                alt="X"
                className="h-[26px] w-[26px] object-contain transition-transform hover:-translate-y-[3px]"
              />
            </a>
          </div>
        </div>

        {/* SHOP */}
        <div className={columnStyle}>
          <h3 className={headingStyle}>SHOP</h3>
          <Link to="/shop" className={linkStyle}>New Arrivals</Link>
          <Link to="/shop" className={linkStyle}>Sneakers</Link>
          <Link to="/shop" className={linkStyle}>Running Shoes</Link>
          <Link to="/shop" className={linkStyle}>Lifestyle Shoes</Link>
          <Link to="/shop" className={linkStyle}>Streetwear Shoes</Link>
        </div>

        {/* HELP & SUPPORT */}
        <div className={columnStyle}>
          <h3 className={headingStyle}>HELP &amp; SUPPORT</h3>
          <Link to="/contact" className={linkStyle}>Contact Us</Link>
          <Link to="/faqs" className={linkStyle}>FAQs</Link>
        </div>

        {/* ABOUT SOLE */}
        <div className={columnStyle}>
          <h3 className={headingStyle}>ABOUT SOLE</h3>
          <Link to="/about" className={linkStyle}>Our Story</Link>
        </div>

        {/* NEWSLETTER */}
        <div className="min-w-0 border-l border-[#d2d8e2] pl-5 max-[1000px]:col-span-2 max-[600px]:col-span-2 max-[600px]:border-l-0 max-[600px]:border-t max-[600px]:pt-5 max-[600px]:pl-0">

          <h3 className="mb-5 mt-[5px] text-xl font-extrabold leading-[1.3] text-[#123A8C] max-[600px]:text-lg">
            GET 10% OFF YOUR
            <br />
            FIRST ORDER
          </h3>

          <p className="text-sm leading-[1.6]">
            Be the first to know about new drops and exclusive offers.
          </p>

          <form
            onSubmit={handleSubscribe}
            className="mt-4 flex flex-col gap-3"
          >
            <label htmlFor="footer-email" className="sr-only">
              Email address
            </label>

            <input
              type="email"
              id="footer-email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full rounded-[3px] border border-[#cbd3e0] bg-white p-[13px] text-sm text-black outline-none focus:border-[#123A8C] disabled:opacity-60"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer rounded-[3px] bg-[#123A8C] p-[13px] text-sm font-bold text-white hover:bg-[#0b2b6d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'SENDING...' : 'SIGN UP'}
            </button>
          </form>

          {message && (
            <p className="mt-3 text-[13px] text-[#123A8C]" role="status">
              {message}
            </p>
          )}
        </div>
      </div>

      {/* BOTTOM FOOTER */}
      <div className="flex flex-wrap items-center justify-between gap-[18px] border-t border-[#cbd3e0] pt-5 max-[1000px]:justify-center max-[1000px]:text-center max-[600px]:flex-col">

        <p className="m-0 text-[13px]">
          &copy; {new Date().getFullYear()} SOLE. All rights reserved.
        </p>

        {/* LEGAL LINKS */}
        <div className="flex flex-wrap items-center gap-[15px] text-[13px] max-[600px]:justify-center">
          <Link
            to="/privacy"
            className="text-[#171717] no-underline hover:text-[#123A8C] hover:underline"
          >
            Privacy Policy
          </Link>

          <span className="text-[#aaa]">|</span>

          <Link
            to="/terms"
            className="text-[#171717] no-underline hover:text-[#123A8C] hover:underline"
          >
            Terms &amp; Conditions
          </Link>
        </div>

        {/* PAYMENT METHODS */}
        <div className="flex flex-wrap items-center gap-[15px] max-[600px]:justify-center">
          <span className="text-xl font-black italic text-[#123A8C]">
            VISA
          </span>

          <span className="flex items-center" aria-label="Mastercard">
            <i className="h-[22px] w-[22px] rounded-full bg-[#eb001b]" />
            <i className="-ml-2 h-[22px] w-[22px] rounded-full bg-[#f79e1b] opacity-90" />
          </span>

          <span className="text-[15px] font-bold text-[#0064d9]">
            GCash
          </span>
        </div>
      </div>
    </footer>
  );
}
