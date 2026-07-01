import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { FoodSafety } from "@/components/sections/FoodSafety";
import { DidYouKnow } from "@/components/sections/DidYouKnow";
import { Consumption } from "@/components/sections/Consumption";
import { StorageGuide } from "@/components/sections/StorageGuide";
import { CallToAction } from "@/components/sections/CallToAction";

export default function Home() {
  const [params] = useSearchParams();
  const section = params.get("section");

  // Smooth-scroll to a section when arriving via "?section=safety" (used by
  // the in-app shortcuts, since HashRouter owns the URL hash).
  useEffect(() => {
    if (!section) return;
    const t = window.setTimeout(() => {
      document.getElementById(section)?.scrollIntoView({ behavior: "smooth" });
    }, 200);
    return () => window.clearTimeout(t);
  }, [section]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Hero />
      <HowItWorks />
      <FoodSafety />
      <DidYouKnow />
      <Consumption />
      <StorageGuide />
      <CallToAction />
    </motion.div>
  );
}
