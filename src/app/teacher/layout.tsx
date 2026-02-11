
import { Sidebar } from "@/components/layout/Sidebar"
import { TopBar } from "@/components/layout/TopBar"

export default function TeacherLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen bg-slate-50">
            <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-[80]">
                <Sidebar />
            </div>
            <div className="flex flex-1 flex-col md:pl-64">
                <TopBar />
                <main className="flex-1 overflow-y-auto bg-subtle-gradient">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
