export function getGradeLetter(score: number): { letter: string; status: 'Pass' | 'Fail' } {
  if (score >= 75) return { letter: 'A', status: 'Pass' };
  if (score >= 60) return { letter: 'B', status: 'Pass' };
  if (score >= 45) return { letter: 'C', status: 'Pass' };
  if (score >= 30) return { letter: 'D', status: 'Pass' };
  return { letter: 'E', status: 'Fail' };
}
