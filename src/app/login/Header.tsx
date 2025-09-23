"use client";
import React, { useState } from "react";

function Header() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <div className="fixed top-0 left-0 w-full z-20 shadow">
      <div className="max-w-screen-xl mx-auto flex justify-between items-center py-4 px-6 md:px-20 lg:px-32 text-white">
        <div className="flex items-center gap-4">
          <img src="./logo.png" alt="Logo" className="w-12" />
          <div>
            <h1 className="text-sm md:text-base lg:text-base font-bold leading-tight">
              Unidad Educativa la Particular La Voz de Cristo
            </h1>
            <p className="text-yellow-400 text-sm">Plataforma Educativa</p>
          </div>
        </div>

        {/* Icono Mobile */}
        <div className="md:hidden cursor-pointer text-black">
          <svg
            onClick={() => setShowMobileMenu(true)}
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed top-0 right-0 h-screen w-full bg-white transition-transform duration-300 z-30 ${
          showMobileMenu ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-end p-4 cursor-pointer">
          <svg
            onClick={() => setShowMobileMenu(false)}
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-black"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <ul className="flex flex-col items-center gap-5 text-lg font-medium text-black">
          <a onClick={() => setShowMobileMenu(false)} href="/Preinscripcion">Cancelar</a>
        </ul>
      </div>
    </div>
  );
}

export default Header;
