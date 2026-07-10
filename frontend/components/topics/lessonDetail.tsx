"use client"
import { CategoryLessons } from "./home"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { LessonType } from "@/types/lesson"
import { getLessons } from "@/services/lesson.service"
import { LessonCard } from "../lesson-card"
import { StudyModeDialog } from "../study-mode-dialog"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export default function LessonDetail({ categoryId }: { categoryId: number }) {
    const [lessons, setLessons] = useState<LessonType[]>([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const router = useRouter()

    useEffect(() => {
        async function loadLessons() {
            try {
                const response = await getLessons({ category_id: categoryId })
                setLessons(response.data || [])
            } catch (error) {
                console.error("Không thể tải bài học ở client:", error)
            }
        }
        loadLessons()
    }, [categoryId])

    const handleSelectMode = (mode: "dictation" | "shadowing") => {
        alert(`Đã chọn chế độ: ${mode === "dictation" ? "Nghe - Viết chính tả" : "Bắt chước phát âm"}`)
        setIsDialogOpen(false)
    }

    return (
        <div className="flex flex-col gap-2">
            <Button variant="ghost" className="w-fit" onClick={() => router.push("/topics")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại
            </Button>
            <div className="p-0 flex justify-between">
                <h1 className="text-3xl font-semibold">Movie short clip</h1>
                <h1>{lessons.length} bài học</h1>
            </div>
            <div className="grid grid-cols-4 p-3 gap-4">
                {lessons.map((lesson) => (
                    <LessonCard key={lesson.id} lesson={lesson} onClick={() => setIsDialogOpen(true)} />
                ))}
            </div>

            <StudyModeDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onSelectMode={handleSelectMode}
            />
        </div>
    )
}
