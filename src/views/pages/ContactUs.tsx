import { useContactController } from '../../controllers/contactControllers'

type IconName = 'headphones' | 'mail' | 'phone' | 'pin' | 'clock' | 'arrow' | 'send' | 'chevron' | 'external' | 'check'

function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    headphones: <><path d="M3 14v-3a9 9 0 0 1 18 0v3"/><rect x="2" y="13" width="4" height="7" rx="2"/><rect x="18" y="13" width="4" height="7" rx="2"/></>,
    mail: <><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m3 6 9 7 9-7"/></>,
    phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19 19 0 0 1-17.7-17.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8L7.3 10a16 16 0 0 0 6.7 6.7l1.5-1.7a2 2 0 0 1 1.8-.6l3 .5a2 2 0 0 1 1.7 2Z"/>,
    pin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/></>,
    arrow: <><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></>,
    send: <><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></>,
    chevron: <path d="m6 9 6 6 6-6"/>,
    external: <><path d="M14 3h7v7"/><path d="m10 14 11-11"/><path d="M20 14v6H4V4h6"/></>,
    check: <><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

const faqs = [
  { question: 'Are all sneakers on SOLE. 100% authentic?', answer: 'Our original store concept describes a five-step authentication process. Please confirm the actual verification process before making this guarantee to customers.' },
  { question: 'How do I track my order status?', answer: 'Once your order is dispatched, you can check your order history. Tracking emails require a connected order and delivery service.' },
  { question: 'What is your return & exchange policy?', answer: 'The proposed policy is returns and size exchanges within 7 days for unworn items with original tags. Confirm your store policy before publishing.' },
  { question: 'How long does standard shipping take?', answer: 'Estimated shipping is 1–3 business days for Metro Manila and 3–6 business days for provincial addresses. Confirm these estimates with your courier.' },
  { question: 'Can I request a sneaker model not in store?', answer: 'You can use the contact form to describe the sneaker you are looking for. Sourcing requests require team review.' },
]

const contacts: { title: string; description: string; label: string; href?: string; icon: IconName; accent: string }[] = [
  { title: 'Email Us', description: 'Send your queries anytime. We aim to respond within 24 hours.', label: 'support@sole.com', href: 'mailto:support@sole.com', icon: 'mail', accent: 'bg-[#EDF2FC] text-[#123A8C]' },
  { title: 'Call Support', description: 'Speak directly with our team for urgent order updates.', label: '+63 (2) 8888-SOLE', href: 'tel:+63288887653', icon: 'phone', accent: 'bg-[#FFF0F1] text-[#D7192D]' },
  { title: 'Flagship Store', description: 'Visit our showroom to check the latest drops.', label: 'View Locations', href: '#stores', icon: 'pin', accent: 'bg-[#EDF2FC] text-[#123A8C]' },
  { title: 'Business Hours', description: 'Mon – Sat: 9:00 AM – 8:00 PM\nSun: 10:00 AM – 6:00 PM', label: 'GMT+8 Manila', icon: 'clock', accent: 'bg-[#EDF2FC] text-[#123A8C]' },
]

const stores = [
  { name: 'SOLE. BGC Flagship', badge: 'BGC Flagship Store', address: 'High Street South, 28th Street, Bonifacio Global City, Taguig, Metro Manila', hours: 'Mon – Sun: 10:00 AM – 10:00 PM' },
  { name: 'SOLE. Iloilo Hub', badge: 'Iloilo Concept Store', address: 'Megaworld Boulevard, Iloilo Business Park, Mandurriao, Iloilo City', hours: 'Mon – Sun: 10:00 AM – 9:00 PM' },
]

const inputClass = 'w-full rounded-lg border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-[13px] text-sm text-[#111] outline-none transition focus:border-[#123A8C] focus:bg-white focus:ring-[3px] focus:ring-[#123A8C]/10'
const labelClass = 'text-xs font-bold uppercase tracking-[0.5px] text-[#111]'

