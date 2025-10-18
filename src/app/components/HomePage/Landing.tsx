import React from 'react'
import Navbar from './Navbar'

function Landing() {
  return (
    <section
  id="Inicio"
  className="relative w-full min-h-screen bg-fixed bg-cover bg-center overflow-hidden px-4 flex items-center justify-center scroll-smooth"
  style={{ backgroundImage: "url('/Fondo.svg')" }}
>
  <Navbar />

  <div className="max-w-7xl w-full flex flex-col md:grid md:grid-cols-2 gap-10 items-center">
    {/* Texto */}
    <div className="space-y-6 text-center md:text-left animate-fadeIn">
      <h1 className="text-4xl md:text-5xl font-bold leading-tight text-white drop-shadow-xl tracking-tight">
        Educación Con{" "}
        <span className="text-yellow-300 decoration-yellow-400 decoration-4 animate-pulse">
          Valores Cristianos
        </span>{" "}
        Y{" "}
        <span className="text-yellow-300 decoration-yellow-400 decoration-4 animate-pulse">
          Excelencia Académica
        </span>
      </h1>

      <p className="text-lg text-gray-200 animate-fadeIn delay-500">
        Unidad Educativa Particular La Voz De Cristo.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
        <button
          className="relative overflow-hidden bg-yellow-400 text-gray-900 px-6 py-3 rounded-lg font-semibold shadow-xl ring-1 ring-yellow-300 hover:ring-yellow-500 transition-all duration-300 hover:bg-yellow-500 transform hover:scale-105 active:scale-95"
        >
          Conócenos
        </button>
        <button
          className="relative overflow-hidden bg-white text-black px-6 py-3 rounded-lg font-semibold shadow-xl hover:bg-blue-700 hover:text-white ring-1 ring-white transition-all duration-300 hover:ring-blue-300 transform hover:scale-105 active:scale-95"
        >
          Solicitar información
        </button>
      </div>
    </div>

    <img
      src="/logo.png"
      alt="Logo decorativo de la institución"
      loading="lazy"
      className="hidden md:block w-72 mx-auto opacity-0 animate-fadeIn delay-700 animate-bounce-slow"
    />
  </div>
</section>

  )
}

export default Landing
