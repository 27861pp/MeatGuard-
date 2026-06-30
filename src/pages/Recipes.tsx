import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Flame, Play, ShieldCheck, Utensils } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { RecipeVideoModal } from "@/components/recipes/RecipeVideoModal";
import { MENU, type MeatCategory, type Recipe } from "@/lib/recipes";

export default function Recipes() {
  const [active, setActive] = useState<{ recipe: Recipe; category: MeatCategory } | null>(
    null
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="min-h-screen pb-20"
    >
      <AppHeader title="เมนูแนะนำ" subtitle="คลิปวิธีทำ ไก่ · หมู · วัว" />

      <div className="container pt-6">
        <div className="mb-8 flex items-center gap-3 rounded-2xl glass p-4">
          <span className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-safe">
            <Utensils className="h-5 w-5" />
          </span>
          <p className="text-sm text-muted-foreground">
            เมนูยอดนิยมพร้อมคลิปวิธีทำ และ
            <span className="text-foreground"> อุณหภูมิปรุงที่ปลอดภัย</span> —
            ตรวจความสดด้วย MEAT GUARD ก่อนลงมือ
          </p>
        </div>

        <div className="space-y-12">
          {MENU.map((cat, ci) => (
            <section key={cat.type}>
              {/* category header */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{cat.emoji}</span>
                  <div>
                    <h2 className="text-xl font-extrabold">
                      เมนู{cat.label}{" "}
                      <span className="text-sm font-medium text-muted-foreground">
                        / {cat.labelEn}
                      </span>
                    </h2>
                    <p className="text-xs text-muted-foreground">{cat.tempNote}</p>
                  </div>
                </div>
                <span className={`hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold sm:inline-flex ${cat.accent}`}>
                  <ShieldCheck className="h-3.5 w-3.5" /> {cat.safeTempC}°C
                </span>
              </div>

              {/* recipe cards */}
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {cat.recipes.map((r, ri) => (
                  <motion.button
                    key={r.id}
                    onClick={() => setActive({ recipe: r, category: cat })}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.4, delay: (ci * 3 + ri) * 0.04 }}
                    className="group overflow-hidden rounded-2xl glass text-left transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow-meat"
                  >
                    {/* poster */}
                    <div className={`relative aspect-[16/10] overflow-hidden bg-gradient-to-br ${cat.gradient}`}>
                      <div className="absolute inset-0 grid-bg opacity-30" />
                      <span className="absolute right-3 top-3 text-5xl opacity-30 transition-transform duration-500 group-hover:scale-110">
                        {cat.emoji}
                      </span>
                      <div className="absolute inset-0 grid place-items-center">
                        <span className="grid h-14 w-14 place-items-center rounded-full bg-white/90 text-zinc-900 shadow-xl transition-transform duration-300 group-hover:scale-110">
                          <Play className="h-6 w-6 translate-x-0.5 fill-current" />
                        </span>
                      </div>
                      <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
                        <Clock className="h-3 w-3" /> {r.minutes} นาที
                      </span>
                    </div>

                    {/* body */}
                    <div className="p-4">
                      <h3 className="text-base font-bold">{r.name}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.desc}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                        <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 font-medium text-muted-foreground">
                          <Flame className="h-3 w-3" /> {r.difficulty}
                        </span>
                        <span className={`inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 font-medium ${cat.accent}`}>
                          <ShieldCheck className="h-3 w-3" /> ปรุงถึง {r.safeTempC}°C
                        </span>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <RecipeVideoModal
        recipe={active?.recipe ?? null}
        category={active?.category ?? null}
        onClose={() => setActive(null)}
      />
    </motion.div>
  );
}
