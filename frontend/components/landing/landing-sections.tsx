import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  AudioLines,
  BookOpenCheck,
  BrainCircuit,
  Check,
  CheckCircle2,
  Clapperboard,
  Headphones,
  Mic2,
  Play,
  Sparkles,
  Star,
  Target,
  Volume2,
  WandSparkles,
} from "lucide-react";

const waveformHeights = [18, 34, 52, 28, 62, 42, 72, 50, 32, 58, 76, 44, 26, 54, 36];

const methodSteps = [
  {
    number: "01",
    eyebrow: "INPUT",
    title: "Xem để hiểu ngữ cảnh",
    description:
      "Chọn một cảnh phim ngắn, nghe giọng thật và đọc phụ đề song ngữ đúng lúc bạn cần.",
    icon: Play,
    color: "cyan",
  },
  {
    number: "02",
    eyebrow: "PRACTICE",
    title: "Luyện đến khi thành phản xạ",
    description:
      "Điền câu thoại, nói đuổi theo nhân vật và lặp lại những đoạn chưa tròn âm ngay trong một nhịp học.",
    icon: Mic2,
    color: "gold",
  },
  {
    number: "03",
    eyebrow: "RECALL",
    title: "Ghi nhớ bằng tình huống",
    description:
      "Lưu từ vựng cùng câu phim gốc để mỗi lần ôn lại đều có hình ảnh, cảm xúc và cách dùng thực tế.",
    icon: BrainCircuit,
    color: "violet",
  },
] as const;

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-cyan/20 bg-brand-cyan/10 px-3.5 py-2 text-micro font-semibold tracking-meta text-brand-cyan uppercase shadow-[inset_0_1px_0_var(--engflex-border-subtle)]">
      <Sparkles aria-hidden="true" className="size-3.5 text-action-gold" />
      {children}
    </div>
  );
}

function FeatureLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-micro font-semibold tracking-meta text-brand-cyan uppercase">
      <span className="size-1.5 rounded-full bg-brand-cyan shadow-[0_0_12px_var(--engflex-brand-cyan)]" />
      {children}
    </span>
  );
}

