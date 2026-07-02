import { motion } from "framer-motion";
import { AppHeader } from "@/components/layout/AppHeader";
import { FoodSafety } from "@/components/sections/FoodSafety";

export default function SafetyPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="min-h-screen pb-16"
    >
      <AppHeader title="ความปลอดภัยด้านอาหาร" subtitle="Food Safety" />
      <FoodSafety />
    </motion.div>
  );
}
