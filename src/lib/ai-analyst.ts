// AET Framework Taxonomy
export const AET_TAXONOMY = {
    'Social Understanding': {
        'Making Requests': { code: '2.1', description: 'Student is able to initiate a request for a desired item or activity.' },
        'Joint Attention': { code: '1.2', description: 'Student is able to share focus on an object with a partner.' },
        'Social Initiation': { code: '1.1', description: 'Student initiates a social interaction with a peer or adult.' }
    },
    'Communication': {
        'Expressive Language': { code: '3.1', description: 'Student uses words or symbols to communicate needs.' },
        'Receptive Language': { code: '4.2', description: 'Student follows multi-step oral instructions.' }
    }
};

export interface StudentProfile {
    id: string;
    name: string;
    age: number;
    diagnosis: string;
    avatar?: string;
    supportLevel: 'Low' | 'Medium' | 'High';
    communicationLevel: 'non-verbal' | 'limited' | 'verbal';
    preferredLearning: 'visual' | 'hands-on' | 'auditory' | 'routine';
    interests: string[];
}

export interface Evidence {
    id: string;
    studentId: string;
    type: 'photo' | 'note' | 'video' | 'file';
    fileUrl?: string;
    description: string;
    linkedCategory: 'Communication' | 'Social Skills' | 'Academic' | 'Life Skills';
    linkedGoalId?: string;
    linkedObjective?: string;
    linkedLogId?: string;
    date: string;
    addedBy: string;
    tags: string[];
}

export interface EvidenceAnalysis {
    strengthDetected: string;
    challengeDetected: string;
    suggestion: string;
    suggestedStrategy: string[];
    linkedAEReference: string;
    explainability: string;
}

export interface IEPSuggestion {
    objective: string;
    recommendation: 'Advance' | 'Simplify' | 'Maintain';
    reasoning: string;
    suggestedAction: string;
}

export interface LogEntry {
    id: string;
    studentId: string;
    createdAt: string;
    aetDomain: string;
    aetCode: string;
    learningIntention: string;
    objectiveText: string;
    outcome: 'Achieved' | 'Partial' | 'Not Achieved';
    difficulty: 'Easy' | 'Medium' | 'Hard';
    engagementLevel: 'Low' | 'Medium' | 'High';
    prompts: ('None' | 'Gestural' | 'Verbal' | 'Physical' | 'Visual')[];
    domains: string[];
    teacherComment: string;
}

export interface AIAnalysis {
    insight: string;
    tomorrowPlan: string;
    adjustment: string;
    suggestedPlan?: LearningPlan;
    aetMapping?: string;
    strengths: string[];
    challenges: string[];
    regressionAlerts: string[];
    dailySummary: string;
}

export interface LearningPlan {
    id?: string;
    studentId: string;
    date: string;
    generatedPlan: string;
    status: 'pending' | 'approved' | 'edited';
    teacherEdit?: string;
    approvedBy?: string;
    approvedAt?: string;
    // For UI compatibility
    isApproved: boolean;
    formattedParagraph: string;
    objective: string;
    aetCode?: string;
}

export interface Worksheet {
    studentName: string;
    objective: string;
    aetCode: string;
    visualSteps: string[];
    instructions: string;
    culturalContext: string;
    ageAppropriate: boolean;
}

