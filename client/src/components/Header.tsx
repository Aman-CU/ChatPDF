import { Link } from "wouter";
import { FileText, Home, Menu, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function Header() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark" || 
        (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const toggleTheme = () => {
    console.log("Theme toggle triggered");
    setIsDark(!isDark);
  };

  return (
    <header className="border-b bg-background" data-testid="header-main">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-foreground hover-elevate" data-testid="link-home">
            <FileText className="h-6 w-6 text-primary" />
            ChatPDF
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-6" data-testid="nav-desktop">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-nav-home">
              Home
            </Link>
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-nav-dashboard">
              Dashboard
            </Link>
            <Link href="/faq" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-nav-faq">
              FAQ
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground"
              data-testid="button-theme-toggle"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              data-testid="button-mobile-menu"
              onClick={() => console.log("Mobile menu triggered")}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}