import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import LessonDetail from "@/components/topics/lessonDetail"

interface PageProps {
    params: Promise<{
        categoryId: string;
    }>;
}

export default async function Page({ params }: PageProps) {
    const { categoryId } = await params;
    const parsedId = parseInt(categoryId, 10);

    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <div className="p-5">
                    <LessonDetail categoryId={isNaN(parsedId) ? 1 : parsedId} />
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