export function ValueStrip() {
  return (
    <section
      aria-labelledby="learning-value-title"
      className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10"
    >
      <h2 id="learning-value-title" className="sr-only">
        Trải nghiệm học tập của EngFlex
      </h2>
      <div className="relative overflow-hidden rounded-[1.75rem] border border-stroke bg-surface-glass shadow-modal backdrop-blur-xl">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-cyan/65 to-transparent"
        />
        <div className="grid md:grid-cols-3">
          <div className="group flex min-h-32 items-center gap-5 px-6 py-7 sm:px-8 md:border-r md:border-stroke-subtle">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-brand-cyan/20 bg-brand-cyan/10 text-brand-cyan transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-3 motion-reduce:transition-none">
              <AudioLines aria-hidden="true" className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-meta text-brand-cyan uppercase">
                03 learning modes
              </p>
              <p className="mt-1 text-base font-medium text-copy-primary">Ba cách luyện trong một cảnh phim</p>
            </div>
          </div>

          <div className="group flex min-h-32 items-center gap-5 border-y border-stroke-subtle px-6 py-7 sm:px-8 md:border-x-0 md:border-y-0 md:border-r">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-action-gold/20 bg-action-gold/10 text-action-gold transition-transform duration-500 group-hover:-translate-y-1 group-hover:-rotate-3 motion-reduce:transition-none">
              <WandSparkles aria-hidden="true" className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-meta text-action-gold uppercase">
                Instant feedback
              </p>
              <p className="mt-1 text-base font-medium text-copy-primary">Biết ngay âm nào cần luyện lại</p>
            </div>
          </div>

          <div className="group flex min-h-32 items-center gap-5 px-6 py-7 sm:px-8">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-accent-violet/20 bg-accent-violet/10 text-accent-violet transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-3 motion-reduce:transition-none">
              <Target aria-hidden="true" className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-meta text-accent-violet uppercase">
                Personal path
              </p>
              <p className="mt-1 text-base font-medium text-copy-primary">Lộ trình đi theo nhịp độ của bạn</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FeatureGrid() {
  return (
    <section id="features" aria-labelledby="features-title" className="relative scroll-mt-24 py-28 sm:py-36">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-brand-cyan/[0.07] blur-[120px]"
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="mx-auto mb-14 max-w-3xl text-center sm:mb-18">
          <SectionEyebrow>Built for real conversations</SectionEyebrow>
          <h2 id="features-title" className="text-4xl font-semibold tracking-heading text-copy-primary sm:text-5xl lg:text-6xl">
            Không chỉ xem phim. Bạn đang
            <span className="block bg-gradient-to-r from-brand-cyan via-copy-primary to-action-gold bg-clip-text text-transparent">
              luyện một cuộc hội thoại thật.
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-copy-muted sm:text-lg">
            Mỗi công cụ được đặt đúng vào khoảnh khắc bạn cần nghe rõ hơn, nói tự nhiên hơn và nhớ lâu hơn.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
          <article className="group relative min-h-[31rem] overflow-hidden rounded-[2rem] border border-stroke bg-surface-panel p-6 shadow-card transition-[border-color,transform] duration-500 hover:-translate-y-1 hover:border-brand-cyan/25 motion-reduce:transition-none sm:p-8 lg:col-span-7">
            <div aria-hidden="true" className="absolute -top-20 -right-20 size-64 rounded-full bg-brand-cyan/10 blur-3xl" />
            <div className="relative flex h-full flex-col">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <FeatureLabel>Dictation mode</FeatureLabel>
                  <h3 className="mt-4 text-2xl font-semibold tracking-tight text-copy-primary sm:text-3xl">Nghe từng chữ. Bắt trọn ý.</h3>
                  <p className="mt-3 max-w-lg leading-7 text-copy-muted">
                    Phụ đề biến thành bài điền từ vừa đủ khó, giúp tai bạn quen với nối âm và tốc độ nói tự nhiên.
                  </p>
                </div>
                <div className="hidden size-12 shrink-0 items-center justify-center rounded-2xl border border-brand-cyan/20 bg-brand-cyan/10 text-brand-cyan sm:flex">
                  <Headphones aria-hidden="true" className="size-5" />
                </div>
              </div>

              <div className="mt-8 flex flex-1 flex-col rounded-[1.55rem] border border-white/[0.08] bg-[#061221]/75 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.32)] sm:p-5">
                <div className="flex items-center justify-between border-b border-white/[0.07] pb-4">
                  <span className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <span className="relative flex size-2">
                      <span className="absolute inline-flex size-full rounded-full bg-rose-400 opacity-70 motion-safe:animate-ping" />
                      <span className="relative inline-flex size-2 rounded-full bg-rose-400" />
                    </span>
                    Scene 08:14
                  </span>
                  <span
                    aria-hidden="true"
                    className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-cyan-100"
                  >
                    <Volume2 aria-hidden="true" className="size-4" />
                  </span>
                </div>

                <div className="flex flex-1 flex-col justify-center py-7 sm:py-9">
                  <p className="text-center text-lg leading-9 font-medium text-white/90 sm:text-xl">
                    “You don&apos;t have to see the whole staircase,
                    <br className="hidden sm:block" /> just take the
                    <span className="relative mx-2 inline-flex min-w-20 justify-center rounded-lg border border-cyan-200/20 bg-cyan-300/[0.08] px-2.5 py-0.5 align-middle text-sm text-cyan-200">
                      <span className="transition-all duration-500 group-hover:-translate-y-2 group-hover:opacity-0 motion-reduce:transition-none">•••••</span>
                      <span className="absolute translate-y-2 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:transition-none">
                        first
                      </span>
                    </span>
                    step.”
                  </p>
                  <p className="mt-4 text-center text-sm text-slate-500">Nghe lại đoạn phim để tìm từ còn thiếu</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                    <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-cyan-400 to-sky-300 shadow-[0_0_16px_rgba(34,211,238,0.5)]" />
                  </div>
                  <span className="text-micro text-cyan-200/70">3 / 4 WORDS</span>
                </div>
              </div>
            </div>
          </article>

          <article className="group relative min-h-[31rem] overflow-hidden rounded-[2rem] border border-stroke bg-surface-panel p-6 shadow-card transition-[border-color,transform] duration-500 hover:-translate-y-1 hover:border-accent-violet/25 motion-reduce:transition-none sm:p-8 lg:col-span-5">
            <div aria-hidden="true" className="absolute -top-24 -right-20 size-64 rounded-full bg-accent-violet/10 blur-3xl" />
            <div className="relative flex h-full flex-col">
              <FeatureLabel>Shadowing studio</FeatureLabel>
              <h3 className="mt-4 text-2xl font-semibold tracking-tight text-copy-primary sm:text-3xl">Nói cùng nhân vật.</h3>
              <p className="mt-3 leading-7 text-copy-muted">
                Bắt nhịp, ngữ điệu và cảm xúc bằng cách nói đuổi ngay sau câu thoại gốc.
              </p>

              <div className="mt-8 flex flex-1 flex-col justify-between rounded-[1.55rem] border border-white/[0.08] bg-[#090e20]/70 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-9 items-center justify-center rounded-full bg-violet-300/15 text-violet-200">
                      <Mic2 aria-hidden="true" className="size-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white/85">Your voice</p>
                      <p className="text-micro tracking-meta text-violet-200/60">RECORDING</p>
                    </div>
                  </div>
                  <span className="rounded-full border border-emerald-300/15 bg-emerald-300/[0.08] px-2.5 py-1 text-micro text-emerald-200">
                    IN SYNC
                  </span>
                </div>

                <div
                  className="my-8 flex h-28 items-center justify-center gap-1.5"
                  aria-label="Dạng sóng âm thanh đang mô phỏng"
                  role="img"
                >
                  {waveformHeights.map((height, index) => (
                    <span
                      key={`${height}-${index}`}
                      aria-hidden="true"
                      className="w-1.5 rounded-full bg-gradient-to-t from-violet-500/50 via-violet-300 to-cyan-200 shadow-[0_0_12px_rgba(196,181,253,0.18)] motion-safe:animate-pulse"
                      style={{
                        height,
                        animationDelay: `${index * 90}ms`,
                        animationDuration: `${900 + (index % 4) * 180}ms`,
                      }}
                    />
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/[0.07] bg-white/[0.035] p-3">
                    <p className="text-micro tracking-meta text-slate-500 uppercase">Rhythm</p>
                    <p className="mt-1 text-lg font-semibold text-white">Excellent</p>
                  </div>
                  <div className="rounded-xl border border-white/[0.07] bg-white/[0.035] p-3">
                    <p className="text-micro tracking-meta text-slate-500 uppercase">Tone match</p>
                    <p className="mt-1 text-lg font-semibold text-cyan-200">82%</p>
                  </div>
                </div>
              </div>
            </div>
          </article>

          <article className="group relative min-h-[30rem] overflow-hidden rounded-[2rem] border border-stroke bg-surface-panel p-6 shadow-card transition-[border-color,transform] duration-500 hover:-translate-y-1 hover:border-status-success/25 motion-reduce:transition-none sm:p-8 lg:col-span-5">
            <div className="relative flex h-full flex-col">
              <FeatureLabel>AI pronunciation</FeatureLabel>
              <h3 className="mt-4 text-2xl font-semibold tracking-tight text-copy-primary sm:text-3xl">Thấy rõ từng âm.</h3>
              <p className="mt-3 leading-7 text-copy-muted">
                Phản hồi trực quan cho độ chính xác, độ trôi chảy và ngữ điệu sau mỗi lần nói.
              </p>

              <div className="mt-7 flex flex-1 flex-col justify-center rounded-[1.55rem] border border-white/[0.08] bg-[#071720]/75 p-5 sm:p-6">
                <div className="flex flex-col items-center gap-7 sm:flex-row">
                  <div className="relative flex size-36 shrink-0 items-center justify-center">
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 rounded-full"
                      style={{ background: "conic-gradient(#5eead4 0deg 334deg, rgba(255,255,255,0.06) 334deg 360deg)" }}
                    />
                    <div aria-hidden="true" className="absolute inset-[7px] rounded-full bg-[#091b25]" />
                    <div aria-hidden="true" className="absolute -inset-2 rounded-full border border-dashed border-cyan-300/20 motion-safe:animate-spin [animation-duration:12s]" />
                    <div className="relative text-center">
                      <p className="text-4xl font-semibold tracking-heading text-white">93</p>
                      <p className="text-micro tracking-meta text-emerald-200 uppercase">Great job</p>
                    </div>
                  </div>

                  <div className="w-full space-y-4">
                    {[
                      ["Chính xác", "96%", "w-[96%]"],
                      ["Trôi chảy", "91%", "w-[91%]"],
                      ["Ngữ điệu", "88%", "w-[88%]"],
                    ].map(([label, value, width]) => (
                      <div key={label}>
                        <div className="mb-1.5 flex justify-between text-xs">
                          <span className="text-slate-400">{label}</span>
                          <span className="text-emerald-200">{value}</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                          <div className={`h-full ${width} rounded-full bg-gradient-to-r from-emerald-500 to-cyan-300`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-7 flex items-center gap-3 rounded-xl border border-emerald-200/10 bg-emerald-300/[0.055] px-4 py-3 text-sm text-emerald-50/75">
                  <CheckCircle2 aria-hidden="true" className="size-4 shrink-0 text-emerald-300" />
                  Âm cuối /t/ đã rõ hơn lần trước.
                </div>
              </div>
            </div>
          </article>

          <article className="group relative min-h-[30rem] overflow-hidden rounded-[2rem] border border-stroke bg-surface-panel p-6 shadow-card transition-[border-color,transform] duration-500 hover:-translate-y-1 hover:border-action-gold/25 motion-reduce:transition-none sm:p-8 lg:col-span-7">
            <div aria-hidden="true" className="absolute -right-20 -bottom-20 size-64 rounded-full bg-action-gold/10 blur-3xl" />
            <div className="relative flex h-full flex-col">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <FeatureLabel>Smart vocabulary</FeatureLabel>
                  <h3 className="mt-4 text-2xl font-semibold tracking-tight text-copy-primary sm:text-3xl">Nhớ từ bằng khoảnh khắc.</h3>
                  <p className="mt-3 max-w-xl leading-7 text-copy-muted">
                    Một cú chạm để lưu từ, câu thoại và sắc thái — rồi ôn lại bằng đúng ngữ cảnh đã khiến bạn chú ý.
                  </p>
                </div>
                <BookOpenCheck aria-hidden="true" className="mt-1 hidden size-6 text-action-gold sm:block" />
              </div>

              <div className="mt-7 grid flex-1 items-center gap-5 sm:grid-cols-[1fr_0.72fr]">
                <div className="group/flash h-48 [perspective:1000px] sm:h-52">
                  <div className="relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] group-hover/flash:[transform:rotateY(180deg)] group-focus-within/flash:[transform:rotateY(180deg)] motion-reduce:transition-none motion-reduce:group-hover/flash:[transform:none]">
                    <div className="absolute inset-0 flex flex-col justify-between rounded-[1.5rem] border border-amber-200/15 bg-[linear-gradient(145deg,rgba(251,191,36,0.13),rgba(255,255,255,0.035))] p-5 shadow-[0_24px_50px_rgba(0,0,0,0.22)] [backface-visibility:hidden]">
                      <div className="flex items-center justify-between">
                        <span className="text-micro tracking-meta text-amber-200/65 uppercase">New phrase</span>
                        <Star aria-hidden="true" className="size-4 fill-amber-300/25 text-amber-300" />
                      </div>
                      <div>
                        <p className="text-3xl font-semibold tracking-tight text-white">take a leap</p>
                        <p className="mt-2 text-sm text-slate-400">/teɪk ə liːp/ · phrase</p>
                      </div>
                      <p className="text-xs text-amber-100/55">Di chuột để lật thẻ</p>
                    </div>

                    <div className="absolute inset-0 flex flex-col justify-between rounded-[1.5rem] border border-cyan-200/15 bg-[linear-gradient(145deg,rgba(34,211,238,0.12),rgba(255,255,255,0.035))] p-5 shadow-[0_24px_50px_rgba(0,0,0,0.22)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
                      <div className="flex items-center justify-between">
                        <span className="text-micro tracking-meta text-cyan-200/65 uppercase">In context</span>
                        <Check aria-hidden="true" className="size-4 text-cyan-200" />
                      </div>
                      <div>
                        <p className="text-lg leading-7 font-medium text-white">“Sometimes you just have to take a leap.”</p>
                        <p className="mt-3 text-sm text-cyan-100/60">Đôi khi bạn chỉ cần dám bước tới.</p>
                      </div>
                      <p className="text-xs text-slate-500">Saved from Scene 04:22</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    ["cinematic", "đậm chất điện ảnh", "bg-cyan-300"],
                    ["breakthrough", "bước đột phá", "bg-violet-300"],
                    ["effortless", "nhẹ nhàng, tự nhiên", "bg-amber-300"],
                  ].map(([word, meaning, color]) => (
                    <div
                      key={word}
                      className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.035] px-3.5 py-3 transition-colors hover:bg-white/[0.06]"
                    >
                      <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full ${color}`} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white/85">{word}</p>
                        <p className="truncate text-xs text-slate-500">{meaning}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

export function MethodSection() {
  return (
    <section id="method" aria-labelledby="method-title" className="relative scroll-mt-24 overflow-hidden py-28 sm:py-36">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-brand-cyan/15 to-transparent"
      />
      <div aria-hidden="true" className="absolute top-20 -left-28 size-80 rounded-full bg-accent-violet/[0.08] blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="max-w-3xl">
          <SectionEyebrow>Learn in context</SectionEyebrow>
          <h2 id="method-title" className="text-4xl font-semibold tracking-heading text-copy-primary sm:text-5xl lg:text-6xl">
            Một nhịp học tự nhiên như
            <span className="text-brand-cyan"> chính bộ phim bạn yêu thích.</span>
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-8 text-copy-muted sm:text-lg">
            Không học thuộc những câu rời rạc. EngFlex đưa bạn đi từ khoảnh khắc nghe thấy đến lúc có thể tự tin nói lại.
          </p>
        </div>

        <div className="relative mt-16 lg:mt-20">
          <div
            aria-hidden="true"
            className="absolute top-7 right-[16.7%] left-[16.7%] hidden h-px overflow-hidden bg-stroke lg:block"
          >
            <span className="block h-full w-2/3 bg-gradient-to-r from-brand-cyan via-action-gold to-accent-violet shadow-[0_0_18px_var(--engflex-brand-cyan)] motion-safe:animate-pulse" />
          </div>

          <ol className="grid gap-5 lg:grid-cols-3">
            {methodSteps.map((step) => {
              const Icon = step.icon;
              const tone =
                step.color === "cyan"
                  ? "border-brand-cyan/25 bg-brand-cyan/10 text-brand-cyan"
                  : step.color === "gold"
                    ? "border-action-gold/25 bg-action-gold/10 text-action-gold"
                    : "border-accent-violet/25 bg-accent-violet/10 text-accent-violet";

              return (
                <li key={step.number} className="group relative">
                  <div className="relative mb-6 flex items-center lg:justify-center">
                    <div className={`relative z-10 flex size-14 items-center justify-center rounded-2xl border ${tone} shadow-card transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-3 motion-reduce:transition-none`}>
                      <Icon aria-hidden="true" className="size-5" />
                    </div>
                    <span className="ml-4 text-xs tracking-meta text-copy-muted lg:hidden">STEP {step.number}</span>
                  </div>

                  <article className="h-full rounded-[1.75rem] border border-stroke bg-surface-panel p-6 shadow-[inset_0_1px_0_var(--engflex-border-subtle)] backdrop-blur-sm transition-[background-color,border-color,transform] duration-500 hover:-translate-y-1 hover:border-stroke-strong hover:bg-surface-inner motion-reduce:transition-none sm:p-7">
                    <div className="flex items-center justify-between">
                      <span className="text-micro font-semibold tracking-meta text-brand-cyan">{step.eyebrow}</span>
                      <span className="hidden text-xs text-copy-subtle lg:block">{step.number}</span>
                    </div>
                    <h3 className="mt-7 text-xl font-semibold tracking-tight text-copy-primary sm:text-2xl">{step.title}</h3>
                    <p className="mt-4 leading-7 text-copy-muted">{step.description}</p>
                  </article>
                </li>
              );
            })}
          </ol>

          <div aria-hidden="true" className="pointer-events-none absolute -top-20 right-8 hidden xl:block">
            <div className="rotate-6 rounded-xl border border-brand-cyan/20 bg-surface-glass px-4 py-3 shadow-card motion-safe:animate-pulse [animation-duration:4s]">
              <p className="text-sm font-semibold text-copy-primary">serendipity</p>
              <p className="mt-0.5 text-micro text-brand-cyan">a lucky discovery</p>
            </div>
          </div>
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 left-10 hidden -rotate-6 xl:block">
            <div className="rounded-xl border border-action-gold/20 bg-surface-glass px-4 py-3 shadow-card motion-safe:animate-pulse [animation-delay:1.2s] [animation-duration:5s]">
              <p className="text-sm font-semibold text-copy-primary">speak up</p>
              <p className="mt-0.5 text-micro text-action-gold">nói lên suy nghĩ</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section aria-labelledby="final-cta-title" className="relative px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.25rem] border border-brand-cyan/20 bg-surface-panel shadow-modal">
        <div aria-hidden="true" className="absolute -top-28 -left-16 size-80 rounded-full bg-brand-cyan/15 blur-[90px]" />
        <div aria-hidden="true" className="absolute -right-16 -bottom-32 size-96 rounded-full bg-action-gold/15 blur-[100px]" />
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-30 [background-image:radial-gradient(var(--engflex-border-strong)_1px,transparent_1px)] [background-size:28px_28px]"
        />

        <div className="relative grid items-center gap-8 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-[1.15fr_0.85fr] lg:px-16 lg:py-16">
          <div className="relative z-10 max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-action-gold/20 bg-action-gold/10 px-3.5 py-2 text-micro tracking-meta text-action-gold uppercase">
              <Star aria-hidden="true" className="size-3.5 fill-action-gold/25" />
              Your next scene starts here
            </div>
            <h2 id="final-cta-title" className="text-4xl font-semibold tracking-heading text-copy-primary sm:text-5xl lg:text-6xl">
              Đừng chỉ hiểu câu thoại.
              <span className="block bg-gradient-to-r from-brand-cyan via-accent-violet to-action-gold bg-clip-text text-transparent">
                Hãy biến nó thành phản xạ.
              </span>
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-copy-muted sm:text-lg">
              Chọn một chủ đề bạn thích, bước vào cảnh phim đầu tiên và cảm nhận tiếng Anh trở nên sống động hơn từng phút.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/topics"
                className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-action-gold-fill px-6 py-3 text-sm font-semibold text-action-foreground shadow-card transition-[transform,box-shadow,background-color] duration-300 hover:-translate-y-0.5 hover:bg-action-gold-fill/85 hover:shadow-modal focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus motion-reduce:transition-none"
              >
                Khám phá bài học
                <ArrowRight aria-hidden="true" className="size-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none" />
              </Link>
              <Link
                href="/vocabulary"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-stroke-strong bg-surface-inner px-6 py-3 text-sm font-medium text-copy-primary backdrop-blur-md transition-[transform,background-color,border-color] duration-300 hover:-translate-y-0.5 hover:border-brand-cyan/30 hover:bg-surface-glass focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus motion-reduce:transition-none"
              >
                <BookOpenCheck aria-hidden="true" className="size-4 text-action-gold" />
                Mở kho từ vựng
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[23rem] lg:mr-0">
            <div aria-hidden="true" className="absolute inset-6 rounded-full bg-brand-cyan/20 blur-3xl motion-safe:animate-pulse" />
            <div className="relative rotate-2 overflow-hidden rounded-[2rem] border border-white/10 bg-[#10254a] p-2 shadow-[0_35px_80px_rgba(0,0,0,0.4)] transition-transform duration-700 hover:rotate-0 hover:scale-[1.02] motion-reduce:transition-none">
              <Image
                src="/owl_writing_white.png"
                alt=""
                width={1024}
                height={1024}
                aria-hidden="true"
                sizes="(max-width: 1024px) 80vw, 368px"
                className="h-auto w-full rounded-[1.55rem] object-cover dark:hidden"
              />
              <Image
                src="/owl-writing-cinematic.webp"
                alt=""
                width={1024}
                height={1024}
                aria-hidden="true"
                sizes="(max-width: 1024px) 80vw, 368px"
                className="hidden h-auto w-full rounded-[1.55rem] object-cover dark:block"
              />
            </div>
            <div className="absolute -bottom-4 -left-5 flex items-center gap-2 rounded-xl border border-emerald-200/15 bg-[#0a1c27]/90 px-3.5 py-2.5 text-xs text-emerald-100 shadow-xl backdrop-blur-xl motion-safe:animate-pulse [animation-duration:3s]">
              <CheckCircle2 aria-hidden="true" className="size-4 text-emerald-300" />
              Ready to speak
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LandingFooter() {
  return (
    <footer className="relative border-t border-stroke-subtle bg-canvas-deep">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <Link
            href="/"
            aria-label="EngFlex - Trang chủ"
            className="group inline-flex w-fit items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
          >
            <span className="flex size-10 items-center justify-center rounded-xl border border-brand-cyan/20 bg-gradient-to-br from-brand-cyan/20 to-accent-violet/15 text-brand-cyan shadow-[0_0_24px_var(--engflex-cyan-tint)] transition-transform duration-300 group-hover:-rotate-6 motion-reduce:transition-none">
              <Clapperboard aria-hidden="true" className="size-5" />
            </span>
            <span>
              <span className="block text-lg font-semibold tracking-tight text-copy-primary">EngFlex</span>
              <span className="block text-micro tracking-meta text-brand-cyan uppercase">English in motion</span>
            </span>
          </Link>

          <nav aria-label="Liên kết cuối trang">
            <ul className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-copy-muted">
              <li>
                <a className="transition-colors hover:text-brand-cyan focus-visible:text-brand-cyan focus-visible:outline-none" href="#features">
                  Tính năng
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-brand-cyan focus-visible:text-brand-cyan focus-visible:outline-none" href="#method">
                  Phương pháp
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-brand-cyan focus-visible:text-brand-cyan focus-visible:outline-none" href="#experience">
                  Trải nghiệm
                </a>
              </li>
              <li>
                <Link className="transition-colors hover:text-brand-cyan focus-visible:text-brand-cyan focus-visible:outline-none" href="/topics">
                  Chủ đề
                </Link>
              </li>
              <li>
                <Link className="transition-colors hover:text-brand-cyan focus-visible:text-brand-cyan focus-visible:outline-none" href="/vocabulary">
                  Từ vựng
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-9 flex flex-col gap-3 border-t border-stroke-subtle pt-6 text-xs text-copy-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© EngFlex. Học tiếng Anh qua những câu chuyện đáng nhớ.</p>
          <p className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-status-success shadow-[0_0_8px_var(--engflex-status-success)]" />
            Ready for your next scene
          </p>
        </div>
      </div>
    </footer>
  );
}