export default function ContactUs() {
  const c = useContactController()

   return (
    <main className="w-full overflow-hidden bg-white font-sans text-[#111]">
      {/* HERO */}
      <section className="border-b border-[#E5E7EB] bg-[#F4F6F9]">
        <div className="mx-auto grid min-h-[420px] w-[88%] max-w-[1180px] grid-cols-2 items-center gap-[60px] py-[70px] max-[850px]:grid-cols-1 max-[850px]:gap-[35px] max-[850px]:py-[50px]">
          <div className="max-w-[540px]">
            <p className="text-[11px] font-extrabold uppercase tracking-[2px] text-[#D7192D]">GET IN TOUCH</p>
            <h1 className="mt-[18px] font-montserrat text-[clamp(38px,5vw,56px)] font-extrabold leading-[1.15] tracking-[-2px] text-[#123A8C]">We're Here to Help<span className="text-[#D7192D]">.</span></h1>
            <p className="mt-5 max-w-[480px] text-sm leading-[1.85] text-[#666]">Have a question about an order, sneaker authenticity, or upcoming drops? Reach out to our team—we are always ready to assist your step.</p>
          </div>
          <div className="relative flex min-h-[320px] items-center justify-center max-[850px]:min-h-[240px]">
            <div className="absolute h-[300px] w-[300px] rounded-full bg-[#E1E8F5] max-[850px]:h-[240px] max-[850px]:w-[240px]" />
            <div className="relative z-10 flex w-[320px] max-w-full flex-col gap-4 rounded-[20px] border border-[#E5E7EB] bg-white px-[30px] py-6 shadow-[0_20px_40px_rgba(18,58,140,0.08)]">
              <div className="flex items-center gap-[14px]">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFF0F1] text-[#D7192D]"><Icon name="headphones" /></div>
                <div><h4 className="font-montserrat text-[15px] font-bold text-[#123A8C]">Customer Support</h4><p className="text-xs text-[#666]">Dedicated Sneaker Specialists</p></div>
              </div>
              <div className="flex items-center justify-between border-t border-dashed border-[#E5E7EB] pt-[14px] text-xs"><span>Average Response</span><span className="inline-flex items-center gap-[6px] rounded-full bg-[#EDF2FC] px-[10px] py-1 text-[11px] font-bold text-[#123A8C]"><span className="h-[6px] w-[6px] rounded-full bg-green-500" /> Under 15 mins*</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK CONTACT */}
      <section className="relative z-10 mx-auto -mt-10 mb-[70px] w-[88%] max-w-[1180px] max-[850px]:mt-5">
        <div className="grid grid-cols-4 gap-5 max-[992px]:grid-cols-2 max-[600px]:grid-cols-1">
          {contacts.map(contact => (
            <article key={contact.title} className="flex flex-col rounded-2xl border border-[#E5E7EB] bg-white px-[22px] py-[26px] transition-all hover:-translate-y-[5px] hover:border-[#123A8C]/30 hover:shadow-lg">
              <div className={`mb-[18px] flex h-12 w-12 items-center justify-center rounded-xl ${contact.accent}`}><Icon name={contact.icon} /></div>
              <h3 className="mb-[6px] font-montserrat text-base font-bold">{contact.title}</h3>
              <p className="mb-[14px] whitespace-pre-line text-xs leading-[1.6] text-[#666]">{contact.description}</p>
              {contact.href ? <a href={contact.href} className="mt-auto inline-flex items-center gap-[6px] break-all text-[13px] font-bold text-[#123A8C] hover:text-[#D7192D]">{contact.label}<Icon name="arrow" size={14} /></a> : <span className="mt-auto text-[13px] font-bold text-[#666]">{contact.label}</span>}
            </article>
          ))}
        </div>
      </section>

      {/* FORM + FAQ */}
      <section className="mx-auto mb-[90px] w-[88%] max-w-[1180px]">
        <div className="grid grid-cols-[1.15fr_0.85fr] items-start gap-[50px] max-[992px]:grid-cols-1 max-[992px]:gap-10">
          <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-10 shadow-[0_10px_30px_rgba(0,0,0,0.02)] max-[600px]:p-6">
            <div className="mb-7"><h2 className="font-montserrat text-[26px] font-extrabold tracking-[-0.8px] text-[#123A8C]">Send Us a Message</h2><p className="mt-[6px] text-[13px] text-[#666]">Fill out the form below and our team will get back to you shortly.</p></div>
            {c.notice && <div role="status" className="mb-5 flex items-start gap-3 rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] p-4 text-[13px] text-[#123A8C]"><Icon name="check" size={20} /><span>{c.notice}</span></div>}
            <form id="contactForm" onSubmit={c.submitContact} className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-[18px] max-[600px]:grid-cols-1">
                <div className="flex flex-col gap-2"><label htmlFor="fullName" className={labelClass}>Full Name *</label><input id="fullName" required className={inputClass} placeholder="e.g. Alex Morgan" value={c.form.fullName} onChange={e => c.updateField('fullName', e.target.value)} /></div>
                <div className="flex flex-col gap-2"><label htmlFor="contactEmail" className={labelClass}>Email Address *</label><input id="contactEmail" type="email" required className={inputClass} placeholder="alex@example.com" value={c.form.email} onChange={e => c.updateField('email', e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-[18px] max-[600px]:grid-cols-1">
                <div className="flex flex-col gap-2"><label htmlFor="category" className={labelClass}>Inquiry Topic *</label><select id="category" required className={inputClass} value={c.form.category} onChange={e => c.updateField('category', e.target.value)}><option value="" disabled>Select a subject...</option><option value="order">Order Tracking & Status</option><option value="authenticity">Sneaker Authenticity</option><option value="returns">Returns & Exchanges</option><option value="sizing">Sizing & Fit Advice</option><option value="partnership">Partnerships & PR</option></select></div>
                <div className="flex flex-col gap-2"><label htmlFor="orderNum" className={labelClass}>Order Number (Optional)</label><input id="orderNum" className={inputClass} placeholder="#SOLE-12345" value={c.form.orderNum} onChange={e => c.updateField('orderNum', e.target.value)} /></div>
              </div>
              <div className="flex flex-col gap-2"><label htmlFor="message" className={labelClass}>Your Message *</label><textarea id="message" required rows={5} className={`${inputClass} min-h-[130px] resize-y`} placeholder="Tell us how we can help you..." value={c.form.message} onChange={e => c.updateField('message', e.target.value)} /></div>
              <button type="submit" className="mt-[10px] inline-flex min-h-12 self-start items-center justify-center gap-[10px] rounded-full bg-[#D7192D] px-7 py-[13px] text-[13px] font-bold text-white transition hover:-translate-y-[2px] hover:bg-[#B81325] max-[600px]:w-full">Send Message <Icon name="send" size={16} /></button>
            </form>
          </div>
          <div>
            <div className="mb-7"><h2 className="font-montserrat text-[26px] font-extrabold tracking-[-0.8px] text-[#123A8C]">Frequently Asked Questions</h2><p className="mt-[6px] text-[13px] text-[#666]">Quick answers to common questions about SOLE.</p></div>
            <div className="flex flex-col gap-[14px]">
              {faqs.map((faq, index) => {
                const active = c.openFaq === index
                return <div key={faq.question} className={`overflow-hidden rounded-xl border bg-white transition ${active ? 'border-[#123A8C]/40 shadow-sm' : 'border-[#E5E7EB]'}`}>
                  <button type="button" aria-expanded={active} onClick={() => c.toggleFaq(index)} className={`flex w-full items-center justify-between gap-[15px] px-5 py-[18px] text-left font-montserrat text-sm font-bold ${active ? 'text-[#123A8C]' : 'text-[#111]'}`}><span>{faq.question}</span><span className={`shrink-0 transition-transform ${active ? 'rotate-180 text-[#123A8C]' : 'text-[#666]'}`}><Icon name="chevron" size={18} /></span></button>
                  {active && <div className="bg-[#FAFBFD] px-5 pb-5 pt-[14px] text-[13px] leading-[1.8] text-[#666]">{faq.answer}</div>}
                </div>
              })}
            </div>
          </div>
        </div>
      </section>

        {/* STORE LOCATIONS - illustrative project locations, not verified operating stores */}
      <section id="stores" className="mx-auto mb-[90px] w-[88%] max-w-[1180px] scroll-mt-8">
        <div className="mb-[38px] text-center"><p className="text-[11px] font-extrabold tracking-[2px] text-[#D7192D]">VISIT OUR STORES</p><h2 className="mt-[10px] font-montserrat text-[clamp(27px,3vw,36px)] font-extrabold tracking-[-1.3px]">Experience SOLE. in Person</h2><p className="mt-2 text-[13px] text-[#666]">Concept store locations shown for this website project.</p></div>
        <div className="grid grid-cols-2 gap-6 max-[850px]:grid-cols-1">
          {stores.map(store => <article key={store.name} className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white transition hover:-translate-y-1 hover:shadow-lg">
            <div className="flex h-[180px] items-center justify-center bg-[#E8ECF5] [background-image:radial-gradient(#C5D2EA_1px,transparent_1px)] [background-size:16px_16px]"><div className="flex items-center gap-2 rounded-full bg-white px-[18px] py-[10px] font-montserrat text-xs font-bold text-[#123A8C] shadow-lg"><span className="text-[#D7192D]"><Icon name="pin" size={16} /></span>{store.badge}</div></div>
            <div className="flex flex-col gap-3 p-7"><h3 className="font-montserrat text-lg font-extrabold text-[#123A8C]">{store.name}</h3><div className="flex items-start gap-[10px] text-[13px] text-[#666]"><span className="mt-[3px] shrink-0 text-[#D7192D]"><Icon name="pin" size={16} /></span>{store.address}</div><div className="flex items-start gap-[10px] text-[13px] text-[#666]"><span className="mt-[3px] shrink-0 text-[#D7192D]"><Icon name="clock" size={16} /></span>{store.hours}</div><span className="mt-[10px] text-xs text-[#666]">Directions will be available when store locations are confirmed.</span></div>
          </article>)}
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="flex flex-col items-center bg-[#123A8C] px-[6%] py-[70px] text-center text-white max-[600px]:py-[55px]">
        <p className="text-[11px] font-extrabold tracking-[2px] text-[#FFB6BD]">HAVE A SPECIFIC SHOE REQUEST?</p>
        <h2 className="mt-3 max-w-[700px] font-montserrat text-[clamp(27px,4vw,39px)] font-extrabold leading-[1.35] tracking-[-1.2px]">Looking for a rare pair or custom sourcing?</h2>
        <p className="mt-[13px] max-w-[480px] text-[13px] leading-[1.8] text-[#D9E2F5]">Tell us which sneaker you're searching for and our concierge team will help locate your dream pair.</p>
        <a href="#contactForm" className="mt-6 inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#D7192D] px-7 py-[13px] text-xs font-bold text-white transition hover:-translate-y-[2px] hover:bg-[#B81325]">Request Sneaker Sourcing <Icon name="arrow" size={16} /></a>
      </section>
    </main>
  )
}
