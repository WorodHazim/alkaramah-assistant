
export const CURRENT_USER = {
    name: "Ms. Sarah",
    role: "Teacher",
    avatar: "MS",
}

export const STUDENTS = [
    {
        id: "1",
        name: "Ahmed Al-Mansouri",
        age: 8,
        diagnosis: "Autism Support",
        supportLevel: "Medium",
        communicationLevel: "verbal",
        preferredLearning: "visual",
        interests: ["Cars", "Colors", "Puzzles"],
        status: "Present",
        avatar: "AA",
        program: "Autism Support"
    },
    {
        id: "2",
        name: "Layla Hassan",
        age: 7,
        diagnosis: "Speech Therapy",
        supportLevel: "Medium",
        communicationLevel: "limited",
        preferredLearning: "hands-on",
        interests: ["Animals", "Drawing"],
        status: "Present",
        avatar: "LH",
        program: "Speech Therapy"
    },
]

export const PENDING_PLANS = [
    { id: "1", studentId: "1", studentName: "Ahmed Al-Mansouri", goal: "Improve eye contact during circle time", status: "Pending Review" },
    { id: "2", studentId: "2", studentName: "Layla Hassan", goal: "Complete 3-step instructions independently", status: "Pending Review" },
    { id: "3", studentId: "4", studentName: "Sarah Smith", goal: "Social interaction with peers during break", status: "Draft" },
]

export const ALERTS = [
    { id: "1", title: "Incident Report: Zayed", detail: "Behavioral outburst during art class", severity: "high", time: "10:30 AM" },
    { id: "2", title: "Missing Documentation", detail: "Weekly progress report for Layla pending", severity: "medium", time: "09:00 AM" },
]

import { LogEntry, IEPGoal, Evidence } from "@/lib/ai-analyst"

export const SCHEDULE = [
    { id: "1", time: "08:00 AM", student: "Group A", activity: "Circle Time" },
    { id: "2", time: "09:00 AM", student: "Ahmed Al-Mansouri", activity: "One-on-One: Math" },
    { id: "3", time: "10:00 AM", student: "Layla Hassan", activity: "Speech Therapy Session" },
]

export const IEP_GOALS = [
    { id: "g1", category: "Communication", objective: "Request help via PECS", studentId: "1" },
    { id: "g2", category: "Independence", objective: "Matching Colors - Level 1", studentId: "1" },
    { id: "g3", category: "Social Interaction", objective: "Turn taking in play", studentId: "1" },
    { id: "g4", category: "Communication", objective: "Identify facial expressions", studentId: "2" },
    { id: "g5", category: "Social Interaction", objective: "Waiting for 2 minutes", studentId: "2" },
]

export const IEP_PLANS: IEPGoal[] = [
    {
        id: "iep1",
        studentId: "1",
        category: "Independence",
        goalTitle: "Matching Colors - Level 1",
        objectiveSteps: ["Identify red/blue", "Match identical blocks", "Sort 5 items"],
        level: "Beginner",
        mastery: 85,
        status: "Active",
        version: 1,
        lastUpdatedAt: "2026-02-01T08:00:00Z",
        lastUpdatedBy: "Ms. Sarah"
    },
    {
        id: "iep2",
        studentId: "1",
        category: "Communication",
        goalTitle: "Request help via PECS",
        objectiveSteps: ["Pick up picture", "Reach and release", "Discriminate icons"],
        level: "Beginner",
        mastery: 40,
        status: "Paused",
        version: 1,
        lastUpdatedAt: "2026-02-01T08:00:00Z",
        lastUpdatedBy: "Ms. Sarah"
    },
    {
        id: "iep3",
        studentId: "1",
        category: "Social Interaction",
        goalTitle: "Turn taking in play",
        objectiveSteps: ["Sit for 5 mins", "Wait for turn", "Share toy"],
        level: "Beginner",
        mastery: 20,
        status: "Draft Pending Approval",
        version: 2,
        lastUpdatedAt: "2026-02-10T14:00:00Z",
        lastUpdatedBy: "Ms. Sarah"
    }
]

export const MOCK_LOGS: LogEntry[] = [
    {
        id: "l1",
        studentId: "1",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        aetCode: "2.1",
        aetDomain: "Academic",
        learningIntention: "Request help independently",
        domains: ["Academic"],
        objectiveText: "Matching Colors - Level 1",
        outcome: "Achieved",
        difficulty: "Easy",
        engagementLevel: "High",
        prompts: ["None"],
        teacherComment: "Completed 10/10 trials independently. High interest in blue blocks."
    },
    {
        id: "l2",
        studentId: "1",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // Yesterday
        aetCode: "1.2",
        aetDomain: "Social Interaction",
        learningIntention: "Maintain joint attention during game",
        domains: ["Social Skills" as any],
        objectiveText: "Turn taking in play",
        outcome: "Partial",
        difficulty: "Hard",
        engagementLevel: "Low",
        prompts: ["Verbal", "Gestural"],
        teacherComment: "Difficulty sitting still for more than 5 minutes. Required sensory break."
    },
    {
        id: "l3",
        studentId: "1",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
        aetCode: "3.1",
        aetDomain: "Communication",
        learningIntention: "Identify primary colors",
        domains: ["Communication"],
        objectiveText: "Request help via PECS",
        outcome: "Achieved",
        difficulty: "Medium",
        engagementLevel: "Medium",
        prompts: ["Visual"],
        teacherComment: "Initiated 3 requests for water and breaks using picture icons."
    },
    {
        id: "l4",
        studentId: "1",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
        aetCode: "2.1",
        aetDomain: "Academic",
        learningIntention: "Match identical objects",
        domains: ["Academic"],
        objectiveText: "Matching Colors - Level 1",
        outcome: "Partial",
        difficulty: "Medium",
        engagementLevel: "High",
        prompts: ["Verbal"],
        teacherComment: "Very engaged but confused yellow and green blocks today."
    }
]

import { ProgressReport } from "@/lib/report-generator"

export const MOCK_REPORTS: ProgressReport[] = [
    {
        id: "rep-1",
        title: "Weekly Progress Report - Ahmed Al-Mansouri",
        status: "Approved",
        overview: "Ahmed Al-Mansouri is an 8-year-old student currently enrolled in the Autism Support program. This report covers the Feb 1st - Feb 7th period.",
        summary: "Ahmed has shown significant progress in his communication goals this week. He is consistently using PECS to express basic needs.",
        strengths: ["Independent use of PECS for requesting", "Matching primary colors", "High engagement in sensory activities"],
        challenges: ["Transitioning between high-interest activities", "Waiting for turn during group games"],
        evidenceHighlights: "Ahmed successfully matched 10 blocks independently (ev1) and initiated peer contact via a picture request.",
        recommendations: "Continue using visual schedules for all transitions. Introduce Level 2 matching tasks.",
        nextFocus: ["Wait for 2 minutes independently", "Match 5 distinct colors"],
        dataSources: {
            logsUsed: 5,
            evidenceUsed: 2,
            goalsRef: 3
        },
        generatedAt: "2026-02-07T14:00:00Z"
    },
    {
        id: "rep-2",
        title: "Term 1 Interim Report - Ahmed Al-Mansouri",
        status: "Edited",
        overview: "Ahmed has reached several key milestones in his Academic and Communication domains during the first half of Term 1.",
        summary: "General stability observed in behavioral responses. Academic mastery is at 80% for current level objectives.",
        strengths: ["Visual memory", "Routine following"],
        challenges: ["Auditory processing", "Large group social participation"],
        evidenceHighlights: "Fine motor координация report (ev4) shows improvement in utensil grip.",
        recommendations: "Introduce more auditory-visual combined instructions.",
        nextFocus: ["Increase peer engagement", "Fine motor precision"],
        dataSources: {
            logsUsed: 20,
            evidenceUsed: 8,
            goalsRef: 5
        },
        generatedAt: "2026-01-15T09:00:00Z"
    }
]

