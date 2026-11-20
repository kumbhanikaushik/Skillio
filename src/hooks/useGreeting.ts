/** Time-aware greeting so the screen feels personal every time it opens. */
export function useGreeting(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return { text: 'Good morning', emoji: '☀️' };
  if (h < 17) return { text: 'Good afternoon', emoji: '🌤️' };
  return { text: 'Good evening', emoji: '🌙' };
}
