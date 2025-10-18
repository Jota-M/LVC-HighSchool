"use client";
import React, { useEffect, useRef } from "react";
import Navbar from "./components/HomePage/Navbar";
import Nivels from "./components/HomePage/Niveles";
import About from "./components/HomePage/About";
import Contact from "./components/HomePage/Contacts";
import Footer from "./components/HomePage/Footer";
import VerseSection from "./components/HomePage/Verse";
import Landing from "./components/HomePage/Landing";

const sectionStyle: React.CSSProperties = {
  opacity: 0,
  transform: "translateY(50px)",
  transition: "opacity 1s ease-out, transform 1s ease-out",
};

function Page() {
  const sectionsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Parallax en el header
    const header = document.getElementById("Inicio");
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 10;
      const y = (e.clientY / innerHeight - 0.5) * 10;
      if (header) {
        header.style.backgroundPosition = `${50 + x}% ${50 + y}%`;
      }
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.opacity = "1";
            (entry.target as HTMLElement).style.transform = "translateY(0)";
          }
        });
      },
      { threshold: 0.15 }
    );

    sectionsRef.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      observer.disconnect();
    };
  }, []);

  // Función para asignar refs sin devolver nada
  const setSectionRef = (index: number) => (el: HTMLDivElement | null): void => {
    sectionsRef.current[index] = el;
  };

  return (
    <>
      <Landing />
      <div ref={setSectionRef(0)} style={sectionStyle}>
        <About />
      </div>

      <div ref={setSectionRef(1)} style={sectionStyle}>
        <Nivels />
      </div>

      <div ref={setSectionRef(2)} style={sectionStyle}>
        <Contact />
      </div>

    
        <Footer />
     
    </>
  );
}

export default Page;
