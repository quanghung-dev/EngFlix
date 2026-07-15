"use client"

import Image from "next/image"
import Link from "next/link"
import {
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useEffect,
  useId,
  useState,
} from "react"
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react"
import {
  ArrowRight,
  BrainCircuit,
  Check,
  Eye,
  Headphones,
  Menu,
  Mic2,
  Play,
  Sparkles,
  Volume2,
  X,
  type LucideIcon,
} from "lucide-react"

import { ThemeToggle } from "@/components/theme-toggle"

const NAV_ITEMS = [
  { href: "#features", label: "Tính năng" },
  { href: "#method", label: "Phương pháp" },
  { href: "#experience", label: "Trải nghiệm" },
] as const

const WAVEFORM_BARS = [
  { id: "wave-01", height: 18 },
  { id: "wave-02", height: 32 },
  { id: "wave-03", height: 22 },
  { id: "wave-04", height: 44 },
  { id: "wave-05", height: 28 },
  { id: "wave-06", height: 50 },
  { id: "wave-07", height: 36 },
  { id: "wave-08", height: 24 },
  { id: "wave-09", height: 42 },
  { id: "wave-10", height: 30 },
  { id: "wave-11", height: 48 },
  { id: "wave-12", height: 26 },
] as const

const SCORE_METRICS = [
  { label: "Chính xác", value: "92%", color: "#6ee7f2" },
  { label: "Trôi chảy", value: "88%", color: "#f7c76f" },
  { label: "Ngữ điệu", value: "Excellent", color: "#9af7c5" },
] as const

type ExperienceId = "watch" | "practice" | "feedback"

interface ExperienceMode {
  id: ExperienceId
  label: string
  eyebrow: string
  title: string
  description: string
  icon: LucideIcon
  accent: string
  accentClass: string
  bullets: readonly string[]
}

const EXPERIENCE_MODES: readonly ExperienceMode[] = [
  {
    id: "watch",
    label: "Xem",
    eyebrow: "Context first",
    title: "Nắm trọn ngữ cảnh trong một cảnh phim",
    description:
      "Phụ đề song ngữ thông minh làm nổi bật cụm từ đáng nhớ ngay khi nhân vật cất lời.",
    icon: Eye,
    accent: "#6ee7f2",
    accentClass: "text-brand-cyan",
    bullets: ["Phụ đề theo từng câu thoại", "Chạm để lưu từ mới"],
  },
  {
    id: "practice",
    label: "Luyện",
    eyebrow: "Speak the scene",
    title: "Bắt chước nhịp nói, không chỉ đọc từng từ",
    description:
      "Ghi âm trực tiếp trên câu thoại và quan sát waveform để luyện đúng nhịp, trọng âm, cảm xúc.",
    icon: Mic2,
    accent: "#f7c76f",
    accentClass: "text-action-gold",
    bullets: ["Shadowing theo từng nhịp", "Nghe lại và so sánh tức thì"],
  },
  {
    id: "feedback",
    label: "Phản hồi",
    eyebrow: "AI feedback",
    title: "Biết chính xác điểm cần cải thiện",
    description:
      "EngFlex phân tích phát âm, độ trôi chảy và ngữ điệu để mỗi lần thử đều tiến bộ rõ ràng.",
    icon: BrainCircuit,
    accent: "#9af7c5",
    accentClass: "text-status-success",
    bullets: ["Điểm số theo ba tiêu chí", "Gợi ý luyện lại có trọng tâm"],
  },
] as const

function supportsPointerMotion(event: ReactPointerEvent<HTMLElement>) {
  return (
    event.pointerType !== "touch" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches
  )
}

