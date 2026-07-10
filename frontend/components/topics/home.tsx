"use client"

import { useState, useEffect } from "react"
import { CategoryCard } from "../category-card"
import { LessonCard } from "../lesson-card"
import { StudyModeDialog } from "../study-mode-dialog"
import { CategoryType } from "@/types/category"
import { LessonType } from "@/types/lesson"
import { getAllCategories } from "@/services/category.service"
import { getLessons } from "@/services/lesson.service"

interface CategoryRowProps {
    category: CategoryType;
    onOpenDialog: () => void;
}

function CategoryRow({ category, onOpenDialog }: CategoryRowProps) {
    const [lessons, setLessons] = useState<LessonType[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadLessons() {
            try {
                const response = await getLessons({ category_id: category.id, limit: 4 })
                setLessons(response.data || [])
            } catch (error) {
                console.error("Không thể tải bài học ở client:", error)
            } finally {
                setLoading(false)
            }
        }
        loadLessons()
    }, [category.id])

    return (
        <div className="flex flex-col gap-4">
            <CategoryCard category={category} />
            {loading ? (
                <p className="text-sm text-muted-foreground text-center py-4">Đang tải bài học...</p>
            ) : lessons.length > 0 ? (
                <div className="grid lg:grid-cols-4 gap-4">
                    {lessons.map((lesson) => (
                        <LessonCard key={lesson.id} lesson={lesson} onClick={onOpenDialog} />
                    ))}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground text-center py-8">Không có bài học nào</p>
            )}
        </div>
    )
}

export function CategoryLessons() {
    const [categories, setCategories] = useState<CategoryType[]>([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    useEffect(() => {
        async function loadCategories() {
            try {
                const response = await getAllCategories();
                setCategories(response.data || []);
            } catch (error) {
                console.error("Không thể tải danh mục ở client:", error);
            }
        }
        loadCategories();
    }, []);

    const handleSelectMode = (mode: "dictation" | "shadowing") => {
        alert(`Đã chọn chế độ: ${mode === "dictation" ? "Nghe - Viết chính tả" : "Bắt chước phát âm"}`)
        setIsDialogOpen(false)
    }

    return (
        <div className="flex flex-col gap-8">
            {categories && categories.length > 0 ? (
                categories.map((cat) => (
                    <CategoryRow
                        key={cat.id}
                        category={cat}
                        onOpenDialog={() => setIsDialogOpen(true)}
                    />
                ))
            ) : (
                <p className="text-sm text-muted-foreground text-center py-8">Không có danh mục nào</p>
            )}

            <StudyModeDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onSelectMode={handleSelectMode}
            />
        </div>
    )
}
