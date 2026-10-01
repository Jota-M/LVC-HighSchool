'use client';
// components/estudiante/inicial/RinconLudicoEstudiante.tsx
// Espacio ludico e interactivo para estudiantes de Nivel Inicial (3-5 anos)

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Box, Typography, Button, Card, CardContent,
  Dialog, DialogContent, IconButton, Chip, Grid,
  Skeleton, keyframes, alpha
} from '@mui/material';
import {
  CloseRounded as CloseIcon,
  PlayCircleRounded as VideoIcon,
  SportsEsportsRounded as GameIcon,
  CheckCircleRounded as CheckIcon,
  ReplayRounded as ReplayIcon,
  StarRounded as StarIcon,
  AutoAwesomeRounded as SparklesIcon,
  FavoriteRounded as HeartIcon,
  PsychologyRounded as BrainIcon,
  DirectionsRunRounded as MotorIcon,
  RecordVoiceOverRounded as VoiceIcon,
  TouchAppRounded as TouchIcon,
} from '@mui/icons-material';
import { inicialService } from '@/services/inicialService';
import { ActividadInicial, ElementoInteractivo, ZonaArrastrar } from '@/types/inicialTypes';
import type { MateriaResumen } from '@/services/estudianteService';

// Animaciones Ludicas
const floatAnim = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-8px) rotate(1deg); }
`;

const pulseScale = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const popIn = keyframes`
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
`;

const bounceIn = keyframes`
  0%   { transform: scale(0.3) translateY(30px); opacity: 0; }
  60%  { transform: scale(1.1) translateY(-6px); opacity: 1; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  75% { transform: translateX(8px); }
`;

const CAMPOS_INFO: Record<string, { nombreCorto: string; icono: React.ReactElement; color: string; emoji: string }> = {
  'INI-COM': { nombreCorto: 'Expresion y Creatividad', icono: <VoiceIcon sx={{ fontSize: 20 }} />, color: '#6366F1', emoji: '🎨' },
  'INI-CON': { nombreCorto: 'Ciencia y Descubrimiento', icono: <BrainIcon sx={{ fontSize: 20 }} />, color: '#0EA5E9', emoji: '🧠' },
  'INI-BIO': { nombreCorto: 'Cuerpo y Movimiento', icono: <MotorIcon sx={{ fontSize: 20 }} />, color: '#10B981', emoji: '🤸' },
  'INI-SOC': { nombreCorto: 'Familia y Emociones', icono: <HeartIcon sx={{ fontSize: 20 }} />, color: '#F59E0B', emoji: '❤️' },
};
const CAMPOS_KEYS = ['INI-COM', 'INI-CON', 'INI-BIO', 'INI-SOC'];

function getYouTubeEmbedUrl(url?: string | null): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0` : null;
}

interface Props { materia: MateriaResumen; accent: string; accentDark: string; isDark: boolean; }

// ─── JuegoArrastrar ─────────────────────────────────────────────────────────
interface ArrastrarProps {
  elementos: ElementoInteractivo[];
  zonas: ZonaArrastrar[];
  color: string;
  isDark: boolean;
  onGanar: () => void;
}

