import { motion } from "framer-motion";
import { AppHeader } from "@/components/layout/AppHeader";
import { HowItWorks } from "@/components/sections/HowItWorks";

export default function HowItWorksPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="min-h-screen pb-16"
    >
      <AppHeader title="หลักการทำงาน" subtitle="How MEAT GUARD Works" />
      <HowItWorks />
    </motion.div>
  );
}
