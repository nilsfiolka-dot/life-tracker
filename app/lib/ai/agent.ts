import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { SYSTEM_PROMPT } from './prompts';
import { AIAgentOutputSchema, type AIAgentOutput } from './tools';
import { type WellbeingLogRecord } from '../wellbeingClient';
import { sportMock, uniMock, sidehustleMock } from '../dashboardMock';

/**
 * Der autonome Agenten-Loop. Nimmt die Rohdaten entgegen, wendet Prompts an 
 * und generiert ein garantiertes, typisiertes JSON-Objekt über Gemini.
 */
export async function runWellbeingAgent(logs: WellbeingLogRecord[]): Promise<AIAgentOutput> {
  const dataContextString = JSON.stringify(logs, null, 2);
  const modelId = process.env.GOOGLE_GENERATIVE_AI_MODEL || process.env.GOOGLE_AI_MODEL || 'gemini-2.0-flash';

  try {
    const { object } = await generateObject({
      model: google(modelId),
      schema: AIAgentOutputSchema,
      system: SYSTEM_PROMPT,
      prompt: `Hier sind die tatsächlichen Rohdaten der letzten Tage aus der Datenbank. Analysiere die Zeitreihe und erstelle die Auswertung:\n${dataContextString}`,
      temperature: 0.2,
    });

    return object;
  } catch (err) {
    console.error('Agent Engine Error:', err);
    // Fallback: use local mocks so the frontend still receives a valid shape
    return {
      sport: sportMock,
      uni: uniMock,
      sidehustle: sidehustleMock,
    } as unknown as AIAgentOutput;
  }
}