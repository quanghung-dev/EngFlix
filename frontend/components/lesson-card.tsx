import Image from "next/image"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { LessonType } from "@/types/lesson"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
export function LessonCard({ lesson, onClick }: { lesson?: LessonType; onClick?: () => void }) {
    return (
        <Card onClick={onClick} className="group p-0 w-full max-w-sm gap-2 hover:cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <AspectRatio ratio={16 / 9} className="w-full rounded-t-xl bg-muted relative overflow-hidden">
                <Image
                    src={lesson?.thumbnail_url || "/zootopia.jpg"}
                    alt={lesson?.title || "Zootopia"}
                    fill
                    sizes="(max-width: 768px) 100vw, 384px"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <Badge className="absolute top-3 left-3 z-10 bg-secondary text-secondary-foreground text-sm h-fit py-1 px-2.5">
                    Pro
                </Badge>
                <Badge className="absolute bottom-3 right-3 z-10 bg-secondary text-secondary-foreground text-sm h-fit py-1 px-2.5">
                    {lesson?.duration ? formatDuration(lesson.duration) : "1:32:21"}
                </Badge>
            </AspectRatio>
            <div className="flex flex-col gap-0 px-3 pb-3">
                <CardTitle className="pb-0 text-xl font-semibold mb-2 line-clamp-2 min-h-[3.5rem]">{lesson?.title || "Zootopia"}</CardTitle>
                <div className="flex flex-col gap-0">
                    <div className="flex justify-between">
                        <Badge variant="secondary" className="text-base h-fit py-1 px-2.5">Dictation</Badge>
                        <Badge variant="secondary" className="text-base h-fit py-1 px-2.5">Shadowing</Badge>
                    </div>

                </div>
            </div>

        </Card >
    )
}

function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}