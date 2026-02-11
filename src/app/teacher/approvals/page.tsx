"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { CheckCircle2, XCircle, Clock, FileText, BookOpen, Calendar, Image } from "lucide-react"
import { PageHeader } from "@/components/ui/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"

interface PendingItem {
    id: string
    type: string
    studentId: string
    studentName: string
    studentAge: number
    createdAt: string
    content: any
}

export default function ApprovalsPage() {
    const [items, setItems] = useState<PendingItem[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const teacherId = 'f4a1e2b2-5678-4321-8765-abcdef123456'

    useEffect(() => {
        fetchPendingItems()
    }, [])

    const fetchPendingItems = async () => {
        try {
            const res = await fetch(`/api/approvals?teacherId=${teacherId}`)
            const data = await res.json()
            setItems(data)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const getTypeIcon = (type: string) => {
        if (type === 'plan') return <Calendar className="h-5 w-5" />
        if (type === 'worksheet') return <FileText className="h-5 w-5" />
        if (type === 'social_story') return <BookOpen className="h-5 w-5" />
        return <Image className="h-5 w-5" />
    }

    const getTypeLabel = (type: string) => {
        if (type === 'plan') return 'Daily Plan'
        if (type === 'worksheet') return 'Worksheet'
        if (type === 'social_story') return 'Social Story'
        if (type === 'visual_schedule') return 'Visual Schedule'
        return type
    }

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            <PageHeader
                title="Approvals"
                subtitle="Review and approve AI-generated materials"
                className="px-0"
            />

            {isLoading ? (
                <div className="text-center py-12 text-slate-400">Loading...</div>
            ) : items.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-slate-400">
                        <Clock className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>No pending approvals</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {items.map((item) => (
                        <Card key={item.id} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-[#EAF2F1] rounded-lg text-[#63AFA5]">
                                            {getTypeIcon(item.type)}
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">
                                                {item.content.title || getTypeLabel(item.type)}
                                            </CardTitle>
                                            <p className="text-sm text-slate-500 mt-1">
                                                {item.studentName} ({item.studentAge} years) • {new Date(item.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                                        Pending Review
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-2">
                                    <Link href={`/teacher/approvals/${item.id}?type=${item.type}`} className="flex-1">
                                        <Button className="w-full bg-[#63AFA5] hover:bg-[#4A8F86]">
                                            Review
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
