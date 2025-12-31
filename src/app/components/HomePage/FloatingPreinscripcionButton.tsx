'use client';
import React, { useEffect, useState } from "react";

const FloatingButtons = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const footer = document.getElementById("footer");
      if (footer) {
        const footerTop = footer.getBoundingClientRect().top;
        setIsVisible(footerTop > window.innerHeight);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const ButtonComponent = ({ href, topText, mainText, gradient, hoverColor }: { href: string; topText: string; mainText: string; gradient: string; hoverColor: string }) => (
    <button
      onClick={() => {
        window.location.href = href;
      }}
      className={`group relative overflow-hidden 
        bg-white/80 dark:bg-slate-900/80 
        text-slate-900 dark:text-white 
        px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-5 
        rounded-2xl shadow-xl ${hoverColor} 
        transition-all duration-500 hover:scale-105 
        border border-slate-200 dark:border-slate-700
        backdrop-blur-md
        w-[230px] sm:w-[260px] md:w-[280px]`}
    >
      {/* Brillo animado */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

      {/* Borde animado con gradiente */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: gradient,
          backgroundSize: "300% 300%",
          animation: "gradient 3s ease infinite",
          padding: "2px",
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      ></div>

      <div className="relative flex items-center gap-3 sm:gap-4">
        {/* Texto */}
        <div className="flex flex-col items-center leading-tight">
          <span className="text-[12px] sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase">
            {topText}
          </span>
          <span className={`font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent ${
            mainText.length > 10 ? 'text-base sm:text-lg' : 'text-xl sm:text-2xl'
          }`}>
            {mainText}
          </span>
        </div>

        {/* Flecha */}
        <svg
          className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400 group-hover:translate-x-2 transition-transform duration-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M13 7l5 5m0 0l-5 5m5-5H6"
          />
        </svg>
      </div>

      {/* Partículas decorativas */}
      <div className="absolute top-0 left-0 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-indigo-500 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce"></div>
      <div
        className="absolute bottom-0 right-0 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce"
        style={{ animationDelay: "0.2s" }}
      ></div>
    </button>
  );

  return (
    <>
      <div
        className={`fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 transition-all duration-500 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <ButtonComponent
          href="/PreInscripcion"
          topText="Inscripciones abiertas"
          mainText="2026"
          gradient="linear-gradient(45deg, #6366f1, #8b5cf6, #ec4899, #6366f1)"
          hoverColor="hover:shadow-indigo-500/30 dark:hover:shadow-indigo-400/30"
        />
      </div>

      <div
        className={`fixed bottom-32 right-6 sm:bottom-36 sm:right-8 z-50 transition-all duration-500 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
        style={{ transitionDelay: "100ms" }}
      >
        <ButtonComponent
          href="/cursos-vacacionales"
          topText="Disponibles ahora"
          mainText="Cursos Vacacionales"
          gradient="linear-gradient(45deg, #10b981, #3b82f6, #8b5cf6, #10b981)"
          hoverColor="hover:shadow-emerald-500/30 dark:hover:shadow-emerald-400/30"
        />
      </div>

      <style jsx>{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </>
  );
};

export default FloatingButtons;