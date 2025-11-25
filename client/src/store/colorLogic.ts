
const COLOR_POOL = [
  "#F44336", "#E91E63", "#9C27B0", "#673AB7",
  "#3F51B5", "#2196F3", "#03A9F4", "#00BCD4",
  "#009688", "#4CAF50"
];

const userColorMap = new Map<string, string>(); // userId -> color
const usedColors = new Set<string>(); // colors currently in use

export const getColorForUser = (userId: string): string => {
  if (userColorMap.has(userId)) return userColorMap.get(userId)!;

  for (const color of COLOR_POOL) {
    if (!usedColors.has(color)) {
      userColorMap.set(userId, color);
      usedColors.add(color);
      return color;
    }
  }

  return "#000000"; // fallback
};

export const releaseColorForUser = (userId: string) => {
  const color = userColorMap.get(userId);
  if (color) {
    usedColors.delete(color);
    userColorMap.delete(userId);
  }
};