import { motion } from "framer-motion";
import { AppHeader } from "@/components/layout/AppHeader";
import { StorageGuide } from "@/components/sections/StorageGuide";

export default function StoragePage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="min-h-screen pb-16"
    >
      <AppHeader title="การเก็บรักษาเนื้อสัตว์" subtitle="Meat Storage Guide" />
      <StorageGuide />
    </motion.div>
  );
}
