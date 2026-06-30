import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutDashboard, LogOut, Menu, Utensils, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "หลักการทำงาน", href: "#how" },
  { label: "ความปลอดภัย", href: "#safety" },
  { label: "คำแนะนำ", href: "#consumption" },
  { label: "การเก็บรักษา", href: "#storage" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const onHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const handleNav = (href: string) => {
    setOpen(false);
    if (!onHome) {
      navigate("/" + href);
      return;
    }
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "py-2" : "py-4"
      )}
    >
      <div className="container">
        <nav
          className={cn(
            "flex items-center justify-between rounded-2xl px-4 py-2.5 transition-all duration-300",
            scrolled ? "glass-strong" : "border border-transparent"
          )}
        >
          <Link to="/" className="transition-transform hover:scale-[1.02]">
            <Logo />
          </Link>

          {/* desktop links */}
          <div className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((l) => (
              <button
                key={l.href}
                onClick={() => handleNav(l.href)}
                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
              >
                {l.label}
              </button>
            ))}
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            <Button variant="ghost" size="sm" onClick={() => navigate("/recipes")}>
              <Utensils /> เมนูแนะนำ
            </Button>
            {user ? (
              <>
                <Button variant="outline" size="sm" onClick={() => navigate("/home")}>
                  <LayoutDashboard /> หน้าหลัก
                </Button>
                <button
                  onClick={() => logout()}
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
                  title="ออกจากระบบ"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <Button size="sm" onClick={() => navigate("/login")}>
                เข้าสู่ระบบ
              </Button>
            )}
          </div>

          {/* mobile toggle */}
          <button
            className="grid h-10 w-10 place-items-center rounded-xl glass lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="เมนู"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {/* mobile menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="mt-2 overflow-hidden rounded-2xl glass-strong p-3 lg:hidden"
            >
              <div className="flex flex-col gap-1">
                {NAV_LINKS.map((l) => (
                  <button
                    key={l.href}
                    onClick={() => handleNav(l.href)}
                    className="rounded-xl px-4 py-3 text-left text-sm font-medium text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
                  >
                    {l.label}
                  </button>
                ))}
                <button
                  onClick={() => navigate("/recipes")}
                  className="flex items-center gap-2 rounded-xl px-4 py-3 text-left text-sm font-medium text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
                >
                  <Utensils className="h-4 w-4" /> เมนูแนะนำ (ไก่ · หมู · วัว)
                </button>
                <div className="my-2 h-px bg-white/10" />
                {user ? (
                  <>
                    <Button onClick={() => navigate("/home")} className="w-full">
                      <LayoutDashboard /> เข้าสู่หน้าหลัก
                    </Button>
                    <Button variant="outline" onClick={() => logout()} className="w-full">
                      <LogOut /> ออกจากระบบ
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => navigate("/login")} className="w-full">
                    เข้าสู่ระบบด้วย Google
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
