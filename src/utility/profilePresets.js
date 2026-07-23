import memoji01 from "../assets/profileIcon/Memoji - 01.png";
import memoji02 from "../assets/profileIcon/Memoji - 02.png";
import memoji03 from "../assets/profileIcon/Memoji - 03.png";
import memoji04 from "../assets/profileIcon/Memoji - 04.png";
import memoji05 from "../assets/profileIcon/Memoji - 05.png";
import memoji06 from "../assets/profileIcon/Memoji - 06.png";
import memoji07 from "../assets/profileIcon/Memoji - 07.png";
import memoji08 from "../assets/profileIcon/Memoji - 08.png";
import memoji09 from "../assets/profileIcon/Memoji - 09.png";
import memoji10 from "../assets/profileIcon/Memoji - 10.png";
import memoji11 from "../assets/profileIcon/Memoji - 11.png";
import memoji12 from "../assets/profileIcon/Memoji - 12.png";
import Avater from "../assets/Avater.jpg";

export const PROFILE_PRESETS = [
  { id: "memoji-01", src: memoji01 },
  { id: "memoji-02", src: memoji02 },
  { id: "memoji-03", src: memoji03 },
  { id: "memoji-04", src: memoji04 },
  { id: "memoji-05", src: memoji05 },
  { id: "memoji-06", src: memoji06 },
  { id: "memoji-07", src: memoji07 },
  { id: "memoji-08", src: memoji08 },
  { id: "memoji-09", src: memoji09 },
  { id: "memoji-10", src: memoji10 },
  { id: "memoji-11", src: memoji11 },
  { id: "memoji-12", src: memoji12 },
];

export const DEFAULT_PROFILE_PRESET_ID = PROFILE_PRESETS[0].id;
export const PROFILE_BG_TONES = [
  "bg-[#0EA5E9]",
  "bg-[#10B981]",
  "bg-[#22C55E]",
  "bg-[#2563EB]",
  "bg-[#3B82F6]",
  "bg-[#4ADE80]",
  "bg-[#8B5CF6]",
  "bg-[#9333EA]",
  "bg-[#A855F7]",
  "bg-[#B45309]",
  "bg-[#CA8A04]",
  "bg-[#DC2626]",
  "bg-[#EF4444]",
  "bg-[#F97316]",
  "bg-[#FB923C]",
];
export const DEFAULT_PROFILE_BG_TONE = PROFILE_BG_TONES[0];

export const getRandomProfilePresetId = () => {
  const randomIndex = Math.floor(Math.random() * PROFILE_PRESETS.length);
  return PROFILE_PRESETS[randomIndex]?.id || DEFAULT_PROFILE_PRESET_ID;
};

export const getRandomProfileBgTone = () => {
  const randomIndex = Math.floor(Math.random() * PROFILE_BG_TONES.length);
  return PROFILE_BG_TONES[randomIndex] || DEFAULT_PROFILE_BG_TONE;
};

export const normalizeProfileBgTone = (tone) =>
  PROFILE_BG_TONES.includes(tone) ? tone : DEFAULT_PROFILE_BG_TONE;

export const getProfilePresetById = (presetId) =>
  PROFILE_PRESETS.find((preset) => preset.id === presetId) || null;

export const getProfileImageSrc = (presetId) =>
  getProfilePresetById(presetId)?.src || Avater;

export const normalizeImagePreset = (presetId) =>
  getProfilePresetById(presetId)?.id || DEFAULT_PROFILE_PRESET_ID;

export const preloadProfilePresets = () => {
  if (typeof window === "undefined") return;

  PROFILE_PRESETS.forEach((preset) => {
    if (!preset?.src) return;
    const image = new Image();
    image.src = preset.src;
  });
};
