
import { Link } from 'react-router-dom'
import sneakers from '../../assets/images/sneakers.png'

// Simple reusable icons
function Icon({ name, size = 24 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    arrow: <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>,
    target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
    eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />,
    monitor: <><rect x="2" y="3" width="16" height="13" rx="2" /><path d="M7 21h6m-3-5v5" /><rect x="19" y="9" width="3" height="11" rx="1" /></>,
    users: <><circle cx="9" cy="8" r="3" /><path d="M3 20v-2a6 6 0 0 1 12 0v2" /><path d="M17 5a3 3 0 0 1 0 6m2 9v-2a5 5 0 0 0-3-4.6" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

const principles = [
  {
    title: 'Passion',
    description: 'We value the creativity and individuality that make sneakers meaningful to different people.',
    icon: 'heart',
    color: 'bg-[#EDF2FC] text-[#123A8C]',
  },
  {
    title: 'Convenience',
    description: 'We aim to make browsing and shopping easier through a simple and accessible website.',
    icon: 'monitor',
    color: 'bg-[#FFF0F1] text-[#D7192D]',
  },
  {
    title: 'Teamwork',
    description: 'We bring different ideas together to create a website with a shared purpose and direction.',
    icon: 'users',
    color: 'bg-[#123A8C] text-white',
  },
]

const team = [
  {
    name: 'Jether Aguatani',
    description: 'Part of the team working together to develop and improve the SOLE. shopping experience.',
    color: 'bg-[#FFF0F1] text-[#D7192D]',
  },
  {
    name: 'Lloyd Darantan',
    description: 'Part of the team contributing ideas and effort to bring the SOLE. website project to life.',
    color: 'bg-[#EDF2FC] text-[#123A8C]',
  },
  {
    name: 'Mikealla Rentuaya',
    description: 'Part of the team focused on building a website that reflects the style and purpose of SOLE.',
    color: 'bg-[#111111] text-white',
  },
]

export default function AboutUs() {
  return (
    <main className="w-full overflow-hidden bg-white font-sans text-[#111111]">

      {/* HERO SECTION */}
      <section className="w-full bg-[#F4F6F9]">
        <div className="mx-auto grid min-h-[480px] w-[88%] max-w-[1180px] grid-cols-2 items-center gap-[60px] py-[70px] max-[850px]:grid-cols-1 max-[850px]:gap-[35px] max-[850px]:py-[50px]">

          <div className="max-w-[540px]">
            <p className="text-[11px] font-extrabold tracking-[2px] text-[#D7192D]">
              GET TO KNOW US
            </p>

            <h1 className="mt-[18px] font-montserrat text-[clamp(38px,5vw,56px)] font-extrabold leading-[1.15] tracking-[-2px] text-[#123A8C]">
              More Than Just
              <br />
              Sneakers<span className="text-[#D7192D]">.</span>
            </h1>

            <p className="mt-5 max-w-[480px] text-sm leading-[1.85] text-[#666666]">
              We believe that every step tells a story. SOLE. was created
              for people who want to express their style, find their next
              favorite pair, and walk with confidence.
            </p>

            <Link
              to="/shop"
              className="mt-7 inline-flex min-h-[46px] items-center justify-center gap-[10px] rounded-full bg-[#D7192D] px-6 py-3 text-xs font-bold text-white transition-all hover:-translate-y-[2px] hover:bg-[#B81325]"
            >
              Explore Our Collection
              <Icon name="arrow" size={16} />
            </Link>
          </div>

          {/* HERO IMAGE */}
          <div className="relative flex min-h-[380px] w-full items-center justify-center max-[850px]:min-h-[300px]">
            <div className="absolute h-[320px] w-[320px] rounded-full bg-[#E1E8F5] max-[850px]:h-[260px] max-[850px]:w-[260px] max-[600px]:h-[220px] max-[600px]:w-[220px]" />

            <img
                src={sneakers}
                alt="Stylish sneakers featured by SOLE"
                className="relative z-10 block h-auto w-full max-w-[460px] object-contain"
            />

            <span className="absolute bottom-[10px] right-[15px] z-20 text-[10px] font-bold tracking-[2px] text-[#123A8C] max-[600px]:text-[8px]">
              YOUR STYLE. YOUR SOLE.
            </span>
          </div>
        </div>
      </section>

      {/* OUR STORY */}
      <section className="mx-auto w-[88%] max-w-[1180px] py-[85px]">
        <div className="mb-[35px] flex items-center gap-3">
          <span className="h-[3px] w-8 bg-[#D7192D]" />
          <p className="text-[11px] font-extrabold tracking-[2px] text-[#D7192D]">
            OUR STORY
          </p>
        </div>

        <div className="grid grid-cols-2 gap-[70px] max-[850px]:grid-cols-1 max-[850px]:gap-[25px]">
          <h2 className="font-montserrat text-[clamp(27px,3vw,36px)] font-extrabold leading-[1.35] tracking-[-1.3px] text-[#123A8C]">
            Every great journey
            <br />
            starts with a single step.
          </h2>

          <div className="space-y-4 text-[13px] leading-[1.95] text-[#666666]">
            <p>
              SOLE. is a sneaker shopping website built around the idea
              that footwear is more than something we wear. It is part
              of our identity, our lifestyle, and the way we express
              ourselves.
            </p>

            <p>
              Our goal is to provide a convenient way for sneaker lovers
              to discover styles that match their personality. Whether
              you prefer a classic look, a sporty design, or something
              bold, we want your shopping experience to be simple and
              enjoyable.
            </p>

            <p>
              As a team of three, we developed SOLE. to bring our ideas
              together and create an online shopping experience that
              combines style, simplicity, and convenience.
            </p>
          </div>
        </div>
      </section>

      {/* MISSION AND VISION */}
      <section className="mx-auto w-[88%] max-w-[1180px] py-[85px]">
        <div className="mb-[38px] text-center">
          <p className="text-[11px] font-extrabold tracking-[2px] text-[#D7192D]">
            WHAT DRIVES US
          </p>

          <h2 className="mt-[10px] font-montserrat text-[clamp(27px,3vw,36px)] font-extrabold tracking-[-1.3px]">
            Our Mission & Vision
          </h2>

          <p className="mt-[10px] text-[13px] text-[#666666]">
            What we aim to achieve through SOLE.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-[22px] max-[600px]:grid-cols-1">

          {/* MISSION */}
          <article className="rounded-[13px] border border-[#E5E7EB] bg-[#F3F6FC] p-8">
            <div className="mb-6 flex h-[49px] w-[49px] items-center justify-center rounded-xl bg-white text-[#123A8C]">
              <Icon name="target" />
            </div>

            <p className="text-[10px] font-extrabold tracking-[1.8px] text-[#D7192D]">
              OUR MISSION
            </p>

            <h3 className="mt-2 font-montserrat text-[21px] font-bold leading-[1.5]">
              Make sneaker shopping easier.
            </h3>

            <p className="mt-3 text-xs leading-[1.9] text-[#666666]">
              Our mission is to provide a convenient and user-friendly
              online platform where customers can explore sneakers,
              discover styles they love, and enjoy a smooth shopping
              experience.
            </p>
          </article>

          {/* VISION */}
          <article className="rounded-[13px] border border-[#E5E7EB] bg-[#FFF4F4] p-8">
            <div className="mb-6 flex h-[49px] w-[49px] items-center justify-center rounded-xl bg-white text-[#D7192D]">
              <Icon name="eye" />
            </div>

            <p className="text-[10px] font-extrabold tracking-[1.8px] text-[#D7192D]">
              OUR VISION
            </p>

            <h3 className="mt-2 font-montserrat text-[21px] font-bold leading-[1.5]">
              Inspire confidence in every step.
            </h3>

            <p className="mt-3 text-xs leading-[1.9] text-[#666666]">
              Our vision is to build a recognizable sneaker shopping
              platform where people can express their individuality,
              find footwear that suits their lifestyle, and feel
              confident in their choices.
            </p>
          </article>
        </div>
      </section>

      {/* CORE VALUES */}
      <section className="mx-auto w-[88%] max-w-[1180px] pb-[85px] pt-[15px]">
        <div className="mb-[38px] text-center">
          <p className="text-[11px] font-extrabold tracking-[2px] text-[#D7192D]">
            WHAT WE BELIEVE IN
          </p>

          <h2 className="mt-[10px] font-montserrat text-[clamp(27px,3vw,36px)] font-extrabold tracking-[-1.3px]">
            The Values Behind SOLE.
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-[22px] max-[600px]:grid-cols-1">
          {principles.map((principle) => (
            <article
              key={principle.title}
              className="rounded-xl border border-[#E5E7EB] p-[26px] transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className={`mb-5 flex h-[45px] w-[45px] items-center justify-center rounded-xl ${principle.color}`}>
                <Icon name={principle.icon} size={22} />
              </div>

              <h3 className="font-montserrat text-base font-bold">
                {principle.title}
              </h3>

              <p className="mt-[9px] text-xs leading-[1.9] text-[#666666]">
                {principle.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* MEET THE TEAM */}
      <section className="mx-auto w-[88%] max-w-[1180px] pb-[85px] pt-[45px]">
        <div className="mb-[38px] text-center">
          <p className="text-[11px] font-extrabold tracking-[2px] text-[#D7192D]">
            THE PEOPLE BEHIND THE BRAND
          </p>

          <h2 className="mt-[10px] font-montserrat text-[clamp(27px,3vw,36px)] font-extrabold tracking-[-1.3px]">
            Meet Our Team
          </h2>

          <p className="mt-[10px] text-[13px] text-[#666666]">
            Three members. One shared vision.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-5 max-[600px]:grid-cols-1">
          {team.map((member) => (
            <article
              key={member.name}
              className="min-w-0 rounded-[13px] border border-[#E5E7EB] bg-white px-[22px] py-7 text-center transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className={`mx-auto mb-5 flex h-[78px] w-[78px] items-center justify-center rounded-3xl ${member.color}`}>
                <Icon name="user" size={34} />
              </div>

              <h3 className="font-montserrat text-base font-bold">
                {member.name}
              </h3>

              <p className="mt-3 text-xs leading-[1.9] text-[#666666]">
                {member.description}
              </p>
            </article>
          ))}
        </div>

        <p className="mx-auto mt-7 max-w-[650px] text-center text-xs leading-[1.9] text-[#666666]">
          Our website is a collaborative project shaped by the ideas,
          creativity, and efforts of all three team members.
        </p>
      </section>

      {/* CLOSING SECTION */}
      <section className="flex flex-col items-center bg-[#123A8C] px-[6%] py-[70px] text-center text-white">
        <p className="text-[11px] font-extrabold tracking-[2px] text-[#FFB6BD]">
          YOUR JOURNEY STARTS HERE
        </p>

        <h2 className="mt-3 max-w-[700px] font-montserrat text-[clamp(27px,4vw,39px)] font-extrabold leading-[1.35] tracking-[-1.2px]">
          Find the pair that feels like you.
        </h2>

        <p className="mt-[13px] max-w-[480px] text-[13px] leading-[1.7] text-[#D9E2F5]">
          Explore sneakers that match your style and take your next
          step with SOLE.
        </p>

        <Link
          to="/shop"
          className="mt-6 inline-flex min-h-[48px] items-center justify-center gap-3 rounded-md bg-[#D7192D] px-6 py-[13px] text-xs font-bold text-white transition-colors hover:bg-[#B81325]"
        >
          Shop Sneakers
          <Icon name="arrow" size={16} />
        </Link>
      </section>
    </main>
  )
}
