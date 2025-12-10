"use client";
import React, { useState, useEffect, useContext } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton, useTheme } from "@mui/material";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import { ColorModeContext } from "../dashboard/theme";

function Navbar() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("Inicio");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const isDark = theme.palette.mode === "dark";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      const sections = ["Inicio", "Nosotros", "Niveles", "Contactos", "LogIn"];
      let current = "Inicio";
      for (const sec of sections) {
        const element = document.getElementById(sec.replace(/\s+/g, ""));
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom >= 120) {
            current = sec;
          }
        }
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: { clientX: number; clientY: number; }) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleLogoClick = () => {
    if (window.location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.location.href = "/";
    }
  };

  const menuItems = ["Inicio", "Nosotros", "Niveles", "Contactos"];

  return (
    <>
      <div
  className={`fixed top-0 left-0 w-full z-[60] transition-all duration-700 ${
    scrolled
      ? isDark
        ? "bg-gray-900/80 backdrop-blur-xl shadow-2xl shadow-blue-500/10 border-b border-blue-500/20"
        : "bg-white/80 backdrop-blur-xl shadow-2xl shadow-blue-500/10 border-b border-blue-200/40"
      : "bg-transparent"
  }`}
  style={{
    animation: "slideDown 0.8s ease-out",
  }}
>

        {/* Gradient overlay efecto glassmorphism */}
        {scrolled && (
          <div
            className="absolute inset-0 pointer-events-none opacity-50"
            style={{
              background: isDark
                ? `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.15), transparent 60%)`
                : `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(147, 197, 253, 0.2), transparent 60%)`,
            }}
          />
        )}

        <div className="container mx-auto flex justify-between items-center py-5 px-6 md:px-20 lg:px-32 relative z-10">
          {/* Logo con efecto de brillo */}
          <div className="relative group flex items-center cursor-pointer" onClick={handleLogoClick}>
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500" />
            <img
              src="/logo.png"
              alt="Logo"
              className="w-20 cursor-pointer hover:scale-110 transition-all duration-500 drop-shadow-2xl relative z-10 hover:rotate-[5deg]"
              onClick={handleLogoClick}
              
            />
            <div className=" ml-3 text-xl font-bold select-none relative z-10 ">
            <h3
              className="text-xs sm:text-sm md:text-base bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent drop-shadow"

            >
              Unidad Educativa Particular La Voz de Cristo
            </h3>
            <p className="text-[8px] sm:text-[15px] md:text-xs text-gray-200 tracking-wide"> Plataforma Educativa</p>

          </div>
          </div>        

          {/* Controles derecha */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className={`absolute inset-0 ${isDark ? "bg-blue-500" : "bg-yellow-500"} rounded-full blur-md opacity-0 group-hover:opacity-50 transition-all duration-300`} />
              <IconButton
                onClick={colorMode.toggleColorMode}
                className="relative z-10 transition-all duration-500 hover:scale-110 hover:rotate-180"
                sx={{
                  color: scrolled ? (isDark ? "#e5e7eb" : "#1f2937") : "#ffffff",
                  background: isDark
                    ? "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))"
                    : "linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(234, 179, 8, 0.2))",
                }}
              >
                {isDark ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
              </IconButton>
            </div>

            {/* Ícono menú móvil con animación */}
            <div
              className={`md:hidden cursor-pointer transition-all duration-300 hover:scale-110 hover:rotate-90 ${
                scrolled ? (isDark ? "text-gray-200" : "text-gray-800") : "text-white"
              }`}
              onClick={() => setShowMobileMenu(true)}
              style={{
                filter: !scrolled ? "drop-shadow(0 0 10px rgba(59, 130, 246, 0.5))" : "none",
              }}
            >
              <MenuIcon sx={{ width: 32, height: 32 }} />
            </div>
          </div>
        </div>
      </div>

      {/* Animaciones CSS avanzadas */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes gradientShift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
          }
          50% {
            box-shadow: 0 0 40px rgba(59, 130, 246, 0.8);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </>
  );
}

export default Navbar;