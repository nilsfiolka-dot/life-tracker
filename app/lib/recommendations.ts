import type { DomainMock } from '../dashboardMock';
import type { TodoItem } from './todosClient';

export interface Recommendation {
  id: string;
  text: string;
  tag: string;
  tone: 'high' | 'medium' | 'low';
}

// app/lib/recommendations.ts — replace parseScore

const parseScore = (scoreLabel: string): number | null => {
  // Matches "86 / 100" style labels used by DomainMock
  const match = scoreLabel.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
  if (match) {
    const [, num, denom] = match;
    return (Number(num) / Number(denom)) * 100;
  }
  // Fallback: plain percentage like "55%"
  const percentMatch = scoreLabel.match(/(\d+(?:\.\d+)?)\s*%/);
  return percentMatch ? Number(percentMatch[1]) : null;
};

export const generateRecommendations = (
  domains: { sport: DomainMock; uni: DomainMock; sidehustle: DomainMock },
  todos: TodoItem[],
): Recommendation[] => {
  const recs: Recommendation[] = [];

  const highPriorityTodos = todos
    .filter((t) => !t.completed && t.priority === 'high')
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  highPriorityTodos.slice(0, 3).forEach((t) => {
    recs.push({ id: `todo-${t.id}`, text: `Erledige: "${t.text}"`, tag: t.domain, tone: 'high' });
  });

  const scored = (['sport', 'uni', 'sidehustle'] as const)
    .map((key) => ({ key, score: parseScore(domains[key].scoreLabel) }))
    .filter((d): d is { key: 'sport' | 'uni' | 'sidehustle'; score: number } => d.score !== null)
    .sort((a, b) => a.score - b.score);

  if (scored.length > 0 && scored[0].score < 60) {
    const weakest = scored[0];
    recs.push({
      id: `domain-${weakest.key}`,
      text: `${domains[weakest.key].title} liegt bei nur ${domains[weakest.key].scoreLabel} — priorisiere hier den nächsten Schritt.`,
      tag: weakest.key,
      tone: 'medium',
    });
  }

  if (recs.length < 5) {
    const mediumTodos = todos
      .filter((t) => !t.completed && t.priority === 'medium')
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    mediumTodos.slice(0, 5 - recs.length).forEach((t) => {
      recs.push({ id: `todo-${t.id}`, text: `Als Nächstes: "${t.text}"`, tag: t.domain, tone: 'medium' });
    });
  }

  if (recs.length === 0) {
    recs.push({
      id: 'fallback',
      text: 'Kein akuter Handlungsbedarf — füge neue To-Dos hinzu, um Empfehlungen zu erhalten.',
      tag: 'Allgemein',
      tone: 'low',
    });
  }

  return recs.slice(0, 5);
};