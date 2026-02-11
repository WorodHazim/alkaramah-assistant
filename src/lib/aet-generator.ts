/**
 * AET-Aligned AI Generation Module
 * Production-grade logic for generating learning plans and worksheets
 * aligned with the AET Progression Framework
 */

import { StudentProfile, LogEntry, LearningPlan } from './ai-analyst';

// AET Progress Scale
export type AETProgressScale = 'NYD' | 'Developing' | 'Established' | 'Generalised';

export interface AETLearningIntention {
    code: string; // e.g., "2.1"
    domain: string; // e.g., "Social Understanding"
    intentionText: string;
    stage: 'Foundation' | 'Primary' | 'Secondary';
}

export interface SensoryProfile {
    visualSupport: 'high' | 'medium' | 'low';
    auditoryTolerance: 'high' | 'medium' | 'low';
    tactilePreference: 'seeking' | 'avoiding' | 'neutral';
    environmentalNeeds: string[]; // e.g., ["quiet space", "low lighting"]
}

export interface AETLearningPlan {
    aetCode: string;
    learningIntention: string;
    activityPlan: string;
    materials: string[];
    sensoryConsiderations: string[];
    successCriteria: string[];
    teacherNotes: string;
    requiresApproval: boolean;
    culturalContext: string;
}

export interface AETWorksheet {
    aetCode: string;
    title: string;
    ageGroup: string;
    visualStructure: {
        layout: 'single-column' | 'two-column' | 'grid';
        colorScheme: 'low-arousal' | 'high-contrast';
        iconStyle: 'simple' | 'photographic';
    };
    content: {
        instructions: string[];
        steps: WorksheetStep[];
        successCriteria: string;
    };
    teacherNotes: string;
    culturalContext: string;
}

export interface WorksheetStep {
    stepNumber: number;
    instruction: string;
    visualSupport: string; // Description of icon/image
    interactionType: 'circle' | 'match' | 'trace' | 'write' | 'color';
}

/**
 * Generate AET-aligned next-day learning plan
 * Based on previous log, AET progress scale, and student profile
 */
export function generateAETLearningPlan(
    student: StudentProfile,
    previousLog: LogEntry,
    progressScale: AETProgressScale,
    sensoryProfile: SensoryProfile,
    currentIntention: AETLearningIntention
): AETLearningPlan {

    const uaeContext = `Incorporate UAE cultural elements (e.g., Burj Khalifa, dates, camels, traditional dress) for familiarity and engagement.`;

    let activityPlan = '';
    let materials: string[] = [];
    let sensoryConsiderations: string[] = [];
    let successCriteria: string[] = [];
    let learningIntention = currentIntention.intentionText;
    let aetCode = currentIntention.code;

    // RULE: NYD or Developing → Break down, do NOT advance
    if (progressScale === 'NYD' || progressScale === 'Developing') {
        learningIntention = `${currentIntention.intentionText} (Simplified Step 1)`;

        activityPlan = `Break down "${currentIntention.intentionText}" into 3 discrete steps. Focus on Step 1: Initiation with high visual support. Use ${student.preferredLearning} modality. ${uaeContext}`;

        materials = [
            'Visual schedule with numbered steps',
            'High-interest motivator from student interests',
            'Timer for structured intervals',
            'UAE cultural visual aids'
        ];

        successCriteria = [
            'Student completes Step 1 with moderate prompting',
            'Student shows engagement for 3+ minutes',
            'Student tolerates the activity environment'
        ];

        sensoryConsiderations = [
            sensoryProfile.visualSupport === 'high' ? 'Use large, clear visuals with minimal text' : 'Standard visual supports',
            sensoryProfile.auditoryTolerance === 'low' ? 'Minimize verbal instructions, use gestures' : 'Verbal prompts allowed',
            sensoryProfile.tactilePreference === 'avoiding' ? 'Avoid hand-over-hand unless necessary' : 'Tactile prompts OK',
            ...sensoryProfile.environmentalNeeds
        ];
    }

    // RULE: Established or Generalised → Progress to next AET target
    else if (progressScale === 'Established' || progressScale === 'Generalised') {
        // In production, this would query the AET taxonomy for the next logical code
        const nextCode = getNextAETCode(currentIntention.code);
        aetCode = nextCode;
        learningIntention = `Progress to AET ${nextCode}: [Next Intention]`;

        activityPlan = `Student has ${progressScale.toLowerCase()} "${currentIntention.intentionText}". Advance to the next AET target with reduced scaffolding. Introduce more independent variables. ${uaeContext}`;

        materials = [
            'Materials for next-level complexity',
            'Reduced visual supports (fading prompts)',
            'Peer interaction opportunities if applicable',
            'UAE cultural context materials'
        ];

        successCriteria = [
            'Student attempts new target with minimal prompting',
            'Student generalizes previous skill to new context',
            'Student maintains engagement for 5+ minutes'
        ];

        sensoryConsiderations = [
            'Gradually increase environmental complexity',
            'Monitor for overstimulation as demands increase',
            ...sensoryProfile.environmentalNeeds
        ];
    }

    return {
        aetCode,
        learningIntention,
        activityPlan,
        materials,
        sensoryConsiderations,
        successCriteria,
        teacherNotes: `Generated based on ${progressScale} progress on AET ${currentIntention.code}. Previous outcome: ${previousLog.outcome}. Student interests: ${student.interests.join(', ')}.`,
        requiresApproval: true,
        culturalContext: uaeContext
    };
}

