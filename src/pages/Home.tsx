import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { FoodSafety } from "@/components/sections/FoodSafety";
import { DidYouKnow } from "@/components/sections/DidYouKnow";
import { Consumption } from "@/components/sections/Consumption";
import { StorageGuide } from "@/components/sections/StorageGuide";
import { CallToAction } from "@/components/sections/CallToAction";

export default function Home() {
  const location = useLocation();

  // Smooth-scroll to a section when arriving via a hash link (e.g. /#safety).
  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash;
    const t = window.setTimeout(() => {
      document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
    }, 200);
    return () => window.clearTimeout(t);
  }, [location.hash]);

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
