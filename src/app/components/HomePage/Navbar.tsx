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
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500" />
            <img
              src="/logo.png"
              alt="Logo"
              className="w-20 cursor-pointer hover:scale-110 transition-all duration-500 drop-shadow-2xl relative z-10 hover:rotate-[5deg]"
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
                  {/* Underline animado con brillo */}
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
                  
                  {/* Efecto de partículas en hover */}
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:-top-10 transition-all duration-500">
                    <span className={`inline-block w-1 h-1 rounded-full ${isDark ? "bg-blue-400" : "bg-blue-600"}`} />
                  </span>
                </a>
              );
            })}

            {/* Botón Admisiones con animación de pulso */}
            {/* <a
              href="/PreInscripcion"
              className="relative px-6 py-3 rounded-xl font-bold text-white overflow-hidden group shadow-2xl"
              style={{
                background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #3b82f6 100%)",
                backgroundSize: "200% 100%",
                animation: "gradientShift 3s ease infinite, fadeInDown 0.6s ease-out 0.4s both, pulse 2s ease-in-out infinite",
              }}
            >
              <span className="relative z-10 flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-ping absolute -left-1" />
                Admisiones 2025
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </a> */}

            {/* Botón Login con efecto neón */}
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

      {/* Mobile Menu con efecto de partículas */}
      <div
        className={`fixed top-0 left-0 h-screen w-full z-[70] flex flex-col items-center justify-center transition-all duration-700 ${
          isDark
            ? "bg-gradient-to-br from-gray-900 via-blue-950 to-purple-950"
            : "bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"
        } ${
          showMobileMenu
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-0 pointer-events-none"
        }`}
        style={{
          backgroundImage: isDark
            ? "radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)"
            : "radial-gradient(circle at 20% 50%, rgba(147, 197, 253, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(196, 181, 253, 0.3) 0%, transparent 50%)",
        }}
      >
        {/* Botón cerrar mejorado */}
        <div className="absolute top-6 right-6 group">
          <div className={`absolute inset-0 ${isDark ? "bg-red-500" : "bg-red-600"} rounded-full blur-lg opacity-0 group-hover:opacity-40 transition-all duration-300`} />
          <CloseIcon
            onClick={() => setShowMobileMenu(false)}
            className={`relative z-10 ${isDark ? "text-gray-200" : "text-gray-800"}`}
            sx={{
              width: 36,
              height: 36,
              cursor: "pointer",
              transition: "transform 0.5s",
              "&:hover": { transform: "rotate(90deg) scale(1.2)" },
            }}
          />
        </div>

        <ul
          className={`flex flex-col items-center gap-8 text-2xl font-bold ${
            isDark ? "text-gray-100" : "text-gray-900"
          }`}
        >
          {menuItems.map((item, index) => {
            const link = `#${item.replace(/\s+/g, "")}`;
            return (
              <li
                key={index}
                className="relative group"
                style={{
                  animation: `fadeInUp 0.5s ease forwards, float 3s ease-in-out infinite`,
                  animationDelay: `${index * 0.1 + 0.2}s, ${index * 0.3}s`,
                }}
              >
                <div className={`absolute -inset-4 ${isDark ? "bg-blue-500" : "bg-blue-600"} rounded-lg opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500`} />
                <a
                  href={link}
                  onClick={() => setShowMobileMenu(false)}
                  className={`relative z-10 transition-all duration-500 hover:scale-125 inline-block ${
                    isDark ? "hover:text-blue-400" : "hover:text-blue-600"
                  }`}
                  style={{
                    textShadow: isDark
                      ? "0 0 20px rgba(59, 130, 246, 0.5)"
                      : "0 0 20px rgba(37, 99, 235, 0.3)",
                  }}
                >
                  {item}
                </a>
              </li>
            );
          })}

          {/* Botón Admisiones mobile */}
          <li style={{ animation: "fadeInUp 0.5s ease forwards", animationDelay: "0.7s" }}>
            <a
              href="/PreInscripcion"
              onClick={() => setShowMobileMenu(false)}
              className="relative mt-6 inline-block px-8 py-4 rounded-2xl font-bold text-white overflow-hidden group shadow-2xl"
              style={{
                background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #3b82f6 100%)",
                backgroundSize: "200% 100%",
                animation: "gradientShift 3s ease infinite",
                boxShadow: "0 10px 40px rgba(59, 130, 246, 0.4)",
              }}
            >
              <span className="relative z-10 flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-ping" />
                Admisiones 2025
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </a>
          </li>

          {/* Botón Login mobile */}
          <li style={{ animation: "fadeInUp 0.5s ease forwards", animationDelay: "0.9s" }}>
            <a
              href="/login"
              onClick={() => setShowMobileMenu(false)}
              className={`relative inline-block border-2 px-8 py-4 rounded-2xl font-bold transition-all hover:scale-110 overflow-hidden group ${
                isDark
                  ? "border-yellow-400 text-yellow-400 hover:text-gray-900"
                  : "border-yellow-500 text-yellow-600 hover:text-white"
              }`}
              style={{
                boxShadow: isDark
                  ? "0 10px 40px rgba(251, 191, 36, 0.3)"
                  : "0 10px 40px rgba(234, 179, 8, 0.3)",
              }}
            >
              <span className="relative z-10">Login</span>
              <div
                className={`absolute inset-0 ${
                  isDark ? "bg-yellow-400" : "bg-yellow-500"
                } transform scale-0 group-hover:scale-100 transition-transform duration-500 rounded-2xl`}
              />
            </a>
          </li>
        </ul>
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