export function LandingNav() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const shouldReduceMotion = Boolean(useReducedMotion())
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, "change", (latest) => {
    const nextValue = latest > 24
    setIsScrolled((current) => (current === nextValue ? current : nextValue))
  })

  useEffect(() => {
    if (!isMenuOpen) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false)
    }

    window.addEventListener("keydown", closeOnEscape)
    return () => window.removeEventListener("keydown", closeOnEscape)
  }, [isMenuOpen])

  const closeMenu = () => setIsMenuOpen(false)

  return (
    <motion.header
      className="pointer-events-none fixed inset-x-0 top-0 z-50 px-4 pt-3 sm:px-6 sm:pt-5"
      initial={shouldReduceMotion ? false : { y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.55, ease: "easeOut" }}
    >
      <nav
        aria-label="Điều hướng chính"
        className={`landing-glass pointer-events-auto mx-auto max-w-7xl rounded-2xl border transition-[background-color,border-color,box-shadow,backdrop-filter] duration-500 ${
          isScrolled || isMenuOpen
            ? "border-brand-cyan/20 bg-surface-glass shadow-card backdrop-blur-xl"
            : "border-stroke-subtle bg-surface-glass/70 backdrop-blur-md"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-4 sm:px-5 lg:px-6">
          <Link
            href="/"
            className="group flex items-center gap-2.5 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-4 focus-visible:ring-offset-canvas"
            aria-label="EngFlex - Trang chủ"
          >
            <span className="relative grid size-9 place-items-center overflow-hidden rounded-xl border border-brand-cyan/20 bg-gradient-to-br from-brand-cyan/15 to-action-gold/10 shadow-[inset_0_0_16px_var(--engflex-cyan-tint)]">
              <Image
                src="/owl-speaking-light.webp"
                alt=""
                width={40}
                height={40}
                aria-hidden="true"
                className="h-auto w-10 object-contain transition-transform duration-300 group-hover:scale-110 dark:hidden"
              />
              <Image
                src="/owl-speaking-cinematic.webp"
                alt=""
                width={40}
                height={40}
                aria-hidden="true"
                className="hidden h-auto w-10 object-contain transition-transform duration-300 group-hover:scale-110 dark:block"
              />
            </span>
            <span className="text-lg font-semibold tracking-heading text-copy-primary">
              Eng<span className="text-brand-cyan">Flex</span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-4 py-2 text-sm font-medium text-copy-secondary transition-colors hover:bg-surface-inner hover:text-copy-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle className="size-11 shrink-0" />

            <Link
              href="/topics"
              className="hidden min-h-11 items-center gap-2 rounded-xl bg-action-gold-fill px-4 py-2.5 text-sm font-semibold text-action-foreground shadow-card transition-all hover:-translate-y-0.5 hover:bg-action-gold-fill/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-4 focus-visible:ring-offset-canvas sm:inline-flex"
            >
              Bắt đầu học
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>

            <button
              type="button"
              onClick={() => setIsMenuOpen((current) => !current)}
              aria-expanded={isMenuOpen}
              aria-controls="landing-mobile-menu"
              aria-label={isMenuOpen ? "Đóng menu điều hướng" : "Mở menu điều hướng"}
              className="grid size-11 place-items-center rounded-xl border border-stroke bg-surface-inner text-copy-primary transition-colors hover:bg-surface-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus lg:hidden"
            >
              {isMenuOpen ? (
                <X aria-hidden="true" className="size-5" />
              ) : (
                <Menu aria-hidden="true" className="size-5" />
              )}
            </button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {isMenuOpen ? (
            <motion.div
              id="landing-mobile-menu"
              initial={shouldReduceMotion ? false : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
              className="overflow-hidden lg:hidden"
            >
              <div className="grid gap-1 border-t border-stroke-subtle p-3">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    className="rounded-xl px-4 py-3 text-sm font-medium text-copy-secondary transition-colors hover:bg-surface-inner hover:text-copy-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/topics"
                  onClick={closeMenu}
                  className="mt-1 flex min-h-11 items-center justify-between rounded-xl bg-action-gold-fill px-4 py-3 text-sm font-semibold text-action-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus sm:hidden"
                >
                  Bắt đầu học
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </nav>
    </motion.header>
  )
}

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  distance?: number
  once?: boolean
  eager?: boolean
}

export function Reveal({
  children,
  className,
  delay = 0,
  distance = 28,
  once = true,
  eager = false,
}: RevealProps) {
  const shouldReduceMotion = Boolean(useReducedMotion())

  return (
    <motion.div
      className={className}
      initial={shouldReduceMotion || eager ? false : { opacity: 0, y: distance }}
      whileInView={eager ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.18 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.65,
        delay: shouldReduceMotion ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  )
}

interface TiltCardProps {
  children: ReactNode
  className?: string
  intensity?: number
}

export function TiltCard({ children, className, intensity = 7 }: TiltCardProps) {
  const shouldReduceMotion = Boolean(useReducedMotion())
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const rawRotateX = useTransform(pointerY, [-0.5, 0.5], [intensity, -intensity])
  const rawRotateY = useTransform(pointerX, [-0.5, 0.5], [-intensity, intensity])
  const rotateX = useSpring(rawRotateX, { stiffness: 240, damping: 24 })
  const rotateY = useSpring(rawRotateY, { stiffness: 240, damping: 24 })

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !supportsPointerMotion(event)) return

    const bounds = event.currentTarget.getBoundingClientRect()
    pointerX.set((event.clientX - bounds.left) / bounds.width - 0.5)
    pointerY.set((event.clientY - bounds.top) / bounds.height - 0.5)
  }

  const resetTilt = () => {
    pointerX.set(0)
    pointerY.set(0)
  }

  return (
    <motion.div
      className={className}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
      style={{
        rotateX: shouldReduceMotion ? 0 : rotateX,
        rotateY: shouldReduceMotion ? 0 : rotateY,
        transformPerspective: 1000,
        transformStyle: "preserve-3d",
      }}
      whileHover={shouldReduceMotion ? undefined : { y: -6 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
    >
      {children}
    </motion.div>
  )
}

export function HeroVisual() {
  const shouldReduceMotion = Boolean(useReducedMotion())
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const rawRotateX = useTransform(pointerY, [-0.5, 0.5], [5.5, -5.5])
  const rawRotateY = useTransform(pointerX, [-0.5, 0.5], [-7.5, 7.5])
  const rawFloatX = useTransform(pointerX, [-0.5, 0.5], [-14, 14])
  const rawFloatY = useTransform(pointerY, [-0.5, 0.5], [-10, 10])
  const rotateX = useSpring(rawRotateX, { stiffness: 160, damping: 22 })
  const rotateY = useSpring(rawRotateY, { stiffness: 160, damping: 22 })
  const floatX = useSpring(rawFloatX, { stiffness: 130, damping: 20 })
  const floatY = useSpring(rawFloatY, { stiffness: 130, damping: 20 })

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !supportsPointerMotion(event)) return

    const bounds = event.currentTarget.getBoundingClientRect()
    pointerX.set((event.clientX - bounds.left) / bounds.width - 0.5)
    pointerY.set((event.clientY - bounds.top) / bounds.height - 0.5)
  }

  const resetParallax = () => {
    pointerX.set(0)
    pointerY.set(0)
  }

  return (
    <div
      className="relative mx-auto min-h-[480px] w-full max-w-[680px] sm:min-h-[590px]"
      onPointerMove={handlePointerMove}
      onPointerLeave={resetParallax}
      aria-label="Mô phỏng không gian học tiếng Anh tương tác của EngFlex"
      role="img"
    >
      <div
        aria-hidden="true"
        className="absolute left-[12%] top-[12%] size-64 rounded-full bg-cyan-300/10 blur-[80px]"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-[8%] right-[6%] size-56 rounded-full bg-amber-300/10 blur-[72px]"
      />

      <motion.div
        className="absolute inset-x-[2%] top-[8%] rounded-[2rem] border border-white/10 bg-[#081725]/80 p-2.5 shadow-[0_45px_120px_rgba(0,0,0,0.55),0_0_80px_rgba(110,231,242,0.07)] backdrop-blur-xl sm:inset-x-[5%] sm:top-[9%] sm:rounded-[2.5rem] sm:p-3"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 26, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{
          rotateX: shouldReduceMotion ? 0 : rotateX,
          rotateY: shouldReduceMotion ? 0 : rotateY,
          transformPerspective: 1200,
          transformStyle: "preserve-3d",
        }}
      >
        <div className="flex items-center justify-between px-2.5 py-2 sm:px-4">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="size-2 rounded-full bg-rose-300/70" />
            <span className="size-2 rounded-full bg-amber-200/70" />
            <span className="size-2 rounded-full bg-emerald-300/70" />
          </div>
          <div className="flex items-center gap-2 text-micro font-semibold uppercase tracking-meta text-slate-400 sm:text-xs">
            <Sparkles aria-hidden="true" className="size-3.5 text-[#f7c76f]" />
            Learning cockpit
          </div>
          <div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2 py-1 text-micro font-semibold uppercase tracking-meta text-emerald-200 sm:text-micro">
            Live
          </div>
        </div>

        <div className="relative aspect-[1.05/1] overflow-hidden rounded-[1.45rem] border border-white/[0.08] bg-[radial-gradient(circle_at_55%_35%,rgba(40,103,127,0.36),transparent_34%),linear-gradient(145deg,#0b2031_0%,#07111f_52%,#091725_100%)] sm:aspect-[1.35/1] sm:rounded-[2rem]">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(110,231,242,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(110,231,242,0.05)_1px,transparent_1px)] [background-size:34px_34px] [mask-image:linear-gradient(to_bottom,black,transparent_86%)]"
          />
          <div
            aria-hidden="true"
            className="absolute left-[9%] top-[14%] h-[42%] w-[52%] rounded-[1.4rem] border border-white/[0.08] bg-gradient-to-br from-cyan-200/[0.08] to-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
          >
            <div className="absolute inset-x-[8%] bottom-[12%] h-px bg-gradient-to-r from-transparent via-cyan-100/30 to-transparent" />
            <div className="absolute left-[12%] top-[16%] h-1.5 w-[42%] rounded-full bg-white/10" />
            <div className="absolute left-[12%] top-[27%] h-1.5 w-[65%] rounded-full bg-white/[0.06]" />
          </div>

          <motion.div
            aria-hidden="true"
            className="absolute left-[30%] top-[26%] grid size-12 place-items-center rounded-full border border-white/20 bg-white/10 text-white shadow-[0_12px_40px_rgba(0,0,0,0.3)] backdrop-blur-md sm:size-14"
            animate={shouldReduceMotion ? undefined : { scale: [1, 1.08, 1] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            style={{ transform: "translateZ(38px)" }}
          >
            <Play className="ml-0.5 size-5 fill-current" />
          </motion.div>

          <div
            className="absolute bottom-[17%] left-[6%] z-20 w-[82%] rounded-xl border border-white/10 bg-[#04101d]/82 p-3 shadow-[0_18px_48px_rgba(0,0,0,0.4)] backdrop-blur-lg sm:bottom-[10%] sm:left-[12%] sm:w-[67%] sm:rounded-2xl sm:p-4"
            style={{ transform: "translateZ(66px)" }}
          >
            <div className="mb-2 flex items-center gap-2 text-micro font-semibold uppercase tracking-meta text-[#6ee7f2] sm:text-micro">
              <Volume2 aria-hidden="true" className="size-3.5" />
              Scene 04 · Subtitle focus
            </div>
            <p className="text-sm font-medium tracking-card text-white sm:text-lg">
              “You&apos;re closer than you think.”
            </p>
            <p className="mt-1 text-micro text-slate-400 sm:text-xs">
              Bạn đang gần mục tiêu hơn bạn nghĩ.
            </p>
          </div>

          <div
            className="absolute right-[3%] top-[7%] z-20 rounded-2xl border border-amber-100/20 bg-[#0c1925]/88 p-3 shadow-[0_20px_50px_rgba(0,0,0,0.42)] backdrop-blur-xl sm:right-[5%] sm:top-[9%] sm:p-4"
            style={{ transform: "translateZ(80px)" }}
          >
            <div className="text-micro font-semibold uppercase tracking-meta text-slate-400 sm:text-micro">
              Pronunciation
            </div>
            <div className="mt-1 flex items-end gap-1">
              <span className="text-2xl font-semibold tracking-heading text-[#f7c76f] sm:text-3xl">92</span>
              <span className="mb-1 text-micro text-slate-500">/ 100</span>
            </div>
            <div className="mt-2 h-1 w-16 overflow-hidden rounded-full bg-white/10 sm:w-20">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#f7c76f] to-[#6ee7f2]"
                initial={shouldReduceMotion ? { width: "92%" } : { width: 0 }}
                animate={{ width: "92%" }}
                transition={{ duration: shouldReduceMotion ? 0 : 1.1, delay: 0.45 }}
              />
            </div>
          </div>

          <div
            className="absolute bottom-[4%] right-[3%] z-10 h-[42%] w-[42%] sm:bottom-[-3%] sm:right-[1%] sm:h-[52%] sm:w-[43%]"
            style={{ transform: "translateZ(72px)" }}
          >
            <motion.div
              className="relative size-full"
              style={{ x: shouldReduceMotion ? 0 : floatX, y: shouldReduceMotion ? 0 : floatY }}
              animate={shouldReduceMotion ? undefined : { rotate: [-1.5, 1.5, -1.5] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Image
                src="/owl-speaking-cinematic.webp"
                alt=""
                fill
                fetchPriority="high"
                sizes="(max-width: 640px) 40vw, 290px"
                className="object-contain drop-shadow-[0_24px_38px_rgba(0,0,0,0.5)]"
              />
            </motion.div>
          </div>
        </div>
      </motion.div>

      <motion.div
        aria-hidden="true"
        className="absolute bottom-[0%] left-[0%] z-30 hidden rounded-2xl border border-cyan-100/15 bg-[#071521]/88 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.42)] backdrop-blur-xl sm:block"
        initial={shouldReduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.7, delay: 0.55 }}
        style={{ x: shouldReduceMotion ? 0 : floatX }}
      >
        <div className="mb-2 flex items-center justify-between gap-6">
          <span className="text-micro font-semibold uppercase tracking-meta text-slate-400">
            Voice match
          </span>
          <span className="text-micro font-semibold text-[#6ee7f2]">Excellent</span>
        </div>
        <div className="flex h-12 items-end gap-1">
          {WAVEFORM_BARS.map((bar, index) => (
            <motion.span
              key={bar.id}
              className="w-1.5 origin-bottom rounded-full bg-gradient-to-t from-[#6ee7f2]/35 to-[#6ee7f2]"
              style={{ height: bar.height }}
              animate={shouldReduceMotion ? { scaleY: 1 } : { scaleY: [0.46, 1, 0.58] }}
              transition={{
                duration: 1.15,
                repeat: shouldReduceMotion ? 0 : Infinity,
                repeatType: "mirror",
                delay: index * 0.06,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </motion.div>

      <motion.div
        aria-hidden="true"
        className="absolute bottom-[3%] right-[1%] z-30 hidden items-center gap-2 rounded-full border border-amber-100/15 bg-[#0a1723]/90 px-3 py-2 text-xs font-semibold text-slate-200 shadow-[0_16px_45px_rgba(0,0,0,0.36)] backdrop-blur-xl sm:flex"
        initial={shouldReduceMotion ? false : { opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.7, delay: 0.7 }}
      >
        <span className="grid size-6 place-items-center rounded-full bg-emerald-300/10 text-emerald-200">
          <Check className="size-3.5" />
        </span>
        Tiến bộ sau mỗi câu
      </motion.div>
    </div>
  )
}

function ExperienceStage({
  mode,
  shouldReduceMotion,
}: {
  mode: ExperienceMode
  shouldReduceMotion: boolean
}) {
  return (
    <div className="relative aspect-[1/1.04] min-h-[380px] overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-[radial-gradient(circle_at_70%_20%,rgba(110,231,242,0.12),transparent_30%),linear-gradient(145deg,#0b2031,#07111e_58%,#0a1724)] sm:aspect-video sm:min-h-0 sm:rounded-[2rem]">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:42px_42px]"
      />
      <div className="absolute inset-x-0 top-0 z-10 flex h-12 items-center justify-between border-b border-white/[0.07] bg-[#07121d]/55 px-4 backdrop-blur-md">
        <div className="flex items-center gap-2 text-micro font-semibold uppercase tracking-meta text-slate-400">
          <span className="size-1.5 rounded-full bg-rose-300/80" />
          Movie scene · 02:14
        </div>
        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/10 sm:w-28">
          <motion.div
            className="h-full rounded-full"
            initial={false}
            animate={{ width: mode.id === "watch" ? "38%" : mode.id === "practice" ? "68%" : "100%" }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.45 }}
            style={{ backgroundColor: mode.accent }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={mode.id}
          className="absolute inset-0 pt-12"
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.985, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.985, y: -8 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.34, ease: "easeOut" }}
        >
          {mode.id === "watch" ? <WatchStage shouldReduceMotion={shouldReduceMotion} /> : null}
          {mode.id === "practice" ? <PracticeStage shouldReduceMotion={shouldReduceMotion} /> : null}
          {mode.id === "feedback" ? <FeedbackStage shouldReduceMotion={shouldReduceMotion} /> : null}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function WatchStage({ shouldReduceMotion }: { shouldReduceMotion: boolean }) {
  return (
    <div className="relative size-full">
      <div className="absolute left-[9%] top-[13%] h-[32%] w-[56%] rounded-2xl border border-cyan-100/10 bg-cyan-100/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="absolute bottom-[17%] left-[10%] h-1.5 w-[56%] rounded-full bg-white/10" />
        <div className="absolute bottom-[9%] left-[10%] h-1.5 w-[36%] rounded-full bg-white/[0.06]" />
      </div>
      <div className="absolute right-[8%] top-[18%] grid size-16 place-items-center rounded-full border border-white/10 bg-white/[0.05] text-white/80 backdrop-blur-sm">
        <Play aria-hidden="true" className="ml-1 size-5 fill-current" />
      </div>
      <motion.div
        className="absolute inset-x-[6%] bottom-[8%] rounded-2xl border border-cyan-100/15 bg-[#04101c]/88 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:inset-x-[10%] sm:p-5"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.45, delay: 0.08 }}
      >
        <div className="mb-2 text-micro font-semibold uppercase tracking-meta text-[#6ee7f2]">
          Tap any word to explore
        </div>
        <p className="text-sm font-medium text-white sm:text-lg">
          I&apos;ve been <span className="rounded bg-[#6ee7f2]/15 px-1.5 py-0.5 text-[#98f4fb]">looking forward to</span> this.
        </p>
        <p className="mt-1.5 text-xs text-slate-400">Tôi đã mong chờ điều này từ lâu.</p>
      </motion.div>
    </div>
  )
}

function PracticeStage({ shouldReduceMotion }: { shouldReduceMotion: boolean }) {
  return (
    <div className="flex size-full flex-col items-center justify-center px-6 pb-6 pt-2">
      <motion.div
        className="relative grid size-20 place-items-center rounded-full border border-amber-100/25 bg-[#f7c76f]/10 text-[#f7c76f] shadow-[0_0_60px_rgba(247,199,111,0.14)] sm:size-24"
        animate={shouldReduceMotion ? undefined : { boxShadow: ["0 0 30px rgba(247,199,111,.08)", "0 0 70px rgba(247,199,111,.22)", "0 0 30px rgba(247,199,111,.08)"] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <Mic2 aria-hidden="true" className="size-7 sm:size-8" />
        <motion.span
          aria-hidden="true"
          className="absolute inset-[-9px] rounded-full border border-[#f7c76f]/15"
          animate={shouldReduceMotion ? undefined : { scale: [0.9, 1.16], opacity: [0.7, 0] }}
          transition={{ duration: 1.7, repeat: Infinity, ease: "easeOut" }}
        />
      </motion.div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-meta text-amber-100/80">
        Your turn · Recording
      </p>
      <div className="mt-6 flex h-16 items-center gap-1 sm:gap-1.5" aria-hidden="true">
        {WAVEFORM_BARS.map((bar, index) => (
          <motion.span
            key={bar.id}
            className="w-1.5 rounded-full bg-gradient-to-t from-[#f7c76f]/25 to-[#f7c76f] sm:w-2"
            style={{ height: bar.height }}
            animate={shouldReduceMotion ? { scaleY: 1 } : { scaleY: [0.35, 1, 0.48] }}
            transition={{
              duration: 0.9 + (index % 3) * 0.14,
              repeat: shouldReduceMotion ? 0 : Infinity,
              repeatType: "mirror",
              delay: index * 0.035,
            }}
          />
        ))}
      </div>
      <div className="mt-4 rounded-xl border border-white/[0.07] bg-white/[0.035] px-4 py-2.5 text-center text-xs text-slate-300 sm:text-sm">
        “I&apos;ve been looking forward to this.”
      </div>
    </div>
  )
}

function FeedbackStage({ shouldReduceMotion }: { shouldReduceMotion: boolean }) {
  return (
    <div className="flex size-full items-center justify-center px-5 pb-5 pt-2 sm:px-8 sm:pb-8">
      <div className="w-full max-w-lg rounded-[1.5rem] border border-emerald-100/15 bg-[#061520]/82 p-4 shadow-[0_26px_70px_rgba(0,0,0,0.38)] backdrop-blur-xl sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-micro font-semibold uppercase tracking-meta text-emerald-200/70 sm:text-micro">
              AI pronunciation report
            </p>
            <p className="mt-1 text-sm font-semibold text-white sm:text-base">Great performance!</p>
          </div>
          <div className="relative grid size-14 place-items-center rounded-full bg-[conic-gradient(#9af7c5_0_92%,rgba(255,255,255,.08)_92%)] p-[3px] sm:size-16">
            <div className="grid size-full place-items-center rounded-full bg-[#081722] text-lg font-semibold text-emerald-100 sm:text-xl">
              92
            </div>
          </div>
        </div>
        <div className="mt-5 grid gap-2 sm:grid-cols-3 sm:gap-3">
          {SCORE_METRICS.map((metric, index) => (
            <motion.div
              key={metric.label}
              className="rounded-xl border border-white/[0.07] bg-white/[0.035] p-3"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.35, delay: index * 0.07 }}
            >
              <p className="text-micro uppercase tracking-meta text-slate-500 sm:text-micro">{metric.label}</p>
              <p className="mt-1 text-xs font-semibold sm:text-sm" style={{ color: metric.color }}>
                {metric.value}
              </p>
            </motion.div>
          ))}
        </div>
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-cyan-100/10 bg-cyan-100/[0.04] p-3 text-micro leading-relaxed text-slate-300 sm:text-xs">
          <Sparkles aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-[#6ee7f2]" />
          Âm cuối rất rõ. Hãy kéo dài nhẹ từ “forward” để câu tự nhiên hơn.
        </div>
      </div>
    </div>
  )
}

export function ExperienceShowcase() {
  const [activeId, setActiveId] = useState<ExperienceId>("watch")
  const shouldReduceMotion = Boolean(useReducedMotion())
  const tabIdPrefix = useId()
  const activeMode = EXPERIENCE_MODES.find((mode) => mode.id === activeId) ?? EXPERIENCE_MODES[0]

  const handleTabKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    currentIndex: number
  ) => {
    let nextIndex: number | null = null

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % EXPERIENCE_MODES.length
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + EXPERIENCE_MODES.length) % EXPERIENCE_MODES.length
    } else if (event.key === "Home") {
      nextIndex = 0
    } else if (event.key === "End") {
      nextIndex = EXPERIENCE_MODES.length - 1
    }

    if (nextIndex === null) return

    event.preventDefault()
    const nextMode = EXPERIENCE_MODES[nextIndex]
    setActiveId(nextMode.id)
    document.getElementById(`${tabIdPrefix}-${nextMode.id}-tab`)?.focus()
  }

  return (
    <div className="landing-glass rounded-[2rem] border border-stroke bg-surface-glass p-2 shadow-modal backdrop-blur-xl sm:rounded-[2.5rem] sm:p-3 lg:p-4">
      <div
        role="tablist"
        aria-label="Các bước trải nghiệm EngFlex"
        className="mb-2 grid grid-cols-3 gap-1 rounded-[1.25rem] border border-stroke-subtle bg-surface-inner p-1 sm:mb-3 sm:gap-2 sm:rounded-[1.5rem] sm:p-1.5"
      >
        {EXPERIENCE_MODES.map((mode, index) => {
          const Icon = mode.icon
          const isActive = activeId === mode.id

          return (
            <button
              key={mode.id}
              id={`${tabIdPrefix}-${mode.id}-tab`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`${tabIdPrefix}-panel`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveId(mode.id)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
              className={`relative flex items-center justify-center gap-2 rounded-xl px-2 py-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus sm:rounded-2xl sm:px-4 sm:text-sm ${
                isActive ? "text-copy-primary" : "text-copy-muted hover:bg-surface-panel hover:text-copy-secondary"
              }`}
            >
              {isActive ? (
                <motion.span
                  layoutId={`${tabIdPrefix}-active-tab`}
                  className="absolute inset-0 rounded-xl border border-stroke bg-surface-panel shadow-[inset_0_1px_0_var(--engflex-border-subtle)] sm:rounded-2xl"
                  transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
                />
              ) : null}
              <Icon
                aria-hidden="true"
                className={`relative z-10 size-4 ${isActive ? mode.accentClass : ""}`}
              />
              <span className="relative z-10">{mode.label}</span>
            </button>
          )
        })}
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.35fr_0.65fr]">
        <div
          id={`${tabIdPrefix}-panel`}
          role="tabpanel"
          aria-labelledby={`${tabIdPrefix}-${activeMode.id}-tab`}
          tabIndex={0}
          className="rounded-[1.5rem] outline-none focus-visible:ring-2 focus-visible:ring-focus sm:rounded-[2rem]"
        >
          <ExperienceStage mode={activeMode} shouldReduceMotion={shouldReduceMotion} />
        </div>

        <div className="relative min-h-[280px] overflow-hidden rounded-[1.5rem] border border-stroke-subtle bg-surface-panel p-6 sm:rounded-[2rem] sm:p-8 lg:flex lg:min-h-0 lg:flex-col lg:justify-between">
          <div
            aria-hidden="true"
            className="absolute -right-16 -top-16 size-44 rounded-full blur-[70px]"
            style={{ backgroundColor: `${activeMode.accent}18` }}
          />
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeMode.id}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.32 }}
              className="relative z-10"
              aria-live="polite"
            >
              <div className={`flex items-center gap-2 text-micro font-semibold uppercase tracking-meta ${activeMode.accentClass}`}>
                <activeMode.icon aria-hidden="true" className="size-4" />
                {activeMode.eyebrow}
              </div>
              <h3 className="mt-4 text-2xl font-semibold leading-tight tracking-heading text-copy-primary sm:text-3xl lg:text-3xl">
                {activeMode.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-copy-muted">{activeMode.description}</p>
              <ul className="mt-6 grid gap-3">
                {activeMode.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-center gap-3 text-sm text-copy-secondary">
                    <span className={`grid size-6 shrink-0 place-items-center rounded-full border border-stroke bg-surface-inner ${activeMode.accentClass}`}>
                      <Check aria-hidden="true" className="size-3.5" />
                    </span>
                    {bullet}
                  </li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>

          <div className="relative z-10 mt-8 flex items-center gap-3 border-t border-stroke-subtle pt-5 text-xs text-copy-muted">
            <Headphones aria-hidden="true" className="size-4 text-copy-muted" />
            Chuyển chế độ để khám phá toàn bộ trải nghiệm
          </div>
        </div>
      </div>
    </div>
  )
}
