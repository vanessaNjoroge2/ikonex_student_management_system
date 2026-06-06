export const getGradeLetter = (score: number): { letter: string; status: 'Pass' | 'Fail' } => {
  if (score >= 95) return { letter: 'A+', status: 'Pass' };
  if (score >= 90) return { letter: 'A', status: 'Pass' };
  if (score >= 85) return { letter: 'B+', status: 'Pass' };
  if (score >= 80) return { letter: 'B', status: 'Pass' };
  if (score >= 75) return { letter: 'C+', status: 'Pass' };
  if (score >= 70) return { letter: 'C', status: 'Pass' };
  if (score >= 60) return { letter: 'D', status: 'Pass' };
  return { letter: 'F', status: 'Fail' };
};

export const getRemarksForGrade = (letter: string): string => {
  if (letter.startsWith('A')) return 'Demonstrates outstanding comprehension and critical analyses.';
  if (letter.startsWith('B')) return 'Commendable effort. Solid application in core assessments.';
  if (letter.startsWith('C')) return 'Consistent progress. Work on refining minor theoretical parameters.';
  if (letter.startsWith('D')) return 'Requires targeted support and reviews of weekly topics.';
  return 'Action plan recommended for essential recovery.';
};
