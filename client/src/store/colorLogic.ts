
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

export const getColorForUser = (userId: string, awareness: any = null): string => {
  // If user already has a color assigned locally, return it
  if (userColorMap.has(userId)) return userColorMap.get(userId)!;

  // Get all colors currently in use by other connected users
  const usedColors = new Set<string>();
  
  // Safety check - if awareness not ready yet, just assign first color
  if (awareness && awareness.getStates) {
    const states = awareness.getStates();
    states.forEach((state: any, clientId: number) => {
      if (state.user?.color && clientId !== awareness.clientID) {
        usedColors.add(state.user.color);
      }
    });
  }

  // Find first available color not used by anyone
  for (const color of COLOR_POOL) {
    if (!usedColors.has(color)) {
      userColorMap.set(userId, color);
      return color;
    }
  }

  // Fallback if all colors are taken
  return COLOR_POOL[0];
};

export const releaseColorForUser = (userId: string) => {
  userColorMap.delete(userId);
};