export const MOCK_EVIDENCE: Evidence[] = [
    {
        id: "ev1",
        studentId: "1",
        type: "photo",
        description: "Ahmed successfully matching red and blue blocks during morning session.",
        linkedCategory: "Academic",
        linkedGoalId: "iep1",
        linkedObjective: "Match identical blocks",
        date: "2026-02-11T10:00:00Z",
        addedBy: "Ms. Sarah",
        tags: ["Block Play", "Independent"]
    },
    {
        id: "ev2",
        studentId: "1",
        type: "video",
        description: "First successful peer interaction during sandbox play. Ahmed initiated contact.",
        linkedCategory: "Social Skills",
        linkedGoalId: "iep3",
        linkedObjective: "Wait for turn",
        date: "2026-02-10T11:30:00Z",
        addedBy: "Ms. Sarah",
        tags: ["Social Interaction", "Initiation"]
    },
    {
        id: "ev3",
        studentId: "1",
        type: "note",
        description: "Observed significant improvement in focus duration when using sensory weighted vest.",
        linkedCategory: "Life Skills",
        date: "2026-02-09T09:00:00Z",
        addedBy: "Ms. Sarah",
        tags: ["Sensory Support", "Focus"]
    },
    {
        id: "ev4",
        studentId: "1",
        type: "file",
        description: "Assessment report on fine motor coordination and utensil use during lunch.",
        linkedCategory: "Life Skills",
        date: "2026-02-08T13:00:00Z",
        addedBy: "Mr. James",
        tags: ["Fine Motor", "Assessment"]
    },
    {
        id: "ev5",
        studentId: "1",
        type: "photo",
        description: "Ahmed using PECS independently to request 'water' during gym class.",
        linkedCategory: "Communication",
        linkedGoalId: "iep2",
        linkedObjective: "Discriminate icons",
        date: "2026-02-07T10:30:00Z",
        addedBy: "Ms. Sarah",
        tags: ["PECS", "Gym"]
    },
    {
        id: "ev6",
        studentId: "1",
        type: "note",
        description: "Positive response to the new visual schedule for morning transitions.",
        linkedCategory: "Social Skills",
        date: "2026-02-06T08:45:00Z",
        addedBy: "Ms. Sarah",
        tags: ["Visual Schedule", "Transitions"]
    },
    {
        id: "ev7",
        studentId: "1",
        type: "video",
        description: "Speech session: Ahmed attempting multi-syllabic words with visual prompts.",
        linkedCategory: "Communication",
        date: "2026-02-05T14:15:00Z",
        addedBy: "Ms. Amara",
        tags: ["Speech", "Phonetics"]
    },
    {
        id: "ev8",
        studentId: "1",
        type: "photo",
        description: "Completed number matching activity (1-5) with minimal prompting.",
        linkedCategory: "Academic",
        linkedGoalId: "iep1",
        linkedObjective: "Sort 5 items",
        date: "2026-02-04T11:00:00Z",
        addedBy: "Ms. Sarah",
        tags: ["Numbers", "Math"]
    },
    {
        id: "ev9",
        studentId: "1",
        type: "file",
        description: "Behavioral observation log for week 5. Focus on transition readiness.",
        linkedCategory: "Social Skills",
        date: "2026-02-03T16:00:00Z",
        addedBy: "Mr. James",
        tags: ["Behavior", "Log"]
    },
    {
        id: "ev10",
        studentId: "1",
        type: "note",
        description: "Great engagement during the UAE National Day prep. High interest in flags.",
        linkedCategory: "Academic",
        date: "2026-02-02T10:00:00Z",
        addedBy: "Ms. Sarah",
        tags: ["Cultural", "Group Work"]
    }
]
