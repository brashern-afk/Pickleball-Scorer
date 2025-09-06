// FIX: Removed a circular import. This file was importing the 'speak' function from itself,
// which is unnecessary and caused a name conflict with the exported 'speak' function.

export const speak = (text: string) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    // Use a British English voice for a different accent, if available.
    utterance.lang = 'en-GB';
    // Speed up the voice slightly.
    utterance.rate = 1.1;
    window.speechSynthesis.cancel(); // Cancel any previous speech
    window.speechSynthesis.speak(utterance);
  } else {
    console.warn('Speech synthesis not supported in this browser.');
  }
};

/**
 * Converts a number to its word representation for clearer speech synthesis.
 * Handles numbers up to 20, which is sufficient for typical pickleball scores.
 */
const numberToWord = (num: number): string => {
  const words: { [key: number]: string } = {
    0: 'zero', 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten', 11: 'eleven', 12: 'twelve', 13: 'thirteen', 14: 'fourteen', 15: 'fifteen', 16: 'sixteen', 17: 'seventeen', 18: 'eighteen', 19: 'nineteen', 20: 'twenty'
  };
  return words[num] || num.toString();
};


export const speakScore = (servingScore: number, receivingScore: number, serverCount: number, mode: 'singles' | 'doubles') => {
  const scoreNumbers = mode === 'singles'
    ? [servingScore, receivingScore]
    : [servingScore, receivingScore, serverCount];
  const scoreString = scoreNumbers.map(numberToWord).join(' ');
  speak(scoreString);
};

export const speakScoreAndServer = (servingScore: number, receivingScore: number, serverCount: number, serverName: string, servingSide: 'left' | 'right', mode: 'singles' | 'doubles') => {
  const scoreNumbers = mode === 'singles'
    ? [servingScore, receivingScore]
    : [servingScore, receivingScore, serverCount];
  const scoreString = scoreNumbers.map(numberToWord).join(' ');
  const fullText = `${scoreString}. ${serverName} to serve from the ${servingSide}.`;
  speak(fullText);
};


export const speakWinner = (winningPlayers: string[], score: [number, number]) => {
  const winnerText = `${winningPlayers.join(' and ')} win the game, ${numberToWord(score[0])} to ${numberToWord(score[1])}.`;
  speak(winnerText);
};