export function analyzeLog(log: LogEntry, student: StudentProfile): AIAnalysis {
    let insight = "";
    let tomorrowPlan = "";
    let adjustment = "";
    let aetMapping = `${log.aetDomain} → ${log.aetCode}`;

    const isHighEngagement = log.engagementLevel === 'High';
    const isLowEngagement = log.engagementLevel === 'Low';

    // Personalization based on student profile
    const learningStyleHint = student.preferredLearning === 'visual'
        ? "incorporating high-contrast visual cues"
        : student.preferredLearning === 'hands-on'
            ? "using textured manipulatives"
            : "following a strict sequential routine";

    if (log.outcome === 'Achieved' && log.difficulty === 'Easy') {
        insight = `Strength Detected: ${student.name} showed high mastery with "${log.objectiveText}". ${isHighEngagement ? 'High engagement' : 'Steady focus'} suggests this target is well-regulated.`;
        tomorrowPlan = `Suggest moving to the next level of "${log.objectiveText}" to maintain momentum, ${learningStyleHint}.`;
        adjustment = "Accelerate objective pace.";
    } else if (log.outcome === 'Partial' || log.difficulty === 'Hard') {
        insight = `Challenge Zone: While some progress was made on "${log.objectiveText}", the "Hard" difficulty rating indicates significant cognitive load.`;
        tomorrowPlan = `Repeat "${log.objectiveText}" tomorrow but simplify the task by ${learningStyleHint}.`;
        adjustment = "Maintain current objective; increase support intensity.";
    } else if (log.outcome === 'Not Achieved') {
        insight = `Significant Challenge: ${student.name} struggled with "${log.objectiveText}". The teacher's note says: "${log.teacherComment}".`;
        tomorrowPlan = `Break the objective into smaller steps focusing on "Ready to Learn" behaviors, ${learningStyleHint}.`;
        adjustment = "Deconstruct objective into 3 sub-tasks.";
    } else {
        insight = `Steady progress in "${log.objectiveText}". ${student.name} is responding well.`;
        tomorrowPlan = `Continue current plan with minor variations, ${learningStyleHint}.`;
        adjustment = "None needed.";
    }

    return {
        insight,
        tomorrowPlan,
        adjustment,
        suggestedPlan: generateTomorrowPlan(log, student),
        aetMapping,
        strengths: [log.outcome === 'Achieved' ? `${log.objectiveText} mastery` : "Persistent effort"],
        challenges: [log.outcome !== 'Achieved' ? `Difficulty with ${log.objectiveText}` : "Needs more independence"],
        regressionAlerts: log.outcome === 'Not Achieved' ? ["Performance drop detected - objective may need simplification"] : [],
        dailySummary: `${student.name} worked on ${log.objectiveText}. ${insight}`
    };
}

export function generateTomorrowPlan(log: LogEntry, student: StudentProfile): LearningPlan {
    let objective = log.objectiveText;
    let generatedPlan = "";
    let formattedParagraph = "";

    const uaeContext = `incorporating Emirati cultural elements such as Burj Khalifa symbols or Al Ain oasis visual cues (Interests: ${student.interests.join(', ')})`;

    if (log.outcome === 'Achieved') {
        objective = `Next Step for: ${log.objectiveText}`;
        generatedPlan = `Progress to the next AET objective. Increase complexity by adding more independent variables. Support with ${student.preferredLearning} cues, ${uaeContext}.`;
        formattedParagraph = `Following ${student.name}'s success with "${log.objectiveText}", we will progress to a more complex variation tomorrow. We will transition to reduced scaffolding, ${uaeContext}.`;
    } else if (log.outcome === 'Partial') {
        objective = `Scaffolded Steps for: ${log.objectiveText}`;
        generatedPlan = `Break the current objective into 3 discrete visual steps. Focus on Step 1: Initiation with high motivation. Support: ${student.preferredLearning}, ${uaeContext}.`;
        formattedParagraph = `${student.name} showed partial success. Tomorrow we break "${log.objectiveText}" into smaller steps with intensified ${student.preferredLearning} supports, ${uaeContext}.`;
    } else {
        objective = `Simplified Foundational: ${log.objectiveText}`;
        generatedPlan = `Simplify the objective to a foundational level. Reduce environmental stressors. Use ${student.interests[0] || 'visual motivators'}. Support: ${student.preferredLearning}, ${uaeContext}.`;
        formattedParagraph = `To better support ${student.name}, tomorrow's session will focus on a simplified version of the goal. We will reduce the cognitive load and use ${student.interests[0] || 'familiar motivators'}, ${uaeContext}.`;
    }

    return {
        studentId: student.id,
        date: new Date().toISOString().split('T')[0],
        generatedPlan,
        objective,
        formattedParagraph,
        status: 'pending',
        isApproved: false,
        aetCode: log.aetCode
    };
}

export function generateWorksheet(student: StudentProfile, objective: string, aetCode: string): Worksheet {
    const interest = student.interests[0] || 'colors';

    return {
        studentName: student.name,
        objective,
        aetCode,
        visualSteps: [
            `1. Look at the ${interest} indicator`,
            `2. Pick up the ${student.preferredLearning === 'hands-on' ? 'textured' : 'visual'} card`,
            `3. Place it on the task board`,
            `4. Success! (Earn a Ghaf tree sticker)`
        ],
        instructions: `Please follow the visual sequence to complete the ${objective} task. Use the ${interest}-themed tokens to mark progress.`,
        culturalContext: `Uses UAE Ghaf tree imagery and ${interest} motifs for familiarity.`,
        ageAppropriate: student.age < 12
    };
}

