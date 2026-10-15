"use client";
import React, { useState, useEffect, useContext } from "react";
import { IconButton, Typography, Box, useTheme, Button } from "@mui/material";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import SearchIcon from "@mui/icons-material/Search";
import HomeIcon from "@mui/icons-material/Home";
import { ColorModeContext } from "../dashboard/theme";

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const isDark = theme.palette.mode === "dark";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
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
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled
        ? isDark
          ? "bg-gray-900/95 backdrop-blur-xl shadow-2xl shadow-blue-500/10 border-b border-blue-500/20"
          : "bg-white/95 backdrop-blur-xl shadow-lg shadow-blue-900/5 border-b border-blue-100"
        : "bg-transparent"
        }`}
    >
      <div className="container mx-auto flex justify-between items-center py-5 px-6 md:px-20 lg:px-32">
        {/* Logo (tamaño w-20 igual que la página principal) + Nombre */}
        <div
          className="flex items-center gap-4 cursor-pointer select-none group"
          onClick={handleLogoClick}
        >
          <img
            src="/logo.png"
            alt="Logo"
            className="w-16 md:w-20 cursor-pointer hover:scale-105 transition-transform duration-300 drop-shadow-md"
          />
          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: { xs: "0.95rem", md: "1.15rem" },
                fontWeight: 800,
                lineHeight: 1.3,
                color: isDark ? "#ffffff" : "#01579b",
                letterSpacing: "0.01em",
              }}
            >
              Unidad Educativa Particular La Voz de Cristo
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: { xs: "0.8rem", md: "0.9rem" },
                fontWeight: 700,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: isDark ? "#facc15" : "#0288d1",
              }}
            >
              Admisiones 2026
            </Typography>
          </Box>
        </div>

        {/* Acciones derecha: Estado + Toggle Theme */}
        <div className="flex items-center gap-3">
          {/* Toggle Dark/Light Mode */}
          <IconButton
            onClick={colorMode.toggleColorMode}
            sx={{
              color: isDark ? "#facc15" : "#01579b",
              bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(1, 87, 155, 0.08)",
              border: "1px solid",
              borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(1, 87, 155, 0.15)",
              p: 1.1,
              "&:hover": {
                bgcolor: isDark ? "rgba(255,255,255,0.15)" : "rgba(1, 87, 155, 0.15)",
                transform: "rotate(180deg)",
              },
              transition: "all 0.4s ease",
            }}
          >
            {isDark ? <DarkModeOutlinedIcon sx={{ fontSize: 20 }} /> : <LightModeOutlinedIcon sx={{ fontSize: 20 }} />}
          </IconButton>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
