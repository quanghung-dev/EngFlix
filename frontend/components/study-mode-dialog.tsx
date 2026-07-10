import * as React from "react"
import Image from "next/image"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { PencilLine, Mic, BookOpen } from "lucide-react"

interface StudyModeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectMode?: (mode: "dictation" | "shadowing") => void
}

export function StudyModeDialog({
  open,
  onOpenChange,
  onSelectMode,
}: StudyModeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px] bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-zinc-50 p-8 rounded-3xl">
        <div className="flex flex-col items-center text-center space-y-2 mb-6">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Chọn chế độ học
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-[15px] font-medium">
            Chọn chế độ học phù hợp với bạn nhất
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* Card 1: Nghe - Viết chính tả */}
          <div
            onClick={() => onSelectMode?.("dictation")}
            className="group border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/10 rounded-3xl p-6 flex flex-col items-center justify-between min-h-[300px] cursor-pointer transition-all duration-300 relative overflow-hidden"
          >
            {/* Đang học Badge */}
            <div className="absolute top-4 right-4 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 px-2.5 py-1 text-[11px] font-bold rounded-lg flex items-center gap-1.5 shadow-xs">
              <BookOpen className="size-3.5" />
              ĐANG HỌC
            </div>

            {/* Mascot Image */}
            <div className="flex-1 flex items-center justify-center py-4 mt-4">
              <div className="relative w-36 h-36">
                <Image
                  src="/owl_writing_white.png"
                  alt="Dictation Owl"
                  fill
                  sizes="144px"
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </div>

            {/* Bottom Title */}
            <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-50 font-bold text-lg uppercase tracking-wide mt-2">
              <PencilLine className="size-5 text-zinc-500 group-hover:text-amber-500 transition-colors" />
              <span>Nghe - Viết chính tả</span>
            </div>
          </div>

          {/* Card 2: Bắt chước phát âm */}
          <div
            onClick={() => onSelectMode?.("shadowing")}
            className="group border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 rounded-3xl p-6 flex flex-col items-center justify-between min-h-[300px] cursor-pointer transition-all duration-300 relative overflow-hidden"
          >
            {/* Mascot Image */}
            <div className="flex-1 flex items-center justify-center py-4">
              <div className="relative w-36 h-36">
                <Image
                  src="/owl_speaking_white.png"
                  alt="Shadowing Owl"
                  fill
                  sizes="144px"
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </div>

            {/* Bottom Title */}
            <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-50 font-bold text-lg uppercase tracking-wide mt-2">
              <Mic className="size-5 text-zinc-500 group-hover:text-blue-500 transition-colors" />
              <span>Bắt chước phát âm</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
