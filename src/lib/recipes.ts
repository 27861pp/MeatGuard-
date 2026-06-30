/**
 * MEAT GUARD — recommended menu / cooking-clip data.
 *
 * Each dish carries a safe internal cooking temperature (food-safety theme)
 * and a YouTube reference. By default the player opens a YouTube *search*
 * (always works, no dead links); drop a real `youtubeId` in to embed the clip
 * inline instead.
 */

export type MeatType = "chicken" | "pork" | "beef";

export interface Recipe {
  id: string;
  name: string;
  desc: string;
  minutes: number;
  difficulty: "ง่าย" | "ปานกลาง" | "ยาก";
  /** recommended safe internal temperature, °C */
  safeTempC: number;
  /** optional — set to embed the clip inline */
  youtubeId?: string;
  /** YouTube search query used for the "watch" link / thumbnail */
  searchQuery: string;
}

export interface MeatCategory {
  type: MeatType;
  label: string;
  labelEn: string;
  emoji: string;
  /** USDA-style safe internal temperature for this meat, °C */
  safeTempC: number;
  tempNote: string;
  /** tailwind text colour token */
  accent: string;
  /** tailwind gradient for posters */
  gradient: string;
  recipes: Recipe[];
}

export const MENU: MeatCategory[] = [
  {
    type: "chicken",
    label: "ไก่",
    labelEn: "Chicken",
    emoji: "🍗",
    safeTempC: 74,
    tempNote: "สัตว์ปีกต้องปรุงให้ถึง 74°C ที่ใจกลางเสมอ",
    accent: "text-amber-400",
    gradient: "from-amber-500/30 via-orange-500/10 to-transparent",
    recipes: [
      {
        id: "chk-fried",
        name: "ไก่ทอดกรอบ",
        desc: "หนังกรอบ เนื้อนุ่มฉ่ำ คลุกแป้งสูตรกรอบนาน",
        minutes: 35,
        difficulty: "ปานกลาง",
        safeTempC: 74,
        searchQuery: "วิธีทำไก่ทอดกรอบ",
      },
      {
        id: "chk-basil",
        name: "ผัดกะเพราไก่",
        desc: "เมนูจานด่วน หอมกะเพรา รสจัดจ้าน",
        minutes: 15,
        difficulty: "ง่าย",
        safeTempC: 74,
        searchQuery: "วิธีทำผัดกะเพราไก่",
      },
      {
        id: "chk-grill",
        name: "ไก่ย่างจิ้มแจ่ว",
        desc: "หมักเครื่อง ย่างหอม เสิร์ฟพร้อมน้ำจิ้มแจ่ว",
        minutes: 50,
        difficulty: "ปานกลาง",
        safeTempC: 74,
        searchQuery: "วิธีทำไก่ย่าง น้ำจิ้มแจ่ว",
      },
    ],
  },
  {
    type: "pork",
    label: "หมู",
    labelEn: "Pork",
    emoji: "🥩",
    safeTempC: 63,
    tempNote: "หมูปรุงให้ถึง 63°C แล้วพักเนื้อ 3 นาที",
    accent: "text-rose-400",
    gradient: "from-rose-500/30 via-pink-500/10 to-transparent",
    recipes: [
      {
        id: "prk-krapao",
        name: "หมูสับผัดกะเพรา",
        desc: "คลาสสิกตลอดกาล ราดข้าวสวยร้อน ๆ ไข่ดาว",
        minutes: 15,
        difficulty: "ง่าย",
        safeTempC: 71,
        searchQuery: "วิธีทำกะเพราหมูสับ",
      },
      {
        id: "prk-grill",
        name: "หมูย่างเกาหลี",
        desc: "หมักซอสหอมหวาน ย่างกระทะร้อน",
        minutes: 30,
        difficulty: "ปานกลาง",
        safeTempC: 63,
        searchQuery: "วิธีทำหมูย่างเกาหลี",
      },
      {
        id: "prk-tonkatsu",
        name: "หมูทงคัตสึ",
        desc: "ชุบเกล็ดขนมปังทอดกรอบ ราดซอสทงคัตสึ",
        minutes: 40,
        difficulty: "ปานกลาง",
        safeTempC: 63,
        searchQuery: "วิธีทำหมูทงคัตสึ",
      },
    ],
  },
  {
    type: "beef",
    label: "วัว",
    labelEn: "Beef",
    emoji: "🐄",
    safeTempC: 63,
    tempNote: "เนื้อชิ้น 63°C · เนื้อบด 71°C",
    accent: "text-red-400",
    gradient: "from-red-600/30 via-rose-600/10 to-transparent",
    recipes: [
      {
        id: "bef-steak",
        name: "สเต๊กเนื้อ",
        desc: "จี่กระทะร้อนจัด พักเนื้อก่อนตัด เสิร์ฟกับสลัด",
        minutes: 25,
        difficulty: "ปานกลาง",
        safeTempC: 63,
        searchQuery: "วิธีทำสเต๊กเนื้อ กระทะ",
      },
      {
        id: "bef-noodle",
        name: "เนื้อตุ๋นเปื่อย",
        desc: "ตุ๋นเครื่องยาจีน เนื้อนุ่มละลาย น้ำซุปกลมกล่อม",
        minutes: 120,
        difficulty: "ยาก",
        safeTempC: 71,
        searchQuery: "วิธีทำเนื้อตุ๋น",
      },
      {
        id: "bef-namtok",
        name: "น้ำตกเนื้อ",
        desc: "ย่างพอสุก หั่นคลุกน้ำยำรสแซ่บ ข้าวคั่วหอม",
        minutes: 30,
        difficulty: "ง่าย",
        safeTempC: 71,
        searchQuery: "วิธีทำน้ำตกเนื้อ",
      },
    ],
  },
];

export function youtubeSearchUrl(query: string) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}
