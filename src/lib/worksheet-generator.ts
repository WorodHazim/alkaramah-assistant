
import { LearningPlan } from './ai-analyst';

export interface WorksheetInput {
    studentName: string;
    age: number;
    supportLevel: 1 | 2 | 3;
    learningStyle: 'Visual' | 'Tactile' | 'Auditory';
    objective: string;
    todayPerformance: string;
    tomorrowPlan: string;
    approvedPlan?: LearningPlan;
}

export interface VisualTask {
    type: 'match' | 'circle' | 'trace';
    instruction: string;
    items: string[];
}

export interface GeneratedWorksheet {
    title: string;
    objective: string;
    description: string;
    tasks: VisualTask[];
    teacherNotes: string;
    cultureContext: string;
}

export function generateWorksheet(input: WorksheetInput): GeneratedWorksheet {
    const isLevel1 = input.supportLevel === 1;
    const isVisual = input.learningStyle === 'Visual';

    // Use approved plan as Ground Truth if available
    const activeObjective = input.approvedPlan?.isApproved ? input.approvedPlan.objective : input.objective;

    let title = `Daily Activity: ${activeObjective}`;
    let description = `Interactive ${input.learningStyle} tasks focused on ${activeObjective.toLowerCase()}.`;
    let tasks: VisualTask[] = [];
    let teacherNotes = input.approvedPlan?.isApproved ? `FOLLOW TEACHER APPROVED STRATEGY: ${input.approvedPlan.generatedPlan}` : "";
    let cultureContext = "Includes UAE cultural icons (Burj Khalifa, Ghaf Tree) for familiar context.";

    if (input.objective.includes("Color") || input.objective.includes("Match")) {
        title = isLevel1 ? "Visual Color Discovery" : "Pattern Matching Master";
        tasks = [
            {
                type: 'match',
                instruction: isLevel1 ? "Point and match the same colors." : "Draw lines to match items by color.",
                items: ['Burj Khalifa (Blue)', 'Falcon (Brown)', 'Dates (Amber)', 'Sea (Teal)']
            },
            {
                type: 'circle',
                instruction: "Circle the item that is DIFFERENT.",
                items: ['Blue Block', 'Blue Block', 'Red Block', 'Blue Block']
            }
        ];
        teacherNotes += (teacherNotes ? " " : "") + "Use hand-over-hand support if needed for tracing lines. Praise every attempt at verbalizing the color names.";
    } else if (activeObjective.includes("Number") || activeObjective.includes("Count")) {
        title = "Counting in the UAE";
        tasks = [
            {
                type: 'trace',
                instruction: "Trace the numbers 1 to 5.",
                items: ['1', '2', '3', '4', '5']
            },
            {
                type: 'match',
                instruction: "Match the number to the group of dates.",
                items: ['1 Date', '2 Dates', '3 Dates']
            }
        ];
        teacherNotes += (teacherNotes ? " " : "") + "Encourage using a finger to point at each item while counting. Ensure the student is looking at the paper before prompted.";
    } else {
        // Default Social/Life Skills
        title = `Social Story: ${activeObjective}`;
        tasks = [
            {
                type: 'circle',
                instruction: "Circle the HAPPY face.",
                items: ['😊', '☹️', '😮']
            }
        ];
        teacherNotes += (teacherNotes ? " " : "") + "Model the social scenario using toys before starting the worksheet. Use the student's name in the social story examples.";
    }

    // Adjust for tomorrow's plan context
    if (input.tomorrowPlan.includes("break down")) {
        description += " [ADAPTED: Simplified steps based on today's struggle]";
        teacherNotes += " NOTE: This has been simplified with fewer items to reduce overwhelm.";
    }

    return {
        title,
        objective: activeObjective,
        description,
        tasks,
        teacherNotes,
        cultureContext
    };
}