export function analyzeEvidence(evidence: Evidence, student: StudentProfile, logs: LogEntry[] = [], goals: IEPGoal[] = []): EvidenceAnalysis {
    const recentLogs = logs.slice(0, 3);
    const hasSuccess = recentLogs.some(l => l.outcome === 'Achieved');
    const linkedGoal = goals.find(g => g.id === evidence.linkedGoalId);

    return {
        strengthDetected: hasSuccess
            ? `Solid correlation between recent mastery and the ${evidence.type} provided.`
            : `Strong engagement with ${student.interests[0] || 'tasks'} observed in this artifact.`,
        challengeDetected: `Requires ${student.supportLevel} support level for multi-step transitions.`,
        suggestion: "Integrate AET Social Communication indicators into the next session.",
        suggestedStrategy: [
            `Use icons of ${student.interests[1] || 'UAE landmarks'} for transitions`,
            "Implement a 5-second processing wait time",
        ],
        linkedAEReference: linkedGoal
            ? `${linkedGoal.category} → ${linkedGoal.goalTitle} (AET Code: 1.1)`
            : "Social Understanding → Social Interaction → 1.1",
        explainability: `Why: Synthesized from ${evidence.type} artifact and your last ${logs.length} logs for ${student.name}.`
    }
}

// Keep other functions but ensure they align with the new types if needed
export function analyzeEvidenceBatch(evidenceList: Evidence[], logs: LogEntry[], goals: IEPGoal[]): EvidenceAnalysis {
    const categories = Array.from(new Set(evidenceList.map(e => e.linkedCategory)));
    return {
        strengthDetected: "Consistent progress in non-verbal communication and engagement during structured tasks.",
        challengeDetected: "Social initiation remains low in unstructured group settings.",
        suggestion: "Implement a 'peer-buddy' system during transition times.",
        suggestedStrategy: [
            "Create a visual choice board for break sessions",
            "Increase focus on 'Turn Taking' goals in IEP",
            "Introduce sensory-based reinforcement after successful social interactions"
        ],
        linkedAEReference: "Reference AET: Social Interaction & Play - Level 2",
        explainability: `Why: based on ${evidenceList.length} evidence entries across ${categories.join(', ')} and performance in the last ${logs.length} daily logs.`
    }
}

export function generateGoalSuggestions(category: string, studentName: string): Partial<IEPGoal>[] {
    return [
        {
            goalTitle: `Advanced ${category} Interaction`,
            objectiveSteps: ["Initiate request", "Maintain focus for 5 mins", "Generalized response"],
            level: 'Intermediate',
            mastery: 0
        },
        {
            goalTitle: `Foundational ${category} Skills`,
            objectiveSteps: ["Observe peer behavior", "Copy simple action", "Respond to prompt"],
            level: 'Beginner',
            mastery: 0
        }
    ];
}

export function breakDownGoal(title: string): string[] {
    if (title.toLowerCase().includes("matching")) {
        return ["Identify common properties", "Group similar items", "Match 1:1 with distractor", "Sort into categories"];
    }
    return [
        "Phase 1: Observation and readiness",
        "Phase 2: Execution with verbal coaching",
        "Phase 3: Independent practice",
        "Phase 4: Generalization to new environment"
    ];
}

export function suggestObjectiveChange(objective: string, mastery: number, trend: 'Improving' | 'Stable' | 'Declining'): IEPSuggestion {
    if (mastery >= 85 && trend !== 'Declining') {
        return {
            objective,
            recommendation: 'Advance',
            reasoning: `Student has achieved ${mastery}% mastery with a ${trend.toLowerCase()} trend.`,
            suggestedAction: "Transition to Level 2 (Independent Execution)"
        };
    } else if (mastery < 40 && trend === 'Declining') {
        return {
            objective,
            recommendation: 'Simplify',
            reasoning: `Achievement has stalled at ${mastery}% with signs of frustration.`,
            suggestedAction: "Break down into smaller, discrete milestones."
        };
    } else {
        return {
            objective,
            recommendation: 'Maintain',
            reasoning: `Progress is consistent at ${mastery}%.`,
            suggestedAction: "Continue current support intensity."
        };
    }
}

export interface IEPGoal {
    id: string;
    studentId: string;
    category: 'Communication' | 'Social Interaction' | 'Sensory Processing' | 'Independence';
    goalTitle: string;
    learningIntention?: string;
    aetCode?: string;
    objectiveSteps: string[];
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    mastery: number;
    status: 'Active' | 'Paused' | 'Achieved' | 'Draft' | 'Draft Pending Approval' | 'Approved' | 'Rejected' | 'Needs Changes';
    version: number;
    lastUpdatedAt: string;
    lastUpdatedBy: string;
    approval?: {
        requestedAt?: string;
        reviewer?: string;
        reviewedAt?: string;
        decision?: 'Approve' | 'Reject' | 'Request Changes';
        comment?: string;
    };
}
