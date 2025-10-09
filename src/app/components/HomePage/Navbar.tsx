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

  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

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

  const handleLogoClick = () => {
    if (window.location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.location.href = "/";
    }
  };

  const menuItems = ["Inicio", "Nosotros", "Niveles", "Contactos"];

  return (
    <div
      className={`fixed top-0 left-0 w-full z-[60] transition duration-500 ${
        scrolled ? "bg-white/70 backdrop-blur-md shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex justify-between items-center py-4 px-6 md:px-20 lg:px-32 text-black">
        {/* Logo */}
        <img
          src="/logo.png"
          alt="Logo"
          className="w-20 cursor-pointer hover:scale-110 transition-transform"
          onClick={handleLogoClick}
        />

        {/* Desktop Nav */}
        <ul className="hidden md:flex gap-8 font-medium items-center">
          {menuItems.map((item, index) => {
            const link = `#${item.replace(/\s+/g, "")}`;
            return (
              <a
                key={index}
                href={link}
                className={`relative group transition-all duration-300 ${
                  activeSection === item
                    ? "text-blue-700 font-semibold"
                    : scrolled
                    ? "text-black"
                    : "text-white"
                }`}
              >
                {item}
                <span
                  className={`block h-[2px] bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}
                ></span>
              </a>
            );
          })}

          {/* Botón Admisiones */}
          {/* Botón Login */}
          
          <a
            href="/PreInscripcion"
            className="bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold shadow-md hover:bg-green-600 transition-transform hover:scale-105"
          >
            Admisiones 2025
          </a>
          <a
            href="/login"
            className="px-6 py-2 rounded-lg font-semibold border-2 border-yellow-400 text-yellow-400 bg-transparent hover:bg-yellow-400 hover:text-black transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-md"
          >
            Login
          </a>
          
        </ul>

        {/* Controles derecha */}
        <div className="flex items-center gap-4">
          <IconButton onClick={colorMode.toggleColorMode}>
            {theme.palette.mode === "dark" ? (
              <DarkModeOutlinedIcon />
            ) : (
              <LightModeOutlinedIcon />
            )}
          </IconButton>

          {/* Ícono menú móvil */}
          <div
            className="md:hidden cursor-pointer transition-transform duration-300 hover:scale-110"
            onClick={() => setShowMobileMenu(true)}
          >
            <MenuIcon sx={{ width: 32, height: 32 }} />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 left-0 h-screen w-full z-[70] bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center text-black dark:text-white transition-all duration-500 ${
          showMobileMenu
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute top-6 right-6">
          <CloseIcon
            onClick={() => setShowMobileMenu(false)}
            sx={{
              width: 36,
              height: 36,
              cursor: "pointer",
              transition: "transform 0.3s",
              "&:hover": { transform: "rotate(90deg)" },
            }}
          />
        </div>

        <ul className="flex flex-col items-center gap-6 text-xl font-semibold transition-all duration-500">
          {menuItems.map((item, index) => {
            const link = `#${item.replace(/\s+/g, "")}`;
            return (
              <li
                key={index}
                className="transform transition-all duration-500 hover:scale-110 hover:text-blue-700 dark:hover:text-blue-400"
                style={{
                  animation: `fadeInUp 0.4s ease forwards`,
                  animationDelay: `${index * 0.1 + 0.2}s`,
                }}
              >
                <a href={link} onClick={() => setShowMobileMenu(false)}>
                  {item}
                </a>
              </li>
            );
          })}

          {/* Botón Admisiones */}
          <li
            style={{ animation: "fadeInUp 0.4s ease forwards", animationDelay: "0.7s" }}
          >
            <a
              href="/PreInscripcion"
              onClick={() => setShowMobileMenu(false)}
              className="mt-4 inline-block bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold shadow-md hover:bg-green-600 transition-transform hover:scale-110"
            >
              Admisiones 2025
            </a>
          </li>

          {/* Botón Login */}
          <li
            style={{ animation: "fadeInUp 0.4s ease forwards", animationDelay: "0.9s" }}
          >
            <a
              href="/login"
              onClick={() => setShowMobileMenu(false)}
              className="mt-2 inline-block border-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white transition-all hover:scale-110"
            >
              Login
            </a>
          </li>
        </ul>
      </div>

      {/* Animaciones personalizadas */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default Navbar;
