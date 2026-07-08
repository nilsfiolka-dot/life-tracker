import { z } from 'zod';

// Zod-Validierungsschema für die Antwortstruktur (Garantie für das Frontend)
export const MetricSchema = z.object({
  label: z.string(),
  value: z.string(),
  trend: z.string().optional(),
  help: z.string().optional(),
});

export const DomainSchema = z.object({
  title: z.string(),
  scoreLabel: z.string(),
  subtitle: z.string(),
  accent: z.string(),
  metrics: z.array(MetricSchema),
  highlight: z.string(),
});

export const AIAgentOutputSchema = z.object({
  sport: DomainSchema,
  uni: DomainSchema,
  sidehustle: DomainSchema,
});

export type AIAgentOutput = z.infer<typeof AIAgentOutputSchema>;