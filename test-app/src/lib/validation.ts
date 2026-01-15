/**
 * API Request Validation Schemas
 * 
 * Zod schemas for runtime validation at API boundaries.
 * Per Project Context: "Use Zod for runtime validation at API boundaries"
 */

import { z } from 'zod';

/** Maximum prompt length to prevent abuse */
export const MAX_PROMPT_LENGTH = 10000;

/** Maximum context length */
export const MAX_CONTEXT_LENGTH = 20000;

/** Create project request */
export const CreateProjectSchema = z.object({
  vibeId: z.string().min(1).max(50).optional(),
});

/** Update vibe request */
export const UpdateVibeSchema = z.object({
  vibeId: z.string().min(1).max(50),
});

/** Generate component request */
export const GenerateComponentSchema = z.object({
  prompt: z.string().min(1).max(MAX_PROMPT_LENGTH),
  vibeId: z.string().min(1).max(50).optional(),
  projectId: z.string().min(1).max(50).optional(),
  context: z.string().max(MAX_CONTEXT_LENGTH).optional(),
});

/** Generate stream request */
export const GenerateStreamSchema = z.object({
  prompt: z.string().min(1).max(MAX_PROMPT_LENGTH),
  vibeId: z.string().min(1).max(50).optional(),
  context: z.string().max(MAX_CONTEXT_LENGTH).optional(),
});

/** Nudge request */
export const NudgeRequestSchema = z.object({
  prompt: z.string().min(1).max(MAX_PROMPT_LENGTH),
  vibeId: z.string().min(1).max(50).optional(),
  targetElement: z.string().min(1).max(500),
  currentClasses: z.array(z.string().max(100)).max(200),
  /** Project ID to apply nudge to (required for AST update) */
  projectId: z.string().min(1).max(50).optional(),
  /** Component ID within the project to nudge */
  componentId: z.string().min(1).max(100).optional(),
});

/** Helper to validate and parse request body */
export async function validateBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);
    
    if (!result.success) {
      const issues = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`);
      return { success: false, error: `Validation failed: ${issues.join(', ')}` };
    }
    
    return { success: true, data: result.data };
  } catch {
    return { success: false, error: 'Invalid JSON body' };
  }
}

/** Inferred types for use in handlers */
export type CreateProjectRequest = z.infer<typeof CreateProjectSchema>;
export type UpdateVibeRequest = z.infer<typeof UpdateVibeSchema>;
export type GenerateComponentRequest = z.infer<typeof GenerateComponentSchema>;
export type GenerateStreamRequest = z.infer<typeof GenerateStreamSchema>;
export type NudgeRequest = z.infer<typeof NudgeRequestSchema>;
