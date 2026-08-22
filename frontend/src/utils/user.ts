export interface Collaborator {
  clientId: number;
  name: string;
  color: string;
  isSelf?: boolean;
}

const PRESET_NAMES = [
  "Pixel Pioneer",
  "Binary Bandit",
  "Syntax Samurai",
  "Logic Luminary",
  "Async Astronaut",
  "Quantum Coder",
  "Cyber Sorcerer",
  "Code Crusader",
  "Algo Alchemist",
  "Vector Voyager",
];

const PRESET_COLORS = [
  "#3b82f6", // Blue
  "#ef4444", // Red
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#14b8a6", // Teal
  "#f97316", // Orange
  "#6366f1", // Indigo
];

export function getOrCreateLocalUser(): { name: string; color: string } {
  const storedName = sessionStorage.getItem("collab_user_name");
  const storedColor = sessionStorage.getItem("collab_user_color");

  if (storedName && storedColor) {
    return { name: storedName, color: storedColor };
  }

  const randomName =
    PRESET_NAMES[Math.floor(Math.random() * PRESET_NAMES.length)] +
    " #" +
    Math.floor(100 + Math.random() * 900);
  const randomColor =
    PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)];

  sessionStorage.setItem("collab_user_name", randomName);
  sessionStorage.setItem("collab_user_color", randomColor);

  return { name: randomName, color: randomColor };
}
