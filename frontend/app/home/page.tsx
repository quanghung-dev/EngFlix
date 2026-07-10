import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  CirclePlay,
  Headphones,
  Mic2,
  Sparkles,
} from "lucide-react"

import {
  ExperienceShowcase,
  HeroVisual,
  LandingNav,
  Reveal,
} from "@/components/landing/landing-interactions"
import {
  FeatureGrid,
  FinalCta,
  LandingFooter,
  MethodSection,
  ValueStrip,
} from "@/components/landing/landing-sections"

export const metadata: Metadata = {
  title: "Học tiếng Anh qua từng thước phim",
  description:
    "Luyện nghe, nói và phản xạ tiếng Anh qua phim với Dictation, Shadowing và phản hồi phát âm bằng AI.",
}

export default function HomePage() {
  return (
    <div className="landing-shell min-h-screen overflow-x-clip bg-[#050b18] text-white">
      <LandingNav />

      <main>
        <section className="landing-hero relative isolate flex min-h-[100svh] items-center overflow-hidden px-5 pb-20 pt-32 sm:px-8 lg:px-12 lg:pb-24 lg:pt-36">
          <div className="landing-aurora landing-aurora-cyan" aria-hidden="true" />
          <div className="landing-aurora landing-aurora-gold" aria-hidden="true" />
          <div className="landing-grid" aria-hidden="true" />
          <div className="landing-noise" aria-hidden="true" />
          <div className="landing-orbit landing-orbit-one" aria-hidden="true" />
          <div className="landing-orbit landing-orbit-two" aria-hidden="true" />

          <div className="relative z-10 mx-auto grid w-full max-w-[1440px] items-center gap-14 lg:grid-cols-[0.92fr_1.08fr] lg:gap-8 xl:gap-16">
            <div className="max-w-3xl">
              <Reveal eager>
                <div className="landing-eyebrow mb-7 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100 sm:text-xs">
                  <Sparkles className="size-4 text-amber-300" />
                  Tiếng Anh bước ra từ màn ảnh
                </div>
              </Reveal>

              <Reveal eager delay={0.08}>
                <h1 className="text-balance text-[clamp(3.2rem,7.3vw,7.4rem)] font-semibold leading-[0.91] tracking-[-0.065em] text-white">
                  Học tiếng Anh
                  <span className="mt-2 block text-white/55">qua từng</span>
                  <span className="landing-gradient-text mt-2 block pb-2">
                    thước phim.
                  </span>
                </h1>
              </Reveal>

              <Reveal eager delay={0.16}>
                <p className="mt-8 max-w-xl text-pretty text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
                  Đừng chỉ xem. Hãy nghe từng nhịp thoại, bắt chước từng ngữ
                  điệu và biến những cảnh phim bạn yêu thành phản xạ tiếng Anh
                  tự nhiên.
                </p>
              </Reveal>

              <Reveal eager delay={0.22}>
                <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link
                    href="/topics"
                    className="landing-primary-button group inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold text-[#07111f] sm:min-h-14 sm:px-7 sm:text-base"
                  >
                    Bắt đầu học miễn phí
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                  <a
                    href="#experience"
                    className="landing-secondary-button group inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold text-white sm:min-h-14 sm:px-7 sm:text-base"
                  >
                    <CirclePlay className="size-5 text-cyan-300 transition-transform duration-300 group-hover:scale-110" />
                    Xem cách EngFlex hoạt động
                  </a>
                </div>
              </Reveal>

              <Reveal eager delay={0.3}>
                <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-400">
                  <span className="inline-flex items-center gap-2">
                    <Headphones className="size-4 text-cyan-300" />
                    Nghe trong ngữ cảnh
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Mic2 className="size-4 text-amber-300" />
                    Nói với phản hồi tức thì
                  </span>
                </div>
              </Reveal>
            </div>

            <Reveal eager delay={0.12} className="relative lg:-mr-8 xl:-mr-14">
              <HeroVisual />
            </Reveal>
          </div>

          <a
            href="#features"
            aria-label="Cuộn xuống phần tính năng"
            className="landing-scroll-cue absolute bottom-7 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] font-medium uppercase tracking-[0.24em] text-white/35 lg:flex"
          >
            Khám phá
            <span className="h-9 w-px bg-gradient-to-b from-cyan-300/70 to-transparent" />
          </a>
        </section>

        <ValueStrip />
        <FeatureGrid />

        <section
          id="experience"
          className="relative scroll-mt-24 overflow-hidden px-5 py-24 sm:px-8 lg:px-12 lg:py-36"
        >
          <div className="landing-section-glow landing-section-glow-cyan" aria-hidden="true" />
          <div className="relative mx-auto max-w-[1320px]">
            <Reveal>
              <div className="mb-12 grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end lg:gap-16">
                <div>
                  <p className="landing-kicker">Trải nghiệm học tập</p>
                  <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.045em] text-white sm:text-5xl lg:text-6xl">
                    Một cảnh phim.
                    <span className="block text-white/42">Bốn kỹ năng.</span>
                  </h2>
                </div>
                <p className="max-w-2xl text-pretty text-base leading-7 text-slate-400 sm:text-lg sm:leading-8 lg:justify-self-end">
                  EngFlex biến lời thoại thành một phòng luyện tập sống động — từ
                  khoảnh khắc bạn nghe câu đầu tiên đến lúc tự tin nói lại theo
                  cách của mình.
                </p>
              </div>
            </Reveal>

            <ExperienceShowcase />
          </div>
        </section>

        <MethodSection />
        <FinalCta />
      </main>

      <LandingFooter />
    </div>
  )
}
