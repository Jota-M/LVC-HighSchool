import HomeLevelPage from "@/app/components/HomePage/HomeLevelPage";
import ScienceIcon from "@mui/icons-material/Science";
import PaletteIcon from "@mui/icons-material/Palette";
import EmojiPeopleIcon from "@mui/icons-material/EmojiPeople";
import CalculateIcon from "@mui/icons-material/Calculate";
import SelfImprovementIcon from "@mui/icons-material/SelfImprovement";

export default function InicialPage() {
  const gradesContent = {
    "Pre-Kinder": {
      title: "Pre-Kinder",
      subtitle: "Explorando el mundo con juegos y canciones",
      objetivos: [
        {
          titulo: "Desarrollo socioemocional",
          descripcion: "Fomentar la curiosidad y la socialización.",
        },
        {
          titulo: "Desarrollo cognitivo",
          descripcion: "Estimular la observación y la memoria.",
        },
        {
          titulo: "Desarrollo físico",
          descripcion: "Fortalecer la motricidad gruesa y fina.",
        },
      ],
      materias: [
        {
          Materia: "Desarrollo bio-psicomotriz (Ciencias Naturales)",
          Horas: "10 h/mes",
          color: "#c62828",
          Icono: ScienceIcon,
          temas: [
            "Exploración de los sentidos",
            "Identificación de partes del cuerpo",
            "Movimientos básicos: caminar, correr, saltar",
          ],
        },
        {
          Materia: "Comunicación, Lenguaje y Artes (Música, APV, CS, recreación)",
          Horas: "6 h/mes",
          color: "#ff9800",
          Icono: PaletteIcon,
          temas: [
            "Canciones con gestos y movimientos",
            "Dibujo libre y reconocimiento de colores",
            "Juegos simbólicos y dramatización",
          ],
        },
        {
          Materia: "Desarrollo Sociocultural, Afectivo y Espiritual",
          Horas: "6 h/mes",
          color: "#2e7d32",
          Icono: EmojiPeopleIcon,
          temas: [
            "Relaciones con pares y adultos",
            "Reconocimiento de emociones propias y ajenas",
            "Participación en actividades grupales",
          ],
        },
        {
          Materia: "Conocimientos y Producción (Matemáticas y Tecnología)",
          Horas: "4 h/mes",
          color: "#e91e63",
          Icono: CalculateIcon,
          temas: [
            "Conteo de objetos hasta el 5",
            "Clasificación por color y forma",
            "Exploración de materiales y herramientas simples",
          ],
        },
        {
          Materia: "Valores y Espiritualidad",
          Horas: "4 h/mes",
          color: "#9c27b0",
          Icono: SelfImprovementIcon,
          temas: [
            "Prácticas de cortesía: por favor, gracias",
            "Respeto por el entorno y los demás",
            "Rutinas de cuidado personal y colectivo",
          ],
        },
      ],
    },
    "Kinder": {
      title: "Kinder",
      subtitle: "Aprender jugando y explorando",
      objetivos: [
        {
          titulo: "Desarrollo cognitivo",
          descripcion: "Estimular la atención y creatividad.",
        },
        {
          titulo: "Desarrollo socioemocional",
          descripcion: "Favorecer la colaboración y empatía.",
        },
        {
          titulo: "Desarrollo físico",
          descripcion: "Coordinar movimientos más complejos.",
        },
        {
          titulo: "Desarrollo artístico",
          descripcion: "Fomentar la expresión a través de la música y el arte.",
        },
      ],
      materias: [
        {
          Materia: "Desarrollo bio-psicomotriz (Ciencias Naturales)",
          Horas: "10 h/mes",
          color: "#c62828",
          Icono: ScienceIcon,
          temas: [
            "Coordinación motriz gruesa y fina",
            "Identificación de animales y plantas",
            "Exploración de texturas y materiales",
          ],
        },
        {
          Materia: "Comunicación, Lenguaje y Artes (Música, APV, CS, recreación)",
          Horas: "6 h/mes",
          color: "#ff9800",
          Icono: PaletteIcon,
          temas: [
            "Narración de cuentos con imágenes",
            "Creación de sonidos con instrumentos",
            "Expresión artística con materiales reciclables",
          ],
        },
        {
          Materia: "Desarrollo Sociocultural, Afectivo y Espiritual",
          Horas: "6 h/mes",
          color: "#2e7d32",
          Icono: EmojiPeopleIcon,
          temas: [
            "Identificación y respeto por la diversidad cultural",
            "Resolución de conflictos de manera pacífica",
            "Participación en actividades comunitarias",
          ],
        },
        {
          Materia: "Conocimientos y Producción (Matemáticas y Tecnología)",
          Horas: "4 h/mes",
          color: "#e91e63",
          Icono: CalculateIcon,
          temas: [
            "Conteo hasta el 10 y reconocimiento de números",
            "Construcción de secuencias y patrones",
            "Uso de herramientas básicas para la creación",
          ],
        },
        {
          Materia: "Valores y Espiritualidad",
          Horas: "4 h/mes",
          color: "#9c27b0",
          Icono: SelfImprovementIcon,
          temas: [
            "Prácticas de solidaridad y cooperación",
            "Cuidado del medio ambiente",
            "Reflexión sobre acciones y consecuencias",
          ],
        },
      ],
    },
  };

  return (
    <HomeLevelPage
      levelTitle="Plan de estudios - Nivel Inicial"
      levelDescription="Formación integral para niños de 3 a 4 años"
      gradesContent={gradesContent}
      toggleLabels={["Pre-Kinder", "Kinder"]}
    />
  );
}
