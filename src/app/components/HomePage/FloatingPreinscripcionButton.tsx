'use client';
import React, { useEffect, useState } from "react";

const FloatingButtons = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

  const buttons = [
    {
      href: "/cursos-vacacionales",
      topText: "Disponibles ahora",
      mainText: "Cursos Vacacionales",
      hoverGradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    },
    {
      href: "/PreInscripcion",
      topText: "Inscripciones abiertas",
      mainText: "2026",
      hoverGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    
  ];

  return (
    <>
      {/* Container de botones siempre expandido */}
      <div
        className={`fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 transition-all duration-500 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20 pointer-events-none"
        }`}
      >
        {/* Container con glassmorphism */}
        <div
          className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden"
          style={{
            width: isMobile ? "280px" : "320px",
          }}
        >
          {/* Botones */}
          <div>
            {buttons.map((button, index) => (
              <div key={index}>
                <button
                  onClick={() => {
                    window.location.href = button.href;
                  }}
                  className="group relative w-full overflow-hidden transition-all duration-300 hover:scale-[1.01] bg-transparent"
                >
                  {/* Fondo con gradiente sutil */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: button.hoverGradient }}
                  ></div>

                  {/* Contenido */}
                  <div className="relative flex items-center justify-center gap-3 p-4 sm:p-5">
                    {/* Texto */}
                    <div className="flex flex-col items-center leading-tight text-center">
                      <span className="text-[11px] sm:text-xs font-semibold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase group-hover:text-white/90 transition-colors duration-300">
                        {button.topText}
                      </span>
                      <span className={`font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent group-hover:text-white group-hover:bg-none transition-all duration-300 ${
                        button.mainText.length > 10 ? 'text-base sm:text-lg' : 'text-xl sm:text-2xl'
                      }`}>
                        {button.mainText}
                      </span>
                    </div>

                    {/* Flecha */}
                    <svg
                      className="flex-shrink-0 w-5 h-5 text-indigo-600 dark:text-indigo-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300"
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

                  {/* Shine effect sutil */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </button>
                
                {/* Línea divisora - solo si no es el último */}
                {index < buttons.length - 1 && (
                  <div className="h-px bg-slate-200/50 dark:bg-slate-700/50 mx-4"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
    </>
  );
};

export default FloatingButtons;