import HomeLevelPage from "@/app/components/HomePage/HomeLevelPage";
import CalculateIcon from "@mui/icons-material/Calculate";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PublicIcon from "@mui/icons-material/Public";
import BrushIcon from "@mui/icons-material/Brush";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import BuildIcon from "@mui/icons-material/Build";
import ScienceIcon from "@mui/icons-material/Science";
import FavoriteIcon from "@mui/icons-material/Favorite";

export default function PrimariaPage() {
  const gradesContent = {
    "1roP": {
      title: "Primer Grado de Primaria",
      subtitle: "Descubriendo el mundo con curiosidad y alegría",
      objetivos: [
        { titulo: "Lectoescritura", descripcion: "Fomentar el gusto por leer y escribir." },
        { titulo: "Matemática básica", descripcion: "Desarrollar habilidades numéricas y de conteo." },
        { titulo: "Desarrollo socioemocional", descripcion: "Favorecer la convivencia y la cooperación." },
      ],
      materias: [
        { Materia: "Matemáticas", Horas: "20 h/mes", color: "#1976d2", Icono: CalculateIcon,
          temas: ["Números y conteo", "Suma básica", "Resta básica", "Formas y espacios", "Patrones simples"] },
        { Materia: "Lenguaje", Horas: "44 h/mes", color: "#c62828", Icono: MenuBookIcon,
          temas: ["Reconocimiento de letras", "Lectura de palabras simples", "Escritura de frases", "Ortografía inicial", "Comprensión de cuentos"] },
        { Materia: "Ciencias Sociales", Horas: "8 h/mes", color: "#6a1b9a", Icono: PublicIcon,
          temas: ["Mi familia y comunidad", "Mi escuela", "Reglas en casa", "Eventos en mi barrio", "Tradiciones locales"] },
        { Materia: "Artes Plásticas", Horas: "8 h/mes", color: "#ff9800", Icono: BrushIcon,
          temas: ["Colores primarios", "Dibujo libre", "Modelado con plastilina", "Recorte y pegado", "Exposición de la obra"] },
        { Materia: "Educación Física y Deportes", Horas: "8 h/mes", color: "#2e7d32", Icono: SportsSoccerIcon,
          temas: ["Coordinación motora", "Carreras y saltos", "Juegos de grupo simples", "Equilibrio y desplazamiento", "Normas de juego"] },
        { Materia: "Educación Musical", Horas: "8 h/mes", color: "#e91e63", Icono: MusicNoteIcon,
          temas: ["Ritmo básico", "Canciones infantiles", "Instrumentos de percusión simples", "Movimientos con música", "Escucha musical"] },
        { Materia: "Técnica Tecnológica", Horas: "8 h/mes", color: "#455a64", Icono: BuildIcon,
          temas: ["Herramientas básicas", "Construcción simple", "Trabajo manual con materiales", "Seguridad en taller", "Presentación del proyecto"] },
        { Materia: "Ciencias Naturales", Horas: "8 h/mes", color: "#43a047", Icono: ScienceIcon,
          temas: ["Los seres vivos", "El agua y su uso", "El cielo y el clima", "Plantas en el entorno", "Animales de mi región"] },
        { Materia: "Valores, Espiritualidades y Religión", Horas: "8 h/mes", color: "#9c27b0", Icono: FavoriteIcon,
          temas: ["Amistad y compañerismo", "Respeto al otro", "Solidaridad en la escuela", "Cuidado del entorno", "Actos de servicio"] },
      ],
    },
    "2doP": {
      title: "Segundo Grado de Primaria",
      subtitle: "Explorando nuevos conocimientos y habilidades",
      objetivos: [
        { titulo: "Comprensión lectora", descripcion: "Desarrollar la comprensión y expresión oral y escrita." },
        { titulo: "Habilidades matemáticas", descripcion: "Introducir operaciones básicas y lógica." },
        { titulo: "Desarrollo social", descripcion: "Fomentar respeto y cooperación." },
      ],
      materias: [
        { Materia: "Matemáticas", Horas: "20 h/mes", color: "#1976d2", Icono: CalculateIcon,
          temas: ["Multiplicación elemental", "División elemental", "Números de dos dígitos", "Medidas de longitud", "Gráficos simples"] },
        { Materia: "Lenguaje", Horas: "44 h/mes", color: "#c62828", Icono: MenuBookIcon,
          temas: ["Cuentos y relatos", "Sinónimos y antónimos", "Escritura de párrafos", "Puntuación básica", "Comprensión de textos cortos"] },
        { Materia: "Ciencias Sociales", Horas: "8 h/mes", color: "#6a1b9a", Icono: PublicIcon,
          temas: ["La comunidad y roles", "Actividades económicas de la familia", "Mapas simples", "Historia local", "Tribus o pueblos originarios"] },
        { Materia: "Ciencias Naturales", Horas: "8 h/mes", color: "#43a047", Icono: ScienceIcon,
          temas: ["Los sentidos humanos", "Plantas y animales", "El agua en el planeta", "Cuidado del cuerpo", "Experimentos simples"] },
        { Materia: "Artes Plásticas", Horas: "8 h/mes", color: "#ff9800", Icono: BrushIcon,
          temas: ["Colores secundarios", "Técnicas de pintura", "Modelado avanzado", "Diseño de carteles", "Exhibición de trabajos"] },
        { Materia: "Educación Física y Deportes", Horas: "8 h/mes", color: "#2e7d32", Icono: SportsSoccerIcon,
          temas: ["Deportes individuales simples", "Juegos por equipo", "Resistencia básica", "Coordinación de equipo", "Reflejos y rapidez"] },
        { Materia: "Educación Musical", Horas: "8 h/mes", color: "#e91e63", Icono: MusicNoteIcon,
          temas: ["Instrumentos de percusión", "Coro infantil", "Ritmo coordinado", "Lectura de partituras simples", "Presentación musical"] },
        { Materia: "Técnica Tecnológica", Horas: "8 h/mes", color: "#455a64", Icono: BuildIcon,
          temas: ["Plano simple", "Construcción y ensamblaje", "Materiales reciclados", "Diseño de maqueta sencilla", "Presentación del producto"] },
        { Materia: "Valores, Espiritualidades y Religión", Horas: "8 h/mes", color: "#9c27b0", Icono: FavoriteIcon,
          temas: ["Equidad y respeto", "Amor al prójimo", "Honestidad en los actos", "Resolución pacífica de conflictos", "Responsabilidad social"] },
      ],
    },
    "3roP": {
      title: "Tercer Grado de Primaria",
      subtitle: "Consolidando aprendizajes fundamentales",
      objetivos: [
        { titulo: "Razonamiento lógico", descripcion: "Fortalecer la capacidad de análisis y resolución de problemas." },
        { titulo: "Lectura comprensiva", descripcion: "Mejorar la interpretación de textos." },
        { titulo: "Creatividad y expresión", descripcion: "Estimular la expresión artística y personal." },
      ],
      materias: [
        { Materia: "Matemáticas", Horas: "20 h/mes", color: "#1976d2", Icono: CalculateIcon,
          temas: ["Fracciones básicas", "Medidas de longitud y área", "Problemas de lógica", "Multiplicación mayor", "División con resto"] },
        { Materia: "Lenguaje", Horas: "44 h/mes", color: "#c62828", Icono: MenuBookIcon,
          temas: ["Textos narrativos", "Puntuación avanzada", "Gramática básica", "Redacción de párrafos", "Comprensión de textos medianos"] },
        { Materia: "Ciencias Sociales", Horas: "8 h/mes", color: "#6a1b9a", Icono: PublicIcon,
          temas: ["Gobierno y democracia", "Derechos y deberes", "Historia regional", "La geografía del país", "Pueblos originarios y su cultura"] },
        { Materia: "Ciencias Naturales", Horas: "8 h/mes", color: "#43a047", Icono: ScienceIcon,
          temas: ["Energía y sus formas", "El cuerpo humano y salud", "Ecosistemas simples", "El agua y el clima", "Investigación científica básica"] },
        { Materia: "Artes Plásticas", Horas: "8 h/mes", color: "#ff9800", Icono: BrushIcon,
          temas: ["Técnicas mixtas", "Diseño gráfico simple", "Maquetas artísticas", "Arte con materiales reciclados", "Exposición creativa"] },
        { Materia: "Educación Física y Deportes", Horas: "8 h/mes", color: "#2e7d32", Icono: SportsSoccerIcon,
          temas: ["Deportes de mesa", "Cooperación en equipo", "Agilidad y velocidad", "Estrategias de juego", "Condición física"] },
        { Materia: "Educación Musical", Horas: "8 h/mes", color: "#e91e63", Icono: MusicNoteIcon,
          temas: ["Instrumentos de viento simples", "Coros y ensambles pequeños", "Notación musical básica", "Historia de la música boliviana", "Presentación artística"] },
        { Materia: "Técnica Tecnológica", Horas: "8 h/mes", color: "#455a64", Icono: BuildIcon,
          temas: ["Herramientas manuales y eléctricas básicas", "Diseño de maqueta funcional", "Robótica inicial", "Programación simple", "Presentación del proyecto"] },
        { Materia: "Valores, Espiritualidades y Religión", Horas: "8 h/mes", color: "#9c27b0", Icono: FavoriteIcon,
          temas: ["Igualdad de oportunidades", "Justicia social", "Respeto por la diversidad", "Trabajo en comunidad", "Ética en la vida diaria"] },
      ],
    },
    "4toP": {
      title: "Cuarto Grado de Primaria",
      subtitle: "Desarrollando pensamiento crítico y creativo",
      objetivos: [
        { titulo: "Pensamiento crítico", descripcion: "Analizar información y tomar decisiones fundamentadas." },
        { titulo: "Resolución de problemas", descripcion: "Aplicar conocimientos a situaciones reales." },
        { titulo: "Expresión artística", descripcion: "Fomentar creatividad y apreciación cultural." },
      ],
      materias: [
        { Materia: "Matemáticas", Horas: "20 h/mes", color: "#1976d2", Icono: CalculateIcon,
          temas: ["Decimales", "Perímetro y área", "Gráficos y tablas", "Problemas reales", "Proporcionalidad"] },
        { Materia: "Lenguaje", Horas: "44 h/mes", color: "#c62828", Icono: MenuBookIcon,
          temas: ["Tipos de texto", "Gramática avanzada", "Redacción de cartas", "Comprensión de textos largos", "Argumentación básica"] },
        { Materia: "Ciencias Sociales", Horas: "8 h/mes", color: "#6a1b9a", Icono: PublicIcon,
          temas: ["Cultura de paz", "Prevención de la trata de personas", "Democracia y gobierno", "Geografía del país", "Economía familiar"] },
        { Materia: "Ciencias Naturales", Horas: "8 h/mes", color: "#43a047", Icono: ScienceIcon,
          temas: ["El medio ambiente y sostenibilidad", "Energías renovables", "Tierra y clima", "Biodiversidad boliviana", "Experimentos científicos"] },
        { Materia: "Artes Plásticas", Horas: "8 h/mes", color: "#ff9800", Icono: BrushIcon,
          temas: ["Diseño digital básico", "Arte y tecnología", "Maquetas complejas", "Arte experimental", "Exhibición colectiva"] },
        { Materia: "Educación Física y Deportes", Horas: "8 h/mes", color: "#2e7d32", Icono: SportsSoccerIcon,
          temas: ["Deportes individuales y por equipo", "Estrategias de juego", "Condición física avanzada", "Cooperación grupal", "Juegos tradicionales"] },
        { Materia: "Educación Musical", Horas: "8 h/mes", color: "#e91e63", Icono: MusicNoteIcon,
          temas: ["Coro avanzado", "Instrumentos musicales variados", "Notación musical", "Apreciación musical", "Presentación artística"] },
        { Materia: "Técnica Tecnológica", Horas: "8 h/mes", color: "#455a64", Icono: BuildIcon,
          temas: ["Proyectos tecnológicos", "Robótica básica", "Diseño y modelado", "Programación simple", "Presentación del producto"] },
        { Materia: "Valores, Espiritualidades y Religión", Horas: "8 h/mes", color: "#9c27b0", Icono: FavoriteIcon,
          temas: ["Respeto y tolerancia", "Solidaridad", "Justicia y ética", "Responsabilidad social", "Trabajo comunitario"] },
      ],
    },
    "5toP": {
      title: "Quinto Grado de Primaria",
      subtitle: "Preparando a estudiantes con autonomía y criterio",
      objetivos: [
        { titulo: "Autonomía de aprendizaje", descripcion: "Fomentar responsabilidad en su propio aprendizaje." },
        { titulo: "Razonamiento lógico-matemático", descripcion: "Resolver problemas más complejos." },
        { titulo: "Expresión creativa y cultural", descripcion: "Desarrollar habilidades artísticas y culturales." },
      ],
      materias: [
        { Materia: "Matemáticas", Horas: "20 h/mes", color: "#1976d2", Icono: CalculateIcon,
          temas: ["Fracciones y decimales", "Porcentajes", "Problemas complejos", "Geometría básica", "Medición avanzada"] },
        { Materia: "Lenguaje", Horas: "44 h/mes", color: "#c62828", Icono: MenuBookIcon,
          temas: ["Redacción de textos", "Análisis de textos", "Ortografía avanzada", "Comprensión lectora profunda", "Argumentación escrita"] },
        { Materia: "Ciencias Sociales", Horas: "8 h/mes", color: "#6a1b9a", Icono: PublicIcon,
          temas: ["Historia nacional", "Geografía regional", "Economía básica", "Gobierno y ciudadanía", "Cultura boliviana"] },
        { Materia: "Ciencias Naturales", Horas: "8 h/mes", color: "#43a047", Icono: ScienceIcon,
          temas: ["Energía y fuerza", "Ecología", "Salud y nutrición", "Sistema solar", "Experimentos científicos"] },
        { Materia: "Artes Plásticas", Horas: "8 h/mes", color: "#ff9800", Icono: BrushIcon,
          temas: ["Técnicas mixtas avanzadas", "Diseño artístico", "Proyectos colectivos", "Arte experimental", "Exposición creativa"] },
        { Materia: "Educación Física y Deportes", Horas: "8 h/mes", color: "#2e7d32", Icono: SportsSoccerIcon,
          temas: ["Deportes reglamentados", "Cooperación avanzada", "Estrategias de juego", "Condición física completa", "Reflejos y resistencia"] },
        { Materia: "Educación Musical", Horas: "8 h/mes", color: "#e91e63", Icono: MusicNoteIcon,
          temas: ["Coro avanzado", "Instrumentos variados", "Lectura de partituras complejas", "Historia de la música", "Presentación musical"] },
        { Materia: "Técnica Tecnológica", Horas: "8 h/mes", color: "#455a64", Icono: BuildIcon,
          temas: ["Proyectos tecnológicos completos", "Robótica intermedia", "Programación básica", "Diseño funcional", "Presentación de proyectos"] },
        { Materia: "Valores, Espiritualidades y Religión", Horas: "8 h/mes", color: "#9c27b0", Icono: FavoriteIcon,
          temas: ["Ética y moral", "Respeto y convivencia", "Solidaridad", "Responsabilidad social", "Trabajo en comunidad"] },
      ],
    },
    "6toP": {
      title: "Sexto Grado de Primaria",
      subtitle: "Preparación para la educación secundaria",
      objetivos: [
        { titulo: "Pensamiento crítico avanzado", descripcion: "Analizar y evaluar información de manera independiente." },
        { titulo: "Resolución de problemas complejos", descripcion: "Aplicar conocimientos para situaciones diversas." },
        { titulo: "Expresión artística y cultural", descripcion: "Fortalecer creatividad y apreciación artística." },
      ],
      materias: [
        { Materia: "Matemáticas", Horas: "20 h/mes", color: "#1976d2", Icono: CalculateIcon,
          temas: ["Proporciones y porcentajes", "Álgebra básica", "Geometría avanzada", "Estadística simple", "Problemas aplicados"] },
        { Materia: "Lenguaje", Horas: "44 h/mes", color: "#c62828", Icono: MenuBookIcon,
          temas: ["Ensayo y redacción", "Comprensión crítica de textos", "Gramática avanzada", "Expresión oral y escrita", "Análisis literario"] },
        { Materia: "Ciencias Sociales", Horas: "8 h/mes", color: "#6a1b9a", Icono: PublicIcon,
          temas: ["Historia nacional y mundial", "Cultura y tradiciones", "Gobierno y ciudadanía", "Geografía avanzada", "Economía familiar y comunitaria"] },
        { Materia: "Ciencias Naturales", Horas: "8 h/mes", color: "#43a047", Icono: ScienceIcon,
          temas: ["Energía y fuerza", "Biología avanzada", "Salud y nutrición", "Ecosistemas", "Experimentos científicos"] },
        { Materia: "Artes Plásticas", Horas: "8 h/mes", color: "#ff9800", Icono: BrushIcon,
          temas: ["Diseño y expresión avanzada", "Proyectos artísticos", "Arte y cultura", "Técnicas mixtas", "Exposición colectiva"] },
        { Materia: "Educación Física y Deportes", Horas: "8 h/mes", color: "#2e7d32", Icono: SportsSoccerIcon,
          temas: ["Deportes reglamentados y competitivos", "Estrategias avanzadas", "Condición física integral", "Trabajo en equipo", "Liderazgo deportivo"] },
        { Materia: "Educación Musical", Horas: "8 h/mes", color: "#e91e63", Icono: MusicNoteIcon,
          temas: ["Orquesta y coro", "Instrumentos avanzados", "Historia de la música", "Lectura musical avanzada", "Presentaciones artísticas"] },
        { Materia: "Técnica Tecnológica", Horas: "8 h/mes", color: "#455a64", Icono: BuildIcon,
          temas: ["Proyectos tecnológicos completos", "Robótica avanzada", "Programación intermedia", "Diseño de prototipos", "Presentación final de proyectos"] },
        { Materia: "Valores, Espiritualidades y Religión", Horas: "8 h/mes", color: "#9c27b0", Icono: FavoriteIcon,
          temas: ["Ética y valores", "Responsabilidad social", "Respeto y convivencia", "Solidaridad comunitaria", "Cuidado del entorno"] },
      ],
    },
  };

  return (
    <HomeLevelPage
      levelTitle="Plan de estudios - Nivel Primario"
      levelDescription="Formación académica y espiritual para niños entre 6 y 11 años"
      gradesContent={gradesContent}
      toggleLabels={[
        "1ro Primaria",
        "2do Primaria",
        "3ro Primaria",
        "4to Primaria",
        "5to Primaria",
        "6to Primaria",
      ]}
    />
  );
}
