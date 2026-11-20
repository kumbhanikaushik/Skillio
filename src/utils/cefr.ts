import type { CefrLevel } from '@/features/home/types';

export const CEFR_LEVELS: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export const cefrIndex = (level: CefrLevel) => CEFR_LEVELS.indexOf(level);
