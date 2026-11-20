export interface Question {
  section: string;
  prompt: string;
  /** sentence with "___" where the answer goes */
  sentence: string;
  options: string[];
  answer: number;
  tip: string;
}

export const QUESTIONS: Question[] = [
  {
    section: '📖 Read',
    prompt: 'Choose the right word',
    sentence: 'She was ___ to admit that she was wrong.',
    options: ['reluctant', 'reluctance', 'reluctantly'],
    answer: 0,
    tip: 'We need an adjective after “was”. Reluctant = not wanting to do something.',
  },
  {
    section: '🎧 Listen',
    prompt: 'Complete the dialogue',
    sentence: '“Could you ___ me how to get to the station?”',
    options: ['say', 'tell', 'speak'],
    answer: 1,
    tip: 'We “tell someone” something. We “say something” (to someone).',
  },
  {
    section: '🗣️ Speak',
    prompt: 'Pick the natural phrase',
    sentence: 'I ___ English for three years now.',
    options: ['study', 'am studying', 'have been studying'],
    answer: 2,
    tip: 'Present perfect continuous + “for” shows an action that started in the past and is still going.',
  },
];