/**
 * Generate AET-aligned worksheet
 * Printable, editable, culturally appropriate
 */
export function generateAETWorksheet(
    student: StudentProfile,
    aetIntention: AETLearningIntention,
    ageGroup: string
): AETWorksheet {

    const isYoung = student.age <= 7;
    const layout = isYoung ? 'single-column' : 'two-column';
    const iconStyle = student.preferredLearning === 'visual' ? 'simple' : 'photographic';

    let steps: WorksheetStep[] = [];
    let instructions: string[] = [];
    let successCriteria = '';

    // Example: AET 2.1 - Making Requests
    if (aetIntention.code === '2.1') {
        instructions = [
            'Look at the pictures below.',
            'Point to what you want.',
            'Give the picture to your teacher.'
        ];

        steps = [
            {
                stepNumber: 1,
                instruction: 'Circle the item you want',
                visualSupport: 'Simple icons: Water bottle, Dates, Toy car, Book',
                interactionType: 'circle'
            },
            {
                stepNumber: 2,
                instruction: 'Match the picture to the real object',
                visualSupport: 'Photo of real objects next to icons',
                interactionType: 'match'
            }
        ];

        successCriteria = 'Student independently selects and communicates choice using visual support.';
    }

    // Example: AET 1.2 - Joint Attention
    else if (aetIntention.code === '1.2') {
        instructions = [
            'Look at what your teacher is pointing to.',
            'Point to the same picture.',
            'Say or sign "look!"'
        ];

        steps = [
            {
                stepNumber: 1,
                instruction: 'Find the Burj Khalifa',
                visualSupport: 'Large image of Burj Khalifa among 3 UAE landmarks',
                interactionType: 'circle'
            },
            {
                stepNumber: 2,
                instruction: 'Point and share with a friend',
                visualSupport: 'Icon of two people looking at the same object',
                interactionType: 'trace'
            }
        ];

        successCriteria = 'Student shifts gaze to follow adult point and maintains focus for 3+ seconds.';
    }

    return {
        aetCode: aetIntention.code,
        title: `${aetIntention.intentionText} - Practice Sheet`,
        ageGroup,
        visualStructure: {
            layout,
            colorScheme: 'low-arousal',
            iconStyle
        },
        content: {
            instructions,
            steps,
            successCriteria
        },
        teacherNotes: `This worksheet aligns with AET ${aetIntention.code}. Use in a quiet, distraction-free environment. Provide hand-over-hand support if needed. Celebrate all attempts.`,
        culturalContext: 'Uses UAE cultural icons (Burj Khalifa, dates, traditional items) for familiarity and engagement.'
    };
}

/**
 * Helper: Get next AET code in progression
 * In production, this would query the full AET taxonomy database
 */
function getNextAETCode(currentCode: string): string {
    const codeMap: Record<string, string> = {
        '1.1': '1.2',
        '1.2': '1.3',
        '2.1': '2.2',
        '3.1': '3.2',
        '4.2': '4.3'
    };
    return codeMap[currentCode] || currentCode;
}
