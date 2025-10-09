"use client";
import React, { useEffect } from "react";
import Navbar from "./components/HomePage/Navbar";
import Nivels from './components/HomePage/Niveles';
import About from "./components/HomePage/About";
import Contact from "./components/HomePage/Contacts";
import Footer from "./components/HomePage/Footer";
import VerseSection from "./components/HomePage/Verse";
import Landing from "./components/HomePage/Landing";


function Page() {
  useEffect(() => {
    const header = document.getElementById("Inicio");
    const handleMouseMove = (e: { clientX: number; clientY: number; }) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 10;
      const y = (e.clientY / innerHeight - 0.5) * 10;
      if (header) {
        header.style.backgroundPosition = `${50 + x}% ${50 + y}%`;
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);
  return (
    <>
    <Landing/>
    <About/>
    <Nivels/>
    <Contact/>
    <Footer/>
    </>
  );
}

export default Page;
