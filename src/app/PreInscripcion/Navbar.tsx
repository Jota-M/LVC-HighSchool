"use client";
import React, { useState, useEffect, useContext } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { Button, IconButton, Typography, Box, useTheme } from "@mui/material";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import { ColorModeContext } from "../dashboard/theme"; 

function Navbar() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
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
  return (
    <div
      className={`fixed top-0 left-0 w-full z-50 transition duration-500 ${
        scrolled
        ? "bg-white/70 dark:bg-gray-900/70 backdrop-blur-md shadow-md"
        : "dark:bg-transparent"

      }`}
    >
      <div className="container mx-auto flex justify-between items-center py-4 px-6 md:px-20 lg:px-32">
        {/* Logo + Nombre */}
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-14 cursor-pointer hover:scale-110 transition-transform"
            onClick={handleLogoClick}
          />
          <Box>
            <Typography
                variant="subtitle1"
                sx={{
                    fontSize: { xs: "0.9rem", md: "1rem" },
                    fontWeight: "bold",
                    lineHeight: 1.4,
                    color: scrolled
                    ? "#ffffff"
                    : theme.palette.mode === "dark"
                    ? "white"
                    : "#01579b",
                }}
                >
                Unidad Educativa Particular La Voz de Cristo
                </Typography>
                <Typography
                variant="body2"
                sx={{
                    fontSize: "0.9rem",
                    color: scrolled
                    ? "#e0e0e0"
                    : theme.palette.text.secondary,
                }}
                >
                Admisiones 2025
            </Typography>
          </Box>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {/* Botón Admisiones */}
          <button className="relative bg-blue-700 px-6 py-2 rounded-lg text-white shadow-lg overflow-hidden hover:bg-green-600 transition-transform transform hover:scale-105 active:scale-95 before:absolute before:inset-0 before:bg-white/20 before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700">
            <a href="/PreInscripcion/estado">Estado Pre-inscripción</a>
          </button>

          {/* Toggle Dark/Light */}
          <IconButton onClick={colorMode.toggleColorMode}>
            {theme.palette.mode === "dark" ? (
              <DarkModeOutlinedIcon />
            ) : (
              <LightModeOutlinedIcon />
            )}
          </IconButton>
        </div>

        {/* Icono Mobile */}
        <div className="md:hidden cursor-pointer transition-transform duration-300 hover:scale-110">
          <MenuIcon
            onClick={() => setShowMobileMenu(true)}
            sx={{ width: 32, height: 32 }}
          />
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed top-0 right-0 h-screen w-full bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl transition-transform duration-500 ease-in-out ${
          showMobileMenu ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-end p-4">
          <CloseIcon
            onClick={() => setShowMobileMenu(false)}
            sx={{
              width: 32,
              height: 32,
              transition: "transform 0.3s",
              cursor: "pointer",
              "&:hover": {
                transform: "rotate(90deg)",
              },
            }}
          />
        </div>

        <ul className="flex flex-col items-center gap-6 mt-10 text-lg font-medium text-black dark:text-white">
          <li className="animate-fadeInUp">
            <a
              href="/Preinscripcion"
              onClick={() => setShowMobileMenu(false)}
              className="transition-all duration-300 hover:text-blue-700 hover:scale-110"
            >
              Estado Pre-inscripción
            </a>
          </li>
          <li className="animate-fadeInUp">
            <a
              href="#SobreNosotros"
              onClick={() => setShowMobileMenu(false)}
              className="transition-all duration-300 hover:text-blue-700 hover:scale-110"
            >
              Nosotros
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Navbar;
