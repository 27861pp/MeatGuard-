import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, ExternalLink, Flame, Play, ShieldCheck, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  type MeatCategory,
  type Recipe,
  youtubeSearchUrl,
} from "@/lib/recipes";

interface Props {
  recipe: Recipe | null;
  category: MeatCategory | null;
  onClose: () => void;
}

/**
 * Premium video modal. Embeds a YouTube clip inline when the recipe has a
 * `youtubeId`; otherwise shows a poster that opens a YouTube search in a new
 * tab — so the feature works reliably without hard-coded (and potentially
 * dead) video IDs.
 */
export function RecipeVideoModal({ recipe, category, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (recipe) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [recipe, onClose]);

  const open = Boolean(recipe && category);
  const searchUrl = recipe ? youtubeSearchUrl(recipe.searchQuery) : "#";

  return (
    <AnimatePresence>
      {open && recipe && category && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            className="relative w-full max-w-2xl overflow-hidden rounded-t-3xl glass-strong sm:rounded-3xl"
            initial={{ y: 40, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 40, scale: 0.98, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <button
              onClick={onClose}
              className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/40 text-white backdrop-blur transition-colors hover:bg-black/60"
              aria-label="ปิด"
            >
              <X className="h-4 w-4" />
            </button>

            {/* video / poster */}
            <div className="relative aspect-video w-full overflow-hidden bg-black">
              {recipe.youtubeId ? (
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube-nocookie.com/embed/${recipe.youtubeId}?rel=0`}
                  title={recipe.name}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <a
                  href={searchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative grid h-full w-full place-items-center bg-gradient-to-br ${category.gradient}`}
                >
                  <div className="absolute inset-0 grid-bg opacity-30" />
                  <span className="pointer-events-none absolute right-4 top-4 text-6xl opacity-40">
                    {category.emoji}
                  </span>
                  <div className="relative flex flex-col items-center gap-3 text-center">
                    <span className="grid h-16 w-16 place-items-center rounded-full bg-white/90 text-zinc-900 shadow-xl transition-transform group-hover:scale-110">
                      <Play className="h-7 w-7 translate-x-0.5 fill-current" />
                    </span>
                    <span className="text-sm font-semibold text-white/90">
                      ดูคลิปวิธีทำบน YouTube
                    </span>
                  </div>
                </a>
              )}
            </div>

            {/* details */}
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                <span className={category.accent}>{category.emoji} {category.labelEn}</span>
              </div>
              <h3 className="mt-1 text-2xl font-extrabold">{recipe.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{recipe.desc}</p>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <Stat icon={Clock} label="เวลา" value={`${recipe.minutes} นาที`} />
                <Stat icon={Flame} label="ความยาก" value={recipe.difficulty} />
                <Stat icon={ShieldCheck} label="ปรุงถึง" value={`${recipe.safeTempC}°C`} accent />
              </div>

              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-safe/25 bg-safe/[0.06] p-3 text-sm">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-safe" />
                <p className="leading-relaxed text-muted-foreground">
                  เพื่อความปลอดภัย ควรปรุงเนื้อ{category.label}ให้ร้อนถึง{" "}
                  <span className="font-semibold text-foreground">{recipe.safeTempC}°C</span>{" "}
                  ที่ใจกลาง — ตรวจสอบความสดด้วย MEAT GUARD ก่อนปรุงเสมอ
                </p>
              </div>

              <a
                href={searchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "safe", className: "mt-5 w-full" })}
              >
                <ExternalLink /> เปิดดูบน YouTube
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
      <Icon className={`mx-auto h-4 w-4 ${accent ? "text-safe" : "text-muted-foreground"}`} />
      <p className="mt-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-bold">{value}</p>
    </div>
  );
}
