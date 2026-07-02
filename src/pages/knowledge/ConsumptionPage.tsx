import { motion } from "framer-motion";
import { AppHeader } from "@/components/layout/AppHeader";
import { Consumption } from "@/components/sections/Consumption";

export default function ConsumptionPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="min-h-screen pb-16"
    >
      <AppHeader title="คำแนะนำการบริโภค" subtitle="Consumption Recommendation" />
      <Consumption />
    </motion.div>
  );
}
