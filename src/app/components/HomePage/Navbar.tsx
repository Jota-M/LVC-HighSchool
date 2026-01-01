"use client";
import React, { useState, useEffect, useContext } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton, useTheme } from "@mui/material";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import { ColorModeContext } from "../../dashboard/theme";

function Navbar() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("Inicio");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const isDark = theme.palette.mode === "dark";

  useEffect(() => {
    // Detectar si es mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
    // Solo activar mousemove en desktop
    if (isMobile) return;
    
    const handleMouseMove = (e: { clientX: number; clientY: number; }) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isMobile]);

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
              ? "bg-gray-900/95 backdrop-blur-xl shadow-2xl shadow-blue-500/10 border-b border-blue-500/20"
              : "bg-white/95 backdrop-blur-xl shadow-2xl shadow-blue-500/10 border-b border-blue-200/40"
            : "bg-transparent"
        }`}
        style={{
          animation: isMobile ? "none" : "slideDown 0.8s ease-out",
        }}
      >
        {/* Gradient overlay efecto glassmorphism - solo desktop */}
        {scrolled && !isMobile && (
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
          {/* Logo - efectos solo en desktop */}
          <div className={`relative ${!isMobile ? "group" : ""}`}>
            {!isMobile && (
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500" />
            )}
            <img
              src="/logo.png"
              alt="Logo"
              className={`w-20 cursor-pointer relative z-10 ${
                !isMobile ? "hover:scale-110 transition-all duration-500 drop-shadow-2xl hover:rotate-[5deg]" : ""
              }`}
              onClick={handleLogoClick}
            />
          </div>

          {/* Desktop Nav */}
          <ul className="hidden md:flex gap-10 font-medium items-center">
            {menuItems.map((item, index) => {
              const link = `#${item.replace(/\s+/g, "")}`;
              const isActive = activeSection === item;
              return (
                <a
                  key={index}
                  href={link}
                  className={`relative group transition-all duration-500 text-md font-semibold ${
                    isActive
                      ? isDark
                        ? "text-blue-400"
                        : "text-blue-600"
                      : scrolled
                      ? isDark
                        ? "text-gray-200 hover:text-blue-400"
                        : "text-gray-700 hover:text-blue-600"
                      : "text-white hover:text-blue-300"
                  }`}
                  style={{
                    textShadow: !scrolled ? "0 2px 10px rgba(0,0,0,0.3)" : "none",
                    animation: `fadeInDown 0.6s ease-out ${index * 0.1}s both`,
                  }}
                >
                  {item}
                  <span
                    className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r ${
                      isDark
                        ? "from-blue-400 via-purple-400 to-blue-400"
                        : "from-blue-600 via-purple-600 to-blue-600"
                    } ${
                      isActive ? "w-full" : "w-0"
                    } group-hover:w-full transition-all duration-500`}
                    style={{
                      boxShadow: isActive || undefined
                        ? "0 0 10px rgba(59, 130, 246, 0.8)"
                        : "none",
                    }}
                  />
                  
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:-top-10 transition-all duration-500">
                    <span className={`inline-block w-1 h-1 rounded-full ${isDark ? "bg-blue-400" : "bg-blue-600"}`} />
                  </span>
                </a>
              );
            })}

            {/* Botón Login - solo desktop */}
            <a
              href="/login"
              className={`relative px-6 py-3 rounded-xl font-bold border-2 overflow-hidden group transition-all duration-500 hover:scale-110 ${
                isDark
                  ? "border-yellow-400 text-yellow-400 hover:text-gray-900 shadow-yellow-400/50"
                  : "border-yellow-500 text-yellow-600 hover:text-white shadow-yellow-500/50"
              }`}
              style={{
                animation: "fadeInDown 0.6s ease-out 0.5s both",
                boxShadow: isDark
                  ? "0 0 20px rgba(251, 191, 36, 0.3)"
                  : "0 0 20px rgba(234, 179, 8, 0.3)",
              }}
            >
              <span className="relative z-10">Iniciar Sesión</span>
              <div
                className={`absolute inset-0 ${
                  isDark ? "bg-yellow-400" : "bg-yellow-500"
                } transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}
              />
            </a>
          </ul>

          {/* Controles derecha */}
          <div className="flex items-center gap-4">
            <div className={`relative ${!isMobile ? "group" : ""}`}>
              {!isMobile && (
                <div className={`absolute inset-0 ${isDark ? "bg-blue-500" : "bg-yellow-500"} rounded-full blur-md opacity-0 group-hover:opacity-50 transition-all duration-300`} />
              )}
              <IconButton
                onClick={colorMode.toggleColorMode}
                className={`relative z-10 ${!isMobile ? "transition-all duration-500 hover:scale-110 hover:rotate-180" : ""}`}
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

            {/* Ícono menú móvil - sin animaciones pesadas */}
            <div
              className={`md:hidden cursor-pointer transition-transform duration-200 ${
                scrolled ? (isDark ? "text-gray-200" : "text-gray-800") : "text-white"
              }`}
              onClick={() => setShowMobileMenu(true)}
            >
              <MenuIcon sx={{ width: 32, height: 32 }} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Optimizado con fondo sólido */}
      <div
        className={`fixed top-0 left-0 h-screen w-full z-[70] flex flex-col items-center justify-center transition-all duration-500 ${
          isDark
            ? "bg-gray-900"
            : "bg-white"
        } ${
          showMobileMenu
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-0 pointer-events-none"
        }`}
      >
        {/* Botón cerrar - simplificado */}
        <div className="absolute top-6 right-6">
          <CloseIcon
            onClick={() => setShowMobileMenu(false)}
            className={`${isDark ? "text-gray-200" : "text-gray-800"} transition-transform duration-300 hover:rotate-90`}
            sx={{
              width: 36,
              height: 36,
              cursor: "pointer",
            }}
          />
        </div>

        <ul
          className={`flex flex-col items-center gap-6 text-2xl font-bold ${
            isDark ? "text-gray-100" : "text-gray-900"
          }`}
        >
          {menuItems.map((item, index) => {
            const link = `#${item.replace(/\s+/g, "")}`;
            return (
              <li key={index}>
                <a
                  href={link}
                  onClick={() => setShowMobileMenu(false)}
                  className={`transition-colors duration-300 ${
                    isDark ? "hover:text-blue-400" : "hover:text-blue-600"
                  }`}
                >
                  {item}
                </a>
              </li>
            );
          })}

          {/* Botón Admisiones mobile - simplificado */}
          <li className="mt-4">
            <a
              href="/PreInscripcion"
              onClick={() => setShowMobileMenu(false)}
              className="inline-block px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg"
            >
              Admisiones 2026
            </a>
          </li>

          {/* Botón Login mobile - simplificado */}
          <li>
            <a
              href="/login"
              onClick={() => setShowMobileMenu(false)}
              className={`inline-block border-2 px-8 py-4 rounded-xl font-bold ${
                isDark
                  ? "border-yellow-400 text-yellow-400"
                  : "border-yellow-500 text-yellow-600"
              }`}
            >
              Iniciar Sesión
            </a>
          </li>
        </ul>
      </div>

      {/* Animaciones CSS - solo para desktop */}
      <style jsx>{`
        @media (min-width: 768px) {
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
        }
      `}</style>
    </>
  );
}

export default Navbar;