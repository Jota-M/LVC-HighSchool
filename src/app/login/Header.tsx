"use client";

import React, { useState, useEffect, useContext } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import { IconButton, useTheme } from "@mui/material";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import { ColorModeContext } from "../dashboard/theme";

function Navbar() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const isDark = theme.palette.mode === "dark";

  // 🔥 Evita hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Scroll SOLO en cliente
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // inicial

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Mouse SOLO en cliente
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleLogoClick = () => {
    if (typeof window === "undefined") return;

    if (window.location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.location.href = "/";
    }
  };

  const isClientReady = mounted;

  return (
    <>
      <div
        className={`fixed top-0 left-0 w-full z-[60] transition-all duration-700 ${scrolled
            ? isDark
              ? "bg-gray-900/80 backdrop-blur-xl shadow-2xl shadow-blue-500/10 border-b border-blue-500/20"
              : "bg-white/80 backdrop-blur-xl shadow-2xl shadow-blue-500/10 border-b border-blue-200/40"
            : "bg-transparent"
          }`}
        style={{
          animation: "slideDown 0.8s ease-out",
        }}
      >
        {/* 🔥 EFECTO SOLO CUANDO YA MONTÓ CLIENTE */}
        {scrolled && isClientReady && (
          <div
            className="absolute inset-0 pointer-events-none opacity-50"
            style={{
              background: isDark
                ? `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59,130,246,0.15), transparent 60%)`
                : `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(147,197,253,0.2), transparent 60%)`,
            }}
          />
        )}

        <div className="container mx-auto flex justify-between items-center py-5 px-6 md:px-20 lg:px-32 relative z-10">
          {/* LOGO */}
          <div
            className="relative group flex items-center cursor-pointer"
            onClick={handleLogoClick}
          >
            <img
              src="/logo.png"
              alt="Logo"
              className="w-20 hover:scale-110 transition-all duration-500"
            />

            <div className="ml-3 text-xl font-bold select-none">
              <h3 className="text-sm md:text-base bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                Unidad Educativa Particular La Voz de Cristo
              </h3>
              <p className="text-xs text-gray-300">Plataforma Educativa</p>
            </div>
          </div>

          {/* CONTROLES */}
          <div className="flex items-center gap-4">
            {/* DARK MODE */}
            <IconButton
              onClick={colorMode.toggleColorMode}
              sx={{
                color: scrolled
                  ? isDark
                    ? "#e5e7eb"
                    : "#1f2937"
                  : "#ffffff",
              }}
            >
              {isDark ? (
                <DarkModeOutlinedIcon />
              ) : (
                <LightModeOutlinedIcon />
              )}
            </IconButton>

            {/* MENU MOBILE */}
            <div
              className={`md:hidden cursor-pointer ${scrolled
                  ? isDark
                    ? "text-gray-200"
                    : "text-gray-800"
                  : "text-white"
                }`}
              onClick={() => setShowMobileMenu(true)}
            >
              <MenuIcon sx={{ width: 32, height: 32 }} />
            </div>
          </div>
        </div>
      </div>

      {/* CSS ANIMACIONES */}
      <style jsx>{`
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
      `}</style>
    </>
  );
}

export default Navbar;