import React, { useEffect, useState, } from "react";
import { useTheme } from "@mui/material";

function About() {
  const [isVisible, setIsVisible] = useState(false);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div
    id="Nosotros"
      style={{
        backgroundColor: isDarkMode ? "#010c17" : "#fff",
        color: isDarkMode ? "#fff" : "#000",
        padding: "80px 20px",
        position: "relative",
        overflow: "hidden",
        minHeight: "100vh",
      }}
    >
      {/* Fondo con gradiente animado */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "300px",
          background: isDarkMode
            ? "radial-gradient(ellipse at top, rgba(1, 87, 155, 0.15), transparent)"
            : "radial-gradient(ellipse at top, rgba(1, 87, 155, 0.08), transparent)",
          animation: "pulse 8s ease-in-out infinite",
        }}
      />

      <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Sección Principal */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "40px", marginBottom: "60px" }}>
          {/* Texto Principal */}
          <div
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateX(0)" : "translateX(-50px)",
              transition: "all 1s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            <div style={{ color: "#01579b", fontWeight: "bold", fontSize: "14px", letterSpacing: "2px", marginBottom: "10px" }}>
              SOBRE NOSOTROS
            </div>
            <h1
              style={{
                color: "#01579b",
                fontWeight: "bold",
                fontSize: "clamp(1.8rem, 4vw, 3rem)",
                lineHeight: 1.3,
                marginBottom: "20px",
                animation: "glow 3s ease-in-out infinite",
              }}
            >
              Una educación con{" "}
              <span
                style={{
                  color: "#facc15",
                  display: "inline-block",
                  animation: "shimmer 2s ease-in-out infinite",
                }}
              >
                propósito eterno
              </span>
            </h1>
            <p style={{ fontSize: "1.1rem", lineHeight: 1.6, color: isDarkMode ? "#ccc" : "#555" }}>
              Formamos estudiantes íntegros a través de una educación Cristocéntrica con excelencia académica fundamentada en principios bíblicos. 
              Nuestro compromiso es desarrollar el potencial de cada niño y joven, preparándolos para ser líderes transformadores 
              en la sociedad con un corazón conforme a Cristo.
            </p>
          </div>

          {/* Imagen */}
          <div
            style={{
              position: "relative",
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateX(0) scale(1)" : "translateX(50px) scale(0.9)",
              transition: "all 1s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s",
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800"
              alt="Estudiantes"
              style={{
                width: "100%",
                borderRadius: "16px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                objectFit: "cover",
                transition: "transform 0.5s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            />
            <div
              style={{
                position: "absolute",
                top: -10,
                right: -10,
                width: 100,
                height: 100,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #01579b, #facc15)",
                opacity: 0.6,
                filter: "blur(40px)",
                animation: "pulse 4s ease-in-out infinite",
              }}
            />
          </div>
        </div>

        {/* Misión y Visión */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "40px", marginBottom: "80px" }}>
          <InfoCard title="Misión" text="La misión de la Unidad Educativa es formar estudiantes reflexivos, respetuosos, tolerantes 
y productivos, con una formación integral en aulas implementadas adecuadamente, con 
personal actualizado y comprometido con la identidad de la Unidad Educativa Particular 
“La Voz de Cristo” con “Principios Cristianos”, con la misión de ayuda al prójimo, y que 
responda a las necesidades socio-culturales de la comunidad. 
Contar con una educación innovadora, para el desarrollo integral, basado en Principios y 
Valores Cristianos, solidarios y éticos, de conciencia de preservación y mantenimiento del 
medio ambiente. " isDark={isDarkMode} delay={0.4} />
          <InfoCard title="Visión" text="Elevar la calidad educativa a través de la implementación de nuevos conceptos 
pedagógicos, formando estudiantes con criterio propio, analíticos y reflexivos, 
investigadores, participativos, lectores y productores de textos, basado en la equidad de 
género. Partimos de nuestra propuesta educativa que integra ciencia, tecnología, arte y cultura, con 
enfoque Cristo céntrico, que forma seres humanos dignos, fraternos, competentes, justos, 
solidarios, comprometidos y capaces de liderar procesos de cambio en la familia y la 
sociedad, para un estado más justo, solidario y humano." isDark={isDarkMode} delay={0.6} />
        </div>

        {/* Divisor */}
        <div
          style={{
            margin: "60px auto",
            height: "1px",
            background: isDarkMode ? "#333" : "#ddd",
            position: "relative",
            maxWidth: "200px",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: "60px",
              height: "3px",
              background: "linear-gradient(90deg, #01579b, #facc15)",
              borderRadius: "2px",
            }}
          />
        </div>

        {/* Pilares */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ color: "#01579b", fontWeight: "bold", fontSize: "14px", letterSpacing: "2px", marginBottom: "10px" }}>
            NUESTROS PILARES FUNDAMENTALES
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "40px", marginBottom: "60px" }}>
          {[
            { title: "Fe", img: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=400" },
            { title: "Educación", img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400" },
            { title: "Servicio", img: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400" },
            { title: "Unidad", img: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400" },
          ].map((p, index) => (
            <Pillar key={p.title} {...p} index={index} />
          ))}
        </div>

        {/* Versículo */}
        <div
          style={{
            marginTop: "60px",
            textAlign: "center",
            fontStyle: "italic",
            fontSize: "clamp(1.4rem, 3vw, 1.8rem)",
            lineHeight: 1.7,
            color: isDarkMode ? "#FFD700" : "#FFAA00",
            padding: "40px 30px",
            borderRadius: "12px",
            background: isDarkMode
              ? "linear-gradient(135deg, rgba(255,215,0,0.05), rgba(255,215,0,0.15))"
              : "linear-gradient(135deg, rgba(255,170,0,0.05), rgba(255,170,0,0.15))",
            boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
            border: "1px solid rgba(255,215,0,0.2)",
            position: "relative",
            overflow: "hidden",
            opacity: 0,
            animation: "fadeUpScale 1s ease forwards 1.5s",
            transition: "all 0.4s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.02)";
            e.currentTarget.style.boxShadow = "0 12px 30px rgba(255,215,0,0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.1)";
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "-100%",
              width: "100%",
              height: "100%",
              background: "linear-gradient(90deg, transparent, rgba(255,215,0,0.1), transparent)",
              animation: "shine 3s ease-in-out infinite",
            }}
          />
          <div
            style={{
              marginBottom: "15px",
              height: "2px",
              width: "60px",
              margin: "0 auto 15px",
              background: isDarkMode ? "#FFD700" : "#FFAA00",
              borderRadius: "2px",
            }}
          />
          "“Sed, pues, vosotros perfectos, como vuestro Padre que está en los cielos es perfecto."
          <br />
          <strong> Mateo 5:48</strong>
          <div
            style={{
              marginTop: "15px",
              height: "2px",
              width: "60px",
              margin: "15px auto 0",
              background: isDarkMode ? "#FFD700" : "#FFAA00",
              borderRadius: "2px",
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes fadeUpScale {
          0% { opacity: 0; transform: translateY(50px) scale(0.8); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes glow {
          0%, 100% { text-shadow: 0 0 8px rgba(21, 101, 192, 0.3); }
          50% { text-shadow: 0 0 20px rgba(21, 101, 192, 0.6); }
        }
        @keyframes shimmer {
          0%, 100% { text-shadow: 0 0 10px rgba(250, 204, 21, 0.5); }
          50% { text-shadow: 0 0 25px rgba(250, 204, 21, 0.8); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes shine {
          0% { left: -100%; }
          100% { left: 200%; }
        }
        @keyframes rotateGradient {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

interface InfoCardProps {
  title: string;
  text: string;
  isDark: boolean;
  delay?: number;
}

function InfoCard({ title, text, isDark, delay = 0 }: InfoCardProps) {
  return (
    <div
      style={{
        border: "2px solid transparent",
        borderRadius: "12px",
        padding: "30px",
        backgroundColor: isDark ? "#071929" : "#fafafa",
        boxShadow: isDark ? "0 8px 24px rgba(0,0,0,0.4)" : "0 8px 24px rgba(0,0,0,0.1)",
        position: "relative",
        overflow: "hidden",
        opacity: 0,
        transform: "translateY(30px)",
        animation: `fadeUpScale 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`,
        animationDelay: `${delay}s`,
        transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-10px) scale(1.02)";
        e.currentTarget.style.boxShadow = isDark 
          ? "0 16px 40px rgba(1, 87, 155, 0.5)" 
          : "0 16px 40px rgba(1, 87, 155, 0.3)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.boxShadow = isDark 
          ? "0 8px 24px rgba(0,0,0,0.4)" 
          : "0 8px 24px rgba(0,0,0,0.1)";
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #01579b, #facc15)",
          opacity: 0.1,
          animation: "pulse 3s ease-in-out infinite",
        }}
      />
      <h3
        style={{
          color: "#FFD54F",
          fontWeight: "bold",
          fontSize: "1.8rem",
          marginBottom: "15px",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          lineHeight: 1.8,
          textAlign: "center",
          position: "relative",
          zIndex: 1,
          fontSize: "1rem",
        }}
      >
        {text}
      </p>
    </div>
  );
}

interface PillarProps {
  title: string;
  img: string;
  index: number;
}

function Pillar({ title, img, index }: PillarProps) {
  return (
    <div
      style={{
        width: 200,
        textAlign: "center",
        cursor: "pointer",
        opacity: 0,
        transform: "translateY(50px) scale(0.8)",
        animation: `fadeUpScale 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`,
        animationDelay: `${0.8 + index * 0.15}s`,
        transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
      onMouseEnter={(e) => {
        const img = e.currentTarget.querySelector("img");
        e.currentTarget.style.transform = "scale(1.1) rotate(2deg)";
        if (img) {
          img.style.boxShadow = "0 12px 40px rgba(1, 87, 155, 0.6)";
          img.style.borderColor = "#facc15";
        }
      }}
      onMouseLeave={(e) => {
        const img = e.currentTarget.querySelector("img");
        e.currentTarget.style.transform = "scale(1) rotate(0deg)";
        if (img) {
          img.style.boxShadow = "0 8px 30px rgba(1, 87, 155, 0.4)";
          img.style.borderColor = "#01579b";
        }
      }}
    >
      <img
        src={img}
        alt={title}
        style={{
          width: "100%",
          height: 200,
          objectFit: "cover",
          borderRadius: "50%",
          border: "4px solid #01579b",
          boxShadow: "0 8px 30px rgba(1, 87, 155, 0.4)",
          transition: "all 0.4s ease",
        }}
      />
      <h4 style={{ marginTop: "15px", fontWeight: "bold", color: "#01579b", fontSize: "1.2rem" }}>
        {title}
      </h4>
    </div>
  );
}

export default About;