import { Card } from "./ui/card";
import { buttonVariants } from "./ui/button";
import { CardTitle } from "./ui/card";
import { CategoryType } from "@/types/category";
import Link from "next/link";

export function CategoryCard({ category }: { category: CategoryType }) {
    return (
        <div className="flex flex-col gap-4">
            <Card className="p-3">
                <div className="flex justify-between items-center">
                    <div className="p-2 flex-1 min-w-0">
                        <CardTitle className="text-2xl font-semibold">{category.name}</CardTitle>
                    </div>
                    <Link 
                        href={`/topics/${category.id}`} 
                        className={buttonVariants({ variant: "secondary", className: "rounded-full mr-4 flex-shrink-0" })}
                    >
                        Xem tất cả
                    </Link>
                </div>
            </Card>
        </div>
    )
}
