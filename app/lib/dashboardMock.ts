import type { DomainMock, SessionLogEntry } from '../dashboardMock';

export type { DomainMock, SessionLogEntry } from '../dashboardMock';
export {
  type MetricItem as MetricDetail,
  lifeRankMock,
  trackerScoreMock,
  sportMock,
  uniMock,
  sidehustleMock,
  sessionLogMock,
} from '../dashboardMock';

export type SectionData = DomainMock;
export type TrackerScoreData = {
  total: number;
  max: number;
  comment: string;
  breakdown: Array<{ label: string; value: number; percentage: number; color: string }>;
};
export type LifeRankData = {
  current: string;
  peak: string;
  theme: string;
  score: number;
  progress: string;
  weeklyScore: number;
  monthlyScore: number;
  description: string;
};
