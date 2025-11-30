
const COLOR_POOL = [
  "#FF3B30", // Vivid Red
  "#FF9500", // Orange
  "#FFCC00", // Strong Yellow
  "#34C759", // Bright Green
  "#00C7BE", // Aqua
  "#32ADE6", // Sky Blue
  "#007AFF", // Vivid Blue
  "#5856D6", // Purple
  "#AF52DE", // Violet
  "#FF2D55"  // Pink Red
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