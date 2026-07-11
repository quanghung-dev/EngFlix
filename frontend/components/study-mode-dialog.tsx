import Image from "next/image"
import { BookOpenIcon, MicIcon, PencilLineIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface StudyModeDialogProps {
  open: boolean
  lessonTitle?: string
  onOpenChange: (open: boolean) => void
  onSelectMode: (mode: "dictation" | "shadowing") => void
}

export function StudyModeDialog({
  open,
  lessonTitle,
  onOpenChange,
  onSelectMode,
}: StudyModeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto rounded-panel border border-stroke bg-canvas-deep p-6 text-white shadow-modal sm:max-w-[720px] sm:rounded-feature sm:p-8">
        <DialogHeader className="pr-12">
          <p className="font-mono text-[11px] font-semibold tracking-[0.18em] text-brand-cyan uppercase">
            Bắt đầu luyện tập
          </p>
          <DialogTitle className="text-2xl leading-tight font-semibold tracking-tight text-white sm:text-3xl">
            Chọn chế độ học
          </DialogTitle>
          <DialogDescription className="max-w-xl text-sm leading-6 text-copy-muted sm:text-base sm:leading-7">
            {lessonTitle
              ? `Bạn muốn luyện “${lessonTitle}” theo cách nào?`
              : "Chọn cách luyện phù hợp với mục tiêu của bạn."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2 md:gap-5">
          <ModeOption
            mode="dictation"
            title="Nghe và viết chính tả"
            description="Nghe từng câu, điền lại nội dung và kiểm tra độ chính xác."
            image="/owl-writing-cinematic.webp"
            imageAlt="Cú EngFlex đang luyện viết chính tả"
            accent="gold"
            icon={<PencilLineIcon aria-hidden="true" />}
            onSelect={onSelectMode}
          />
          <ModeOption
            mode="shadowing"
            title="Nhại giọng phát âm"
            description="Nghe, lặp lại và rèn nhịp điệu nói tự nhiên theo nhân vật."
            image="/owl-speaking-cinematic.webp"
            imageAlt="Cú EngFlex đang luyện nói"
            accent="violet"
            icon={<MicIcon aria-hidden="true" />}
            onSelect={onSelectMode}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ModeOption({
  mode,
  title,
  description,
  image,
  imageAlt,
  accent,
  icon,
  onSelect,
}: {
  mode: "dictation" | "shadowing"
  title: string
  description: string
  image: string
  imageAlt: string
  accent: "gold" | "violet"
  icon: React.ReactNode
  onSelect: (mode: "dictation" | "shadowing") => void
}) {
  const isGold = accent === "gold"

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={() => onSelect(mode)}
      className={`product-focus group h-auto min-h-72 w-full flex-col items-stretch justify-between overflow-hidden rounded-card border bg-surface-inner p-6 text-left whitespace-normal shadow-none transition duration-300 hover:-translate-y-1 hover:bg-surface-inner motion-reduce:transform-none ${
        isGold
          ? "border-action-gold/20 hover:border-action-gold/40"
          : "border-accent-violet/20 hover:border-accent-violet/40"
      }`}
    >
      <span className="flex items-center justify-between gap-3">
        <Badge variant={isGold ? "attention" : "support"}>
          {isGold ? "LUYỆN NGHE" : "LUYỆN NÓI"}
        </Badge>
        <BookOpenIcon
          className={isGold ? "text-action-gold" : "text-accent-violet"}
          aria-hidden="true"
        />
      </span>

      <span className="my-4 flex justify-center">
        <Image
          src={image}
          alt={imageAlt}
          width={144}
          height={144}
          className="size-36 rounded-panel object-contain transition-transform duration-300 group-hover:scale-105 group-focus-visible:scale-105 motion-reduce:transform-none"
        />
      </span>

      <span className="flex flex-col gap-2">
        <span className="flex items-center gap-2 text-lg font-semibold text-white">
          <span
            className={isGold ? "text-action-gold" : "text-accent-violet"}
          >
            {icon}
          </span>
          {title}
        </span>
        <span className="text-sm leading-6 font-normal text-copy-muted">
          {description}
        </span>
      </span>
    </Button>
  )
}
