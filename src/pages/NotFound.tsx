import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="grid h-20 w-20 place-items-center rounded-2xl glass-strong"
      >
        <SearchX className="h-9 w-9 text-meat" />
      </motion.div>
      <h1 className="mt-6 text-6xl font-black">
        4<span className="text-gradient">0</span>4
      </h1>
      <p className="mt-3 max-w-sm text-muted-foreground">
        ไม่พบหน้าที่คุณกำลังค้นหา — อาจถูกย้ายหรือไม่มีอยู่จริง
      </p>
      <Button className="mt-8" onClick={() => navigate("/")}>
        <Home /> กลับหน้าแรก
      </Button>
    </div>
  );
}