const JuegoArrastrar: React.FC<ArrastrarProps> = ({ elementos, zonas, color, isDark, onGanar }) => {
  const [colocados, setColocados] = useState<Record<number, string | null>>(
    () => Object.fromEntries(elementos.map(e => [e.id, null]))
  );
  const [dragging, setDragging] = useState<number | null>(null);
  const [incorrecto, setIncorrecto] = useState<number | null>(null);
  const [ganado, setGanado] = useState(false);

  const elementosSinColocar = elementos.filter(e => colocados[e.id] === null);

  const colocarEnZona = (elemId: number, zonaId: string) => {
    const elem = elementos.find(el => el.id === elemId);
    if (!elem) return;
    if (elem.zona_correcta === zonaId) {
      const nuevos = { ...colocados, [elemId]: zonaId };
      setColocados(nuevos);
      if (Object.values(nuevos).every(v => v !== null)) {
        setTimeout(() => { setGanado(true); onGanar(); }, 400);
      }
    } else {
      setIncorrecto(elemId);
      setTimeout(() => setIncorrecto(null), 700);
    }
    setDragging(null);
  };

  if (ganado) {
    return (
      <Box sx={{ py: 4, textAlign: 'center', animation: `${popIn} 0.5s ease-out` }}>
        <Typography sx={{ fontSize: '4.5rem', mb: 1, animation: `${pulseScale} 1s infinite` }}>🌟🎉🌟</Typography>
        <Typography variant="h5" fontWeight={900} color="#10B981">¡PUSISTE TODO EN SU LUGAR!</Typography>
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 2, color: '#f59e0b' }}>
          <StarIcon sx={{ fontSize: 44 }} /><StarIcon sx={{ fontSize: 44 }} /><StarIcon sx={{ fontSize: 44 }} />
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="body2" fontWeight={800} color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
        👆 Toca un elemento (se selecciona) y luego toca la zona donde va:
      </Typography>
      {elementosSinColocar.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center', mb: 3.5 }}>
          {elementosSinColocar.map(elem => (
            <Box
              key={elem.id}
              draggable
              onDragStart={e => { setDragging(elem.id); e.dataTransfer.effectAllowed = 'move'; }}
              onClick={() => setDragging(dragging === elem.id ? null : elem.id)}
              sx={{
                px: 2.5, py: 1.5, borderRadius: '16px', cursor: 'pointer', userSelect: 'none',
                bgcolor: alpha(color, isDark ? 0.2 : 0.1),
                border: `2.5px solid ${alpha(color, dragging === elem.id ? 0.9 : 0.35)}`,
                boxShadow: dragging === elem.id ? `0 8px 24px ${alpha(color, 0.45)}, 0 0 0 3px ${alpha(color, 0.3)}` : 'none',
                transform: dragging === elem.id ? 'scale(1.1)' : 'scale(1)',
                animation: incorrecto === elem.id ? `${shake} 0.5s ease` : 'none',
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 1,
              }}
            >
              <Typography sx={{ fontSize: '2rem' }}>{elem.emoji}</Typography>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 800 }}>{elem.nombre}</Typography>
              {dragging === elem.id && <Typography sx={{ fontSize: '0.62rem', color: 'text.secondary', ml: 0.5 }}>→ elige zona</Typography>}
            </Box>
          ))}
        </Box>
      )}
      <Grid container spacing={2}>
        {zonas.map(zona => {
          const elemsEnZona = elementos.filter(e => colocados[e.id] === zona.id);
          const isTarget = dragging !== null;
          return (
            <Grid size={{ xs: 12, sm: (Math.floor(12 / zonas.length)) as any }} key={zona.id}>
              <Box
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); if (dragging !== null) colocarEnZona(dragging, zona.id); }}
                onClick={() => { if (dragging !== null) colocarEnZona(dragging, zona.id); }}
                sx={{
                  minHeight: 150, borderRadius: '20px', p: 2,
                  border: `3px ${isTarget ? 'solid' : 'dashed'} ${zona.color || color}`,
                  bgcolor: alpha(zona.color || color, isTarget ? (isDark ? 0.15 : 0.08) : (isDark ? 0.06 : 0.04)),
                  transition: 'all 0.2s', cursor: dragging !== null ? 'copy' : 'default',
                  transform: isTarget ? 'scale(1.02)' : 'scale(1)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
                }}
              >
                <Typography sx={{ fontSize: '2.2rem' }}>{zona.emoji}</Typography>
                <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: zona.color || color }}>{zona.nombre}</Typography>
                {elemsEnZona.length === 0 && isTarget && (
                  <Typography sx={{ fontSize: '0.68rem', color: zona.color || color, fontWeight: 700 }}>¡Sueltame aqui!</Typography>
                )}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mt: 0.5 }}>
                  {elemsEnZona.map(elem => (
                    <Box key={elem.id} sx={{
                      px: 1.5, py: 0.8, borderRadius: '12px', animation: `${bounceIn} 0.4s ease-out`,
                      bgcolor: alpha(zona.color || color, 0.2), border: `1.5px solid ${zona.color || color}`,
                      display: 'flex', alignItems: 'center', gap: 0.6
                    }}>
                      <Typography sx={{ fontSize: '1.2rem' }}>{elem.emoji}</Typography>
                      <Typography sx={{ fontSize: '0.72rem', fontWeight: 800 }}>{elem.nombre}</Typography>
                      <CheckIcon sx={{ fontSize: 14, color: '#10B981' }} />
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};


export const RinconLudicoEstudiante: React.FC<Props> = ({ materia, isDark }) => {
  const [campoActivo, setCampoActivo] = useState<string>('INI-COM');
  const [actividades, setActividades] = useState<ActividadInicial[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados de minijuego o modal interactivo
  const [actividadJugando, setActividadJugando] = useState<ActividadInicial | null>(null);

  // Estado del juego Memorama actual
  const [cartasMemorama, setCartasMemorama] = useState<Array<{ uid: number; elemId: number; nombre: string; emoji: string; pista?: string; volteada: boolean; resuelta: boolean }>>([]);
  const [cartasSeleccionadas, setCartasSeleccionadas] = useState<number[]>([]);
  const [juegoTerminado, setJuegoTerminado] = useState(false);

  // Estado del juego Adivinanza actual
  const [opcionElegida, setOpcionElegida] = useState<ElementoInteractivo | null>(null);
  const [esAdivinanzaCorrecta, setEsAdivinanzaCorrecta] = useState<boolean | null>(null);

  // Arrastrar y tarjetas
  const [arrastrarGanado, setArrastrarGanado] = useState(false);
  const [tarjetaVolteada, setTarjetaVolteada] = useState<number | null>(null);

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      try {
        const data = await inicialService.getActividades({ gradoId: materia.grado_id });
        setActividades(data);
      } catch (err) {
        console.error('Error al cargar actividades ludicas:', err);
      } finally {
        setLoading(false);
      }
    };
    if (materia.grado_id) cargar();
  }, [materia.grado_id]);

  const actividadesCampo = useMemo(() => actividades.filter(a => a.campo_codigo === campoActivo), [actividades, campoActivo]);
  const infoCampo = CAMPOS_INFO[campoActivo] || CAMPOS_INFO['INI-COM'];

  const iniciarJuego = (act: ActividadInicial) => {
    setActividadJugando(act);
    setJuegoTerminado(false);
    setOpcionElegida(null);
    setEsAdivinanzaCorrecta(null);
    setArrastrarGanado(false);
    setTarjetaVolteada(null);

    const tipoInt = act.contenido_interactivo?.tipo_interaccion || 'memorama';

    if (tipoInt === 'memorama' && act.contenido_interactivo?.elementos) {
      const elems = act.contenido_interactivo.elementos;
      // Duplicar elementos para formar parejas
      const deck: Array<{ uid: number; elemId: number; nombre: string; emoji: string; pista?: string; volteada: boolean; resuelta: boolean }> = [];
      let uidCounter = 1;
      elems.forEach((el) => {
        deck.push({ uid: uidCounter++, elemId: el.id, nombre: el.nombre, emoji: el.emoji, pista: el.pista, volteada: false, resuelta: false });
        deck.push({ uid: uidCounter++, elemId: el.id, nombre: el.nombre, emoji: el.emoji, pista: el.pista, volteada: false, resuelta: false });
      });
      // Barajar cartas
      deck.sort(() => Math.random() - 0.5);
      setCartasMemorama(deck);
      setCartasSeleccionadas([]);
    }
  };

  // Voltear carta en Memorama
  const handleClickCarta = (uid: number) => {
    if (cartasSeleccionadas.length === 2) return;
    const carta = cartasMemorama.find((c) => c.uid === uid);
    if (!carta || carta.volteada || carta.resuelta) return;

    const nuevoDeck = cartasMemorama.map((c) => (c.uid === uid ? { ...c, volteada: true } : c));
    setCartasMemorama(nuevoDeck);

    const nuevaSel = [...cartasSeleccionadas, uid];
    setCartasSeleccionadas(nuevaSel);

    if (nuevaSel.length === 2) {
      const c1 = nuevoDeck.find((c) => c.uid === nuevaSel[0])!;
      const c2 = nuevoDeck.find((c) => c.uid === nuevaSel[1])!;

      if (c1.elemId === c2.elemId) {
        // ¡Pareja encontrada!
        setTimeout(() => {
          const resueltasDeck = nuevoDeck.map((c) =>
            c.elemId === c1.elemId ? { ...c, resuelta: true } : c
          );
          setCartasMemorama(resueltasDeck);
          setCartasSeleccionadas([]);
          // Verificar si todas están resueltas
          if (resueltasDeck.every((c) => c.resuelta)) {
            setJuegoTerminado(true);
          }
        }, 500);
      } else {
        // No coinciden, voltear de regreso
        setTimeout(() => {
          setCartasMemorama((prev) =>
            prev.map((c) => (c.uid === c1.uid || c.uid === c2.uid ? { ...c, volteada: false } : c))
          );
          setCartasSeleccionadas([]);
        }, 1100);
      }
    }
  };

  // Responder en Adivinanza
  const handleResponderAdivinanza = (elem: ElementoInteractivo) => {
    setOpcionElegida(elem);
    const esCorrecta = Boolean(elem.es_correcta);
    setEsAdivinanzaCorrecta(esCorrecta);
    if (esCorrecta) {
      setJuegoTerminado(true);
    }
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* ── BANNER INFANTIL LÚDICO ── */}
      <Box
        sx={{
          borderRadius: '26px',
          p: { xs: 2.5, sm: 3.5 },
          mb: 3.5,
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 50%, #F59E0B 100%)',
          color: '#fff',
          boxShadow: '0 12px 36px rgba(236,72,153,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 600 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
            <SparklesIcon sx={{ fontSize: 24, animation: `${pulseScale} 2s infinite ease-in-out` }} />
            <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.25rem', sm: '1.65rem' }, lineHeight: 1.15 }}>
              ¡Hola, pequeño explorador! 🚀
            </Typography>
          </Box>
          <Typography sx={{ fontSize: { xs: '0.85rem', sm: '1rem' }, opacity: 0.95, fontWeight: 600 }}>
            Bienvenido a tu rincón de juegos y descubrimientos. Toca un campo, juega y gana muchas estrellitas mágicas.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, zIndex: 1, fontSize: '2.5rem', animation: `${floatAnim} 3s infinite ease-in-out` }}>
          <span>🎨</span>
          <span>⭐</span>
          <span>🦁</span>
        </Box>
      </Box>

      {/* ── TABS GIGANTES DE CAMPOS DE SABERES ── */}
      <Grid container spacing={1.5} sx={{ mb: 3.5 }}>
        {CAMPOS_KEYS.map((k) => {
          const c = CAMPOS_INFO[k];
          const isAct = campoActivo === k;
          return (
            <Grid size={{ xs: 6, sm: 3 }} key={k}>
              <Card
                elevation={0}
                onClick={() => setCampoActivo(k)}
                sx={{
                  p: 1.8,
                  borderRadius: '20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: `2px solid ${isAct ? c.color : alpha(isDark ? '#fff' : '#000', 0.08)}`,
                  bgcolor: isAct ? alpha(c.color, isDark ? 0.2 : 0.1) : isDark ? alpha('#fff', 0.02) : '#fff',
                  transform: isAct ? 'scale(1.03)' : 'scale(1)',
                  boxShadow: isAct ? `0 8px 24px ${alpha(c.color, 0.25)}` : 'none',
                  transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                  '&:hover': { transform: 'scale(1.03)', borderColor: c.color },
                }}
              >
                <Typography sx={{ fontSize: '2rem', mb: 0.5 }}>{c.emoji}</Typography>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: isAct ? c.color : 'text.primary', lineHeight: 1.2 }}>
                  {c.nombreCorto}
                </Typography>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* ── CONTENIDO DEL CAMPO SELECCIONADO ── */}
      {loading ? (
        <Grid container spacing={2.5}>
          {[1, 2, 3].map((i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
              <Skeleton variant="rounded" height={260} sx={{ borderRadius: '24px' }} />
            </Grid>
          ))}
        </Grid>
      ) : actividadesCampo.length === 0 ? (
        <Box
          sx={{
            py: 8,
            px: 3,
            textAlign: 'center',
            borderRadius: '26px',
            bgcolor: isDark ? alpha(infoCampo.color, 0.05) : alpha(infoCampo.color, 0.03),
            border: `2px dashed ${alpha(infoCampo.color, 0.25)}`,
          }}
        >
          <Typography sx={{ fontSize: '3.5rem', mb: 1.5 }}>{infoCampo.emoji}</Typography>
          <Typography variant="h6" fontWeight={800} color="text.primary" gutterBottom>
            ¡Pronto habrá nuevas actividades aquí!
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
            Tu maestra está preparando mágicos juegos y canciones para este campo.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {actividadesCampo.map((act) => {
            const isVideo = act.tipo === 'video';
            const isJuego = act.tipo === 'juego';
            const bgCard = act.color_fondo || infoCampo.color;

            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={act.id}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: '24px',
                    border: `1.5px solid ${alpha(bgCard, 0.25)}`,
                    bgcolor: isDark ? alpha(bgCard, 0.06) : '#fff',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.3)' : `0 8px 24px ${alpha(bgCard, 0.12)}`,
                    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: `0 16px 36px ${alpha(bgCard, 0.25)}`,
                    },
                  }}
                >
                  {/* Encabezado visual de la tarjeta */}
                  <Box
                    sx={{
                      p: 2.5,
                      background: `linear-gradient(135deg, ${bgCard}, ${alpha(bgCard, 0.75)})`,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography sx={{ fontSize: '2.5rem', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.2))' }}>
                      {act.emoji}
                    </Typography>
                    <Chip
                      icon={isJuego ? <GameIcon sx={{ fontSize: 16 }} /> : isVideo ? <VideoIcon sx={{ fontSize: 16 }} /> : undefined}
                      label={isJuego ? 'JUEGO' : isVideo ? 'VIDEO' : 'ACTIVIDAD'}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.25)',
                        color: '#fff',
                        fontWeight: 900,
                        fontSize: '0.68rem',
                        backdropFilter: 'blur(8px)',
                      }}
                    />
                  </Box>

                  <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.3, mb: 1 }}>
                      {act.titulo}
                    </Typography>

                    {act.descripcion && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1, lineHeight: 1.45 }}>
                        {act.descripcion}
                      </Typography>
                    )}

                    {/* Botón de Acción Principal */}
                    {isJuego ? (
                      <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        startIcon={<GameIcon sx={{ fontSize: 22 }} />}
                        onClick={() => iniciarJuego(act)}
                        sx={{
                          mt: 'auto',
                          borderRadius: '16px',
                          fontWeight: 900,
                          fontSize: '0.92rem',
                          py: 1.2,
                          background: `linear-gradient(135deg, ${bgCard}, ${alpha(bgCard, 0.85)})`,
                          color: '#fff',
                          boxShadow: `0 6px 18px ${alpha(bgCard, 0.35)}`,
                          '&:hover': { transform: 'scale(1.02)' },
                        }}
                      >
                        ¡Jugar Ahora! 🎮
                      </Button>
                    ) : isVideo && act.url ? (
                      <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        startIcon={<VideoIcon sx={{ fontSize: 22 }} />}
                        onClick={() => iniciarJuego(act)}
                        sx={{
                          mt: 'auto',
                          borderRadius: '16px',
                          fontWeight: 900,
                          fontSize: '0.92rem',
                          py: 1.2,
                          bgcolor: '#ef4444',
                          color: '#fff',
                          boxShadow: '0 6px 18px rgba(239,68,68,0.35)',
                          '&:hover': { bgcolor: '#dc2626' },
                        }}
                      >
                        Ver Video 🎬
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        startIcon={<SparklesIcon sx={{ fontSize: 20 }} />}
                        onClick={() => iniciarJuego(act)}
                        sx={{
                          mt: 'auto',
                          borderRadius: '16px',
                          fontWeight: 900,
                          fontSize: '0.92rem',
                          py: 1.2,
                          bgcolor: bgCard,
                          color: '#fff',
                        }}
                      >
                        Ver Actividad ✨
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* ══ MODAL DE JUEGO INTERACTIVO Y PANTALLA COMPLETA ══ */}
      <Dialog
        open={!!actividadJugando}
        onClose={() => setActividadJugando(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '30px',
            bgcolor: isDark ? '#0d1117' : '#fff',
            overflow: 'hidden',
            border: `2px solid ${alpha(actividadJugando?.color_fondo || '#6366F1', 0.35)}`,
          },
        }}
      >
        {actividadJugando && (
          <Box>
            {/* Header del modal de juego */}
            <Box
              sx={{
                p: { xs: 2, sm: 2.5 },
                background: `linear-gradient(135deg, ${actividadJugando.color_fondo || '#6366F1'}, ${alpha(actividadJugando.color_fondo || '#6366F1', 0.75)})`,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography sx={{ fontSize: '2.4rem' }}>{actividadJugando.emoji}</Typography>
                <Box>
                  <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.1rem', sm: '1.35rem' }, lineHeight: 1.15 }}>
                    {actividadJugando.titulo}
                  </Typography>
                  <Typography sx={{ fontSize: '0.78rem', opacity: 0.9, fontWeight: 600 }}>
                    {actividadJugando.contenido_interactivo?.instruccion || actividadJugando.descripcion || '¡A divertirnos aprendiendo!'}
                  </Typography>
                </Box>
              </Box>
              <IconButton size="small" onClick={() => setActividadJugando(null)} sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.2)' }}>
                <CloseIcon />
              </IconButton>
            </Box>

            <DialogContent sx={{ p: { xs: 2.5, sm: 4 }, textAlign: 'center' }}>
              {/* ── MODO MEMORAMA ── */}
              {actividadJugando.contenido_interactivo?.tipo_interaccion === 'memorama' && (
                <Box>
                  {juegoTerminado ? (
                    <Box sx={{ py: 4, animation: `${popIn} 0.5s ease-out` }}>
                      <Typography sx={{ fontSize: '4.5rem', mb: 1, animation: `${pulseScale} 1s infinite` }}>
                        🌟🎉🌟
                      </Typography>
                      <Typography variant="h4" fontWeight={900} color="#10B981" gutterBottom>
                        ¡GENIAL! ¡ENCONTRASTE TODAS LAS PAREJAS!
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        Has ganado 3 estrellas doradas de campeón 🏆
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 4, color: '#f59e0b', fontSize: '2.5rem' }}>
                        <StarIcon sx={{ fontSize: 44 }} />
                        <StarIcon sx={{ fontSize: 44 }} />
                        <StarIcon sx={{ fontSize: 44 }} />
                      </Box>

                      <Button
                        variant="contained"
                        size="large"
                        startIcon={<ReplayIcon />}
                        onClick={() => iniciarJuego(actividadJugando)}
                        sx={{
                          borderRadius: '16px',
                          fontWeight: 900,
                          px: 4,
                          py: 1.4,
                          background: `linear-gradient(135deg, ${actividadJugando.color_fondo || '#6366F1'}, #10B981)`,
                          color: '#fff',
                        }}
                      >
                        Jugar de nuevo
                      </Button>
                    </Box>
                  ) : (
                    <Box>
                      <Typography variant="body1" fontWeight={800} color="text.secondary" sx={{ mb: 3 }}>
                        👉 Toca dos tarjetas para descubrir qué tienen detrás:
                      </Typography>

                      <Grid container spacing={2} sx={{ maxWidth: 550, mx: 'auto', mb: 3 }}>
                        {cartasMemorama.map((c) => (
                          <Grid size={{ xs: 4, sm: 3 }} key={c.uid}>
                            <Box
                              onClick={() => handleClickCarta(c.uid)}
                              sx={{
                                height: { xs: 90, sm: 110 },
                                borderRadius: '18px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                cursor: c.resuelta || c.volteada ? 'default' : 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                                bgcolor: c.resuelta
                                  ? alpha('#10B981', 0.2)
                                  : c.volteada
                                  ? alpha(actividadJugando.color_fondo || '#6366F1', 0.15)
                                  : isDark
                                  ? alpha('#fff', 0.08)
                                  : alpha(actividadJugando.color_fondo || '#6366F1', 0.1),
                                border: `2.5px solid ${
                                  c.resuelta
                                    ? '#10B981'
                                    : c.volteada
                                    ? actividadJugando.color_fondo || '#6366F1'
                                    : alpha(actividadJugando.color_fondo || '#6366F1', 0.3)
                                }`,
                                transform: c.volteada || c.resuelta ? 'rotateY(0deg)' : 'scale(0.97)',
                                '&:hover': {
                                  transform: c.resuelta ? 'none' : 'scale(1.04)',
                                },
                              }}
                            >
                              {c.volteada || c.resuelta ? (
                                <>
                                  <Typography sx={{ fontSize: { xs: '2rem', sm: '2.5rem' }, lineHeight: 1 }}>
                                    {c.emoji}
                                  </Typography>
                                  <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, mt: 0.5 }}>
                                    {c.nombre}
                                  </Typography>
                                </>
                              ) : (
                                <Typography sx={{ fontSize: '1.8rem', opacity: 0.6 }}>❓</Typography>
                              )}
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}
                </Box>
              )}

              {/* ── MODO ADIVINANZA ── */}
              {actividadJugando.contenido_interactivo?.tipo_interaccion === 'adivinanza' && (
                <Box sx={{ py: 2 }}>
                  <Typography variant="h5" fontWeight={900} sx={{ mb: 3 }}>
                    {actividadJugando.contenido_interactivo.instruccion || '¿Cuál es la respuesta correcta?'}
                  </Typography>

                  <Grid container spacing={2} sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
                    {actividadJugando.contenido_interactivo.elementos?.map((elem, idx) => {
                      const fueSeleccionada = opcionElegida?.id === elem.id;
                      const esCorrecta = fueSeleccionada && esAdivinanzaCorrecta;
                      const esIncorrecta = fueSeleccionada && esAdivinanzaCorrecta === false;

                      return (
                        <Grid size={{ xs: 12, sm: 4 }} key={idx}>
                          <Card
                            elevation={0}
                            onClick={() => handleResponderAdivinanza(elem)}
                            sx={{
                              p: 2.5,
                              borderRadius: '20px',
                              cursor: 'pointer',
                              border: `3px solid ${
                                esCorrecta ? '#10B981' : esIncorrecta ? '#EF4444' : alpha(actividadJugando.color_fondo || '#6366F1', 0.3)
                              }`,
                              bgcolor: esCorrecta
                                ? alpha('#10B981', 0.15)
                                : esIncorrecta
                                ? alpha('#EF4444', 0.1)
                                : isDark
                                ? alpha('#fff', 0.04)
                                : '#fff',
                              transition: 'all 0.2s',
                              '&:hover': { transform: 'scale(1.05)' },
                            }}
                          >
                            <Typography sx={{ fontSize: '3rem', mb: 1 }}>{elem.emoji}</Typography>
                            <Typography sx={{ fontSize: '0.9rem', fontWeight: 800 }}>{elem.nombre}</Typography>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>

                  {esAdivinanzaCorrecta === true && (
                    <Box sx={{ animation: `${popIn} 0.4s ease-out`, mt: 2 }}>
                      <Typography variant="h5" fontWeight={900} color="#10B981">
                        🎉 ¡Excelente trabajo! ¡Respuesta correcta! ⭐⭐⭐
                      </Typography>
                    </Box>
                  )}
                  {esAdivinanzaCorrecta === false && (
                    <Box sx={{ animation: `${popIn} 0.4s ease-out`, mt: 2 }}>
                      <Typography variant="h6" fontWeight={800} color="#EF4444">
                        😊 ¡Casi! Vuelve a intentarlo, ¡tú puedes!
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}

              {/* ── MODO ARRASTRAR ── */}
              {actividadJugando.contenido_interactivo?.tipo_interaccion === 'arrastrar' &&
                actividadJugando.contenido_interactivo.zonas && (
                <Box sx={{ py: 1 }}>
                  <JuegoArrastrar
                    elementos={actividadJugando.contenido_interactivo.elementos || []}
                    zonas={actividadJugando.contenido_interactivo.zonas}
                    color={actividadJugando.color_fondo || '#6366F1'}
                    isDark={isDark}
                    onGanar={() => setArrastrarGanado(true)}
                  />
                  {arrastrarGanado && (
                    <Button variant="contained" size="large" startIcon={<ReplayIcon />}
                      onClick={() => iniciarJuego(actividadJugando)}
                      sx={{ mt: 3, borderRadius: '16px', fontWeight: 900, px: 4, py: 1.4,
                        bgcolor: actividadJugando.color_fondo || '#6366F1', color: '#fff' }}>
                      Jugar de nuevo 🔄
                    </Button>
                  )}
                </Box>
              )}

              {/* ── MODO TARJETAS EXPLORACIÓN ── */}
              {actividadJugando.contenido_interactivo?.tipo_interaccion === 'tarjetas_exploracion' && (
                <Box sx={{ py: 2 }}>
                  <Typography variant="body1" fontWeight={800} color="text.secondary" sx={{ mb: 3 }}>
                    <TouchIcon sx={{ mr: 0.5, fontSize: 18, verticalAlign: 'middle' }} />
                    Toca cada tarjeta para descubrir que hay dentro:
                  </Typography>
                  <Grid container spacing={2.5} sx={{ maxWidth: 580, mx: 'auto' }}>
                    {actividadJugando.contenido_interactivo.elementos?.map((elem, idx) => {
                      const estaVolteada = tarjetaVolteada === idx;
                      const bgCard = actividadJugando.color_fondo || '#6366F1';
                      return (
                        <Grid size={{ xs: 6, sm: 3 }} key={idx}>
                          <Box onClick={() => setTarjetaVolteada(estaVolteada ? null : idx)} sx={{
                            height: 150, borderRadius: '22px', cursor: 'pointer', position: 'relative',
                            transition: 'transform 0.5s', transformStyle: 'preserve-3d',
                            transform: estaVolteada ? 'rotateY(180deg)' : 'rotateY(0deg)',
                          }}>
                            {/* Frente */}
                            <Box sx={{
                              position: 'absolute', inset: 0, borderRadius: '22px', backfaceVisibility: 'hidden',
                              background: `linear-gradient(135deg, ${bgCard}, ${alpha(bgCard, 0.7)})`,
                              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
                            }}>
                              <Typography sx={{ fontSize: '2.5rem' }}>❓</Typography>
                              <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#fff', opacity: 0.9 }}>Tocame</Typography>
                            </Box>
                            {/* Dorso */}
                            <Box sx={{
                              position: 'absolute', inset: 0, borderRadius: '22px',
                              backfaceVisibility: 'hidden', transform: 'rotateY(180deg)',
                              bgcolor: isDark ? alpha(bgCard, 0.2) : alpha(bgCard, 0.1),
                              border: `2.5px solid ${bgCard}`,
                              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0.5, p: 1,
                            }}>
                              <Typography sx={{ fontSize: '2.2rem' }}>{elem.emoji}</Typography>
                              <Typography sx={{ fontSize: '0.78rem', fontWeight: 900, color: bgCard, lineHeight: 1.2 }}>{elem.nombre}</Typography>
                              {elem.pista && <Typography sx={{ fontSize: '0.62rem', color: 'text.secondary', lineHeight: 1.3 }}>{elem.pista}</Typography>}
                            </Box>
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              )}

              {/* ── MODO VIDEO ── */}
              {actividadJugando.tipo === 'video' && actividadJugando.url && (
                <Box sx={{ maxWidth: 650, mx: 'auto', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}>
                  <Box sx={{ position: 'relative', pt: '56.25%' }}>
                    <iframe
                      src={getYouTubeEmbedUrl(actividadJugando.url) || ''}
                      title={actividadJugando.titulo}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                    />
                  </Box>
                </Box>
              )}

              {/* ── MODO ACTIVIDAD LÚDICA / DINÁMICA PEDAGÓGICA ── */}
              {actividadJugando.tipo === 'actividad' && (
                <Box sx={{ maxWidth: 550, mx: 'auto', textAlign: 'center', py: 2 }}>
                  <Box sx={{
                    p: 3, borderRadius: '24px',
                    bgcolor: alpha(actividadJugando.color_fondo || '#6366F1', isDark ? 0.12 : 0.08),
                    border: `2px solid ${alpha(actividadJugando.color_fondo || '#6366F1', 0.3)}`,
                    mb: 3
                  }}>
                    <Typography sx={{ fontSize: '3.5rem', mb: 1.5, animation: `${pulseScale} 2s infinite ease-in-out` }}>
                      {actividadJugando.emoji || '🎭'}
                    </Typography>
                    <Typography variant="h5" fontWeight={900} sx={{ mb: 1.5, color: actividadJugando.color_fondo || '#6366F1' }}>
                      {actividadJugando.titulo}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, lineHeight: 1.6, color: 'text.primary', mb: 2 }}>
                      {actividadJugando.descripcion}
                    </Typography>
                    {actividadJugando.contenido_interactivo?.instruccion && (
                      <Box sx={{
                        p: 1.5, borderRadius: '14px', bgcolor: isDark ? alpha('#000', 0.25) : '#fff',
                        border: `1px dashed ${alpha(actividadJugando.color_fondo || '#6366F1', 0.4)}`, mt: 1
                      }}>
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: 'text.secondary' }}>
                          💡 {actividadJugando.contenido_interactivo.instruccion}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {!juegoTerminado ? (
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => setJuegoTerminado(true)}
                      startIcon={<StarIcon />}
                      sx={{
                        borderRadius: '16px', fontWeight: 900, px: 4, py: 1.5,
                        background: `linear-gradient(135deg, ${actividadJugando.color_fondo || '#6366F1'}, #10B981)`,
                        color: '#fff', fontSize: '1rem', boxShadow: '0 6px 20px rgba(16,185,129,0.3)',
                        '&:hover': { transform: 'scale(1.03)' }
                      }}
                    >
                      ¡Hicimos esta actividad! 🌟
                    </Button>
                  ) : (
                    <Box sx={{ animation: `${popIn} 0.4s ease-out` }}>
                      <Typography variant="h5" fontWeight={900} color="#10B981" sx={{ mb: 1 }}>
                        🎉 ¡Excelente participación! ⭐⭐⭐
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {actividadJugando.contenido_interactivo?.recompensa || '¡Gran trabajo en equipo! 👏'}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}

              {/* Recompensa */}
              {(juegoTerminado || arrastrarGanado) && actividadJugando.contenido_interactivo?.recompensa && (
                <Box sx={{ mt: 2.5, p: 2, borderRadius: '16px', bgcolor: alpha('#F59E0B', 0.1), border: '2px dashed #F59E0B' }}>
                  <Typography variant="body1" fontWeight={800} color="#F59E0B">
                    {actividadJugando.contenido_interactivo.recompensa}
                  </Typography>
                </Box>
              )}
            </DialogContent>
          </Box>
        )}
      </Dialog>
    </Box>
  );
};

export default RinconLudicoEstudiante;


