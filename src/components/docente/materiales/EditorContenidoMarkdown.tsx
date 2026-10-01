'use client';
// components/docente/materiales/EditorContenidoMarkdown.tsx

import React, { useState, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Box, Typography, Button, IconButton, Tooltip, Divider,
  ToggleButtonGroup, ToggleButton, Menu, MenuItem, ListItemIcon,
  ListItemText, alpha, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, Chip
} from '@mui/material';
import {
  FormatBold as BoldIcon,
  FormatItalic as ItalicIcon,
  StrikethroughS as StrikethroughIcon,
  Code as CodeIcon,
  FormatListBulleted as BulletListIcon,
  FormatListNumbered as NumberListIcon,
  Checklist as ChecklistIcon,
  TableChart as TableIcon,
  FormatQuote as QuoteIcon,
  LightbulbOutlined as LightbulbIcon,
  Link as LinkIcon,
  HorizontalRule as HorizontalRuleIcon,
  Title as TitleIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  VerticalSplit as SplitViewIcon,
  WarningAmber as WarningIcon,
  MenuBook as ExampleIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

interface EditorContenidoMarkdownProps {
  value: string;
  onChange: (newValue: string) => void;
  accent: string;
  accentDark?: string;
  isDark: boolean;
  minRows?: number;
  placeholder?: string;
}

type ModoVista = 'editor' | 'dividido' | 'preview';

export const EditorContenidoMarkdown: React.FC<EditorContenidoMarkdownProps> = ({
  value,
  onChange,
  accent,
  accentDark,
  isDark,
  minRows = 16,
  placeholder = 'Redacta el contenido didáctico aquí o usa los atajos superiores...',
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [modoVista, setModoVista] = useState<ModoVista>('dividido');

  // Menús desplegables
  const [anchorTitulos, setAnchorTitulos] = useState<null | HTMLElement>(null);
  const [anchorTabla, setAnchorTabla] = useState<null | HTMLElement>(null);
  const [anchorNotas, setAnchorNotas] = useState<null | HTMLElement>(null);

  // Diálogo para Enlace
  const [modalEnlaceOpen, setModalEnlaceOpen] = useState(false);
  const [textoEnlace, setTextoEnlace] = useState('');
  const [urlEnlace, setUrlEnlace] = useState('');

  // Estadísticas
  const stats = useMemo(() => {
    const texto = value.trim();
    if (!texto) return { palabras: 0, caracteres: 0, tiempoLectura: 0 };
    const palabras = texto.split(/\s+/).filter(Boolean).length;
    const caracteres = texto.length;
    const tiempoLectura = Math.max(1, Math.ceil(palabras / 200));
    return { palabras, caracteres, tiempoLectura };
  }, [value]);

  // ─────────────────────────────────────────────────────────
  // Helpers de inserción y formateo
  // ─────────────────────────────────────────────────────────
  const applyFormat = (prefix: string, suffix = '', defaultText = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);
    const toInsert = selected || defaultText;

    const nuevoContenido =
      textarea.value.substring(0, start) +
      prefix +
      toInsert +
      suffix +
      textarea.value.substring(end);

    onChange(nuevoContenido);

    setTimeout(() => {
      textarea.focus();
      if (selected) {
        textarea.setSelectionRange(start + prefix.length, end + prefix.length);
      } else {
        textarea.setSelectionRange(
          start + prefix.length,
          start + prefix.length + defaultText.length
        );
      }
    }, 10);
  };

  const applyLinePrefix = (prefix: string | ((idx: number) => string)) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const lineStart = text.lastIndexOf('\n', start - 1) + 1;
    let lineEnd = text.indexOf('\n', end);
    if (lineEnd === -1) lineEnd = text.length;

    const lines = text.substring(lineStart, lineEnd).split('\n');
    const transformed = lines
      .map((line, i) => {
        const p = typeof prefix === 'function' ? prefix(i + 1) : prefix;
        if (typeof prefix === 'string' && line.startsWith(prefix)) {
          return line.substring(prefix.length);
        }
        return `${p}${line}`;
      })
      .join('\n');

    const nuevoContenido =
      text.substring(0, lineStart) + transformed + text.substring(lineEnd);

    onChange(nuevoContenido);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(lineStart, lineStart + transformed.length);
    }, 10);
  };

  const insertTable = (cols = 3, rows = 3) => {
    setAnchorTabla(null);
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    let header = '|';
    let divider = '|';
    for (let c = 1; c <= cols; c++) {
      header += ` Columna ${c} |`;
      divider += ' :--- |';
    }

    let body = '';
    for (let r = 1; r <= rows; r++) {
      body += '\n|';
      for (let c = 1; c <= cols; c++) {
        body += ` Fila ${r}.${c} |`;
      }
    }

    const tableMd = `\n\n${header}\n${divider}${body}\n\n`;

    const nuevoContenido =
      textarea.value.substring(0, start) +
      tableMd +
      textarea.value.substring(end);

    onChange(nuevoContenido);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + 2, start + tableMd.length - 2);
    }, 10);
  };

  const insertCallout = (tipo: 'nota' | 'ejemplo' | 'alerta') => {
    setAnchorNotas(null);
    let md = '';
    if (tipo === 'nota') {
      md = '\n\n> 💡 **Nota importante:** Escribe aquí el concepto o aclaración clave para tus estudiantes.\n\n';
    } else if (tipo === 'ejemplo') {
      md = '\n\n> 📝 **Ejemplo resuelto:** Explica un caso práctico o ejercicio demostrativo paso a paso.\n\n';
    } else {
      md = '\n\n> ⚠️ **Atención:** Ten presente este error común o advertencia de estudio.\n\n';
    }
    applyFormat(md, '', '');
  };

  const handleAbrirModalEnlace = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      const selected = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
      setTextoEnlace(selected || '');
    } else {
      setTextoEnlace('');
    }
    setUrlEnlace('');
    setModalEnlaceOpen(true);
  };

  const handleInsertarEnlaceConfirmado = () => {
    const text = textoEnlace.trim() || 'enlace';
    const url = urlEnlace.trim() || 'https://';
    applyFormat(`[${text}](${url})`, '', '');
    setModalEnlaceOpen(false);
  };

  // Atajos de teclado en el textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key.toLowerCase() === 'b') {
        e.preventDefault();
        applyFormat('**', '**', 'texto en negrita');
      } else if (e.key.toLowerCase() === 'i') {
        e.preventDefault();
        applyFormat('*', '*', 'texto en cursiva');
      } else if (e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handleAbrirModalEnlace();
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      applyFormat('  ', '', '');
    }
  };

  // ─────────────────────────────────────────────────────────
  // Estilo común para el render de Markdown
  // ─────────────────────────────────────────────────────────
  const markdownRenderStyles = {
    color: 'text.primary',
    fontSize: '0.875rem',
    lineHeight: 1.75,
    '& h1': {
      fontSize: '1.4rem', fontWeight: 800, mt: 3, mb: 1.5,
      letterSpacing: '-0.02em', color: accent,
      borderBottom: `1px solid ${alpha(accent, 0.2)}`, pb: 0.5
    },
    '& h2': {
      fontSize: '1.2rem', fontWeight: 700, mt: 2.5, mb: 1.25,
      color: 'text.primary', letterSpacing: '-0.01em',
      '&:first-of-type': { mt: 0 }
    },
    '& h3': {
      fontSize: '1.05rem', fontWeight: 700, mt: 2, mb: 1,
      color: 'text.primary'
    },
    '& h4': {
      fontSize: '0.95rem', fontWeight: 700, mt: 1.75, mb: 0.75,
      color: 'text.secondary'
    },
    '& p': {
      fontSize: '0.88rem', lineHeight: 1.8,
      color: isDark ? alpha('#fff', 0.88) : alpha('#000', 0.85),
      mb: 1.5
    },
    '& ul, & ol': { pl: 3, mb: 1.5 },
    '& li': {
      fontSize: '0.88rem', lineHeight: 1.75,
      color: isDark ? alpha('#fff', 0.85) : alpha('#000', 0.82),
      mb: 0.4
    },
    '& strong': {
      color: isDark ? '#fff' : '#000',
      fontWeight: 700
    },
    '& em': {
      color: 'text.primary',
      fontStyle: 'italic'
    },
    '& code': {
      fontFamily: 'Consolas, Monaco, monospace',
      fontSize: '0.82rem', px: 0.7, py: 0.2,
      borderRadius: '5px',
      bgcolor: alpha(accent, 0.12),
      color: accent,
      border: `1px solid ${alpha(accent, 0.2)}`
    },
    '& pre': {
      p: 1.5, borderRadius: '8px',
      bgcolor: isDark ? alpha('#000', 0.4) : alpha('#000', 0.05),
      overflowX: 'auto', mb: 2,
      '& code': {
        border: 'none', bgcolor: 'transparent', p: 0
      }
    },
    '& blockquote': {
      borderLeft: `4px solid ${accent}`,
      pl: 2, pr: 1.5, py: 1, my: 2, ml: 0,
      borderRadius: '0 8px 8px 0',
      bgcolor: alpha(accent, 0.06),
      color: 'text.primary',
      '& p': { mb: 0 }
    },
    '& table': {
      width: '100%', borderCollapse: 'collapse', my: 2,
      fontSize: '0.84rem', borderRadius: '8px', overflow: 'hidden',
      border: `1px solid ${isDark ? alpha('#fff', 0.12) : alpha('#000', 0.12)}`
    },
    '& th, & td': {
      border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
      p: '8px 12px', textAlign: 'left'
    },
    '& th': {
      bgcolor: alpha(accent, 0.12),
      fontWeight: 700, color: 'text.primary'
    },
    '& tr:nth-of-type(even)': {
      bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.015)
    },
    '& hr': {
      border: 'none',
      borderTop: `1px dashed ${isDark ? alpha('#fff', 0.15) : alpha('#000', 0.15)}`,
      my: 3
    },
    '& a': {
      color: accent,
      textDecoration: 'underline',
      fontWeight: 600,
      '&:hover': { opacity: 0.85 }
    }
  };

  return (
    <Box sx={{
      display: 'flex', flexDirection: 'column',
      borderRadius: '12px', overflow: 'hidden',
      border: `1px solid ${isDark ? alpha('#fff', 0.12) : alpha('#000', 0.12)}`,
      bgcolor: isDark ? alpha('#fff', 0.01) : '#fff',
      boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.4)' : '0 2px 12px rgba(0,0,0,0.04)',
    }}>
      {/* ══════════════════════════════════════════════════════════ */}
      {/* BARRA SUPERIOR DE HERRAMIENTAS (Word-Style Ribbon)       */}
      {/* ══════════════════════════════════════════════════════════ */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 0.75, px: 1.5, py: 1,
        bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.025),
        borderBottom: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
      }}>
        {/* GRUPO DE BOTONES DE EDICIÓN */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
          {/* Selector de Títulos */}
          <Button
            size="small"
            variant="text"
            startIcon={<TitleIcon sx={{ fontSize: 16 }} />}
            onClick={(e) => setAnchorTitulos(e.currentTarget)}
            sx={{
              textTransform: 'none', fontSize: '0.76rem', fontWeight: 700,
              color: 'text.primary', height: 30, px: 1,
              borderRadius: '6px',
              '&:hover': { bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06) }
            }}
          >
            Títulos ▾
          </Button>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 20, my: 'auto' }} />

          {/* Formato de texto básico */}
          <Tooltip title="Negrita (Ctrl+B)" arrow>
            <IconButton
              size="small"
              onClick={() => applyFormat('**', '**', 'texto en negrita')}
              sx={{
                width: 28, height: 28, borderRadius: '6px',
                color: 'text.primary',
                '&:hover': { bgcolor: alpha(accent, 0.15), color: accent }
              }}
            >
              <BoldIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Cursiva (Ctrl+I)" arrow>
            <IconButton
              size="small"
              onClick={() => applyFormat('*', '*', 'texto en cursiva')}
              sx={{
                width: 28, height: 28, borderRadius: '6px',
                color: 'text.primary',
                '&:hover': { bgcolor: alpha(accent, 0.15), color: accent }
              }}
            >
              <ItalicIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Tachado" arrow>
            <IconButton
              size="small"
              onClick={() => applyFormat('~~', '~~', 'texto tachado')}
              sx={{
                width: 28, height: 28, borderRadius: '6px',
                color: 'text.primary',
                '&:hover': { bgcolor: alpha(accent, 0.15), color: accent }
              }}
            >
              <StrikethroughIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Código o término destacado en línea" arrow>
            <IconButton
              size="small"
              onClick={() => applyFormat('`', '`', 'código')}
              sx={{
                width: 28, height: 28, borderRadius: '6px',
                color: 'text.primary',
                '&:hover': { bgcolor: alpha(accent, 0.15), color: accent }
              }}
            >
              <CodeIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 20, my: 'auto' }} />

          {/* Listas */}
          <Tooltip title="Lista con viñetas" arrow>
            <IconButton
              size="small"
              onClick={() => applyLinePrefix('- ')}
              sx={{
                width: 28, height: 28, borderRadius: '6px',
                color: 'text.primary',
                '&:hover': { bgcolor: alpha(accent, 0.15), color: accent }
              }}
            >
              <BulletListIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Lista numerada" arrow>
            <IconButton
              size="small"
              onClick={() => applyLinePrefix((i) => `${i}. `)}
              sx={{
                width: 28, height: 28, borderRadius: '6px',
                color: 'text.primary',
                '&:hover': { bgcolor: alpha(accent, 0.15), color: accent }
              }}
            >
              <NumberListIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Lista de tareas / verificación" arrow>
            <IconButton
              size="small"
              onClick={() => applyLinePrefix('- [ ] ')}
              sx={{
                width: 28, height: 28, borderRadius: '6px',
                color: 'text.primary',
                '&:hover': { bgcolor: alpha(accent, 0.15), color: accent }
              }}
            >
              <ChecklistIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 20, my: 'auto' }} />

          {/* Tablas */}
          <Button
            size="small"
            variant="text"
            startIcon={<TableIcon sx={{ fontSize: 16 }} />}
            onClick={(e) => setAnchorTabla(e.currentTarget)}
            sx={{
              textTransform: 'none', fontSize: '0.76rem', fontWeight: 600,
              color: 'text.primary', height: 30, px: 1, borderRadius: '6px',
              '&:hover': { bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06) }
            }}
          >
            Tabla ▾
          </Button>

          {/* Notas pedagógicas y citas */}
          <Button
            size="small"
            variant="text"
            startIcon={<LightbulbIcon sx={{ fontSize: 16 }} />}
            onClick={(e) => setAnchorNotas(e.currentTarget)}
            sx={{
              textTransform: 'none', fontSize: '0.76rem', fontWeight: 600,
              color: 'text.primary', height: 30, px: 1, borderRadius: '6px',
              '&:hover': { bgcolor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06) }
            }}
          >
            Nota / Tip ▾
          </Button>

          {/* Cita simple */}
          <Tooltip title="Cita en bloque" arrow>
            <IconButton
              size="small"
              onClick={() => applyLinePrefix('> ')}
              sx={{
                width: 28, height: 28, borderRadius: '6px',
                color: 'text.primary',
                '&:hover': { bgcolor: alpha(accent, 0.15), color: accent }
              }}
            >
              <QuoteIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>

          {/* Enlace */}
          <Tooltip title="Insertar enlace web (Ctrl+K)" arrow>
            <IconButton
              size="small"
              onClick={handleAbrirModalEnlace}
              sx={{
                width: 28, height: 28, borderRadius: '6px',
                color: 'text.primary',
                '&:hover': { bgcolor: alpha(accent, 0.15), color: accent }
              }}
            >
              <LinkIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>

          {/* Separador */}
          <Tooltip title="Línea divisoria horizontal" arrow>
            <IconButton
              size="small"
              onClick={() => applyFormat('\n\n---\n\n', '', '')}
              sx={{
                width: 28, height: 28, borderRadius: '6px',
                color: 'text.primary',
                '&:hover': { bgcolor: alpha(accent, 0.15), color: accent }
              }}
            >
              <HorizontalRuleIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* SELECTOR DE MODO DE VISTA */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ToggleButtonGroup
            value={modoVista}
            exclusive
            size="small"
            onChange={(_, val) => val && setModoVista(val)}
            sx={{
              height: 28,
              '& .MuiToggleButton-root': {
                px: 1.2, py: 0, fontSize: '0.72rem', textTransform: 'none', fontWeight: 600,
                borderColor: isDark ? alpha('#fff', 0.12) : alpha('#000', 0.12),
                '&.Mui-selected': {
                  bgcolor: alpha(accent, 0.18),
                  color: accent,
                  fontWeight: 700,
                }
              }
            }}
          >
            <ToggleButton value="editor">
              <Tooltip title="Solo editor" arrow>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <EditIcon sx={{ fontSize: 14 }} />
                  <Typography sx={{ fontSize: 'inherit', display: { xs: 'none', sm: 'inline' } }}>Editar</Typography>
                </Box>
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="dividido">
              <Tooltip title="Vista dividida (Editor + Vista previa en vivo)" arrow>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <SplitViewIcon sx={{ fontSize: 14 }} />
                  <Typography sx={{ fontSize: 'inherit', display: { xs: 'none', md: 'inline' } }}>Dividida</Typography>
                </Box>
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="preview">
              <Tooltip title="Vista previa final para el estudiante" arrow>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <VisibilityIcon sx={{ fontSize: 14 }} />
                  <Typography sx={{ fontSize: 'inherit', display: { xs: 'none', sm: 'inline' } }}>Vista previa</Typography>
                </Box>
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* CUERPO DEL EDITOR (SEGÚN MODO DE VISTA)                   */}
      {/* ══════════════════════════════════════════════════════════ */}
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        minHeight: `${minRows * 22}px`,
        position: 'relative'
      }}>
        {/* PANEL IZQUIERDO: TEXTAREA / EDITOR */}
        {(modoVista === 'editor' || modoVista === 'dividido') && (
          <Box sx={{
            flex: modoVista === 'dividido' ? 1 : '1 1 100%',
            p: 2,
            borderRight: modoVista === 'dividido'
              ? `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`
              : 'none',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              rows={minRows}
              style={{
                width: '100%',
                flex: 1,
                border: 'none',
                outline: 'none',
                resize: 'vertical',
                background: 'transparent',
                color: isDark ? '#f1f5f9' : '#1e293b',
                fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                fontSize: '0.85rem',
                lineHeight: 1.65,
                boxSizing: 'border-box',
                padding: '4px',
              }}
            />
          </Box>
        )}

        {/* PANEL DERECHO: VISTA PREVIA RENDERIZADA */}
        {(modoVista === 'preview' || modoVista === 'dividido') && (
          <Box sx={{
            flex: modoVista === 'dividido' ? 1 : '1 1 100%',
            p: 2.5,
            overflowY: 'auto',
            maxHeight: modoVista === 'dividido' ? '700px' : 'none',
            bgcolor: modoVista === 'dividido'
              ? isDark ? alpha('#000', 0.25) : alpha('#000', 0.015)
              : 'transparent',
          }}>
            {modoVista === 'dividido' && (
              <Typography sx={{
                fontSize: '0.66rem', fontWeight: 700, color: 'text.disabled',
                letterSpacing: '0.08em', textTransform: 'uppercase', mb: 1.5,
                display: 'flex', alignItems: 'center', gap: 0.5
              }}>
                <VisibilityIcon sx={{ fontSize: 13 }} /> Vista previa en tiempo real
              </Typography>
            )}

            {value.trim() ? (
              <Box sx={markdownRenderStyles}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {value}
                </ReactMarkdown>
              </Box>
            ) : (
              <Box sx={{
                textAlign: 'center', py: 6,
                color: 'text.disabled', fontStyle: 'italic', fontSize: '0.85rem'
              }}>
                Comienza a redactar o usa los botones de la barra superior para ver la vista previa aquí.
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* BARRA DE ESTADO INFERIOR                                  */}
      {/* ══════════════════════════════════════════════════════════ */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 1, px: 2, py: 0.85,
        bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02),
        borderTop: `1px solid ${isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06)}`,
        fontSize: '0.72rem', color: 'text.secondary'
      }}>
        {/* Tips rápidos */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Typography sx={{ fontSize: 'inherit', color: 'text.disabled', display: { xs: 'none', sm: 'inline' } }}>
            💡 <strong>Atajos:</strong> Ctrl+B Negrita · Ctrl+I Cursiva · Ctrl+K Enlace · Tab Sangría
          </Typography>
        </Box>

        {/* Contadores */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Chip
            label={`${stats.palabras} palabras`}
            size="small"
            sx={{ height: 20, fontSize: '0.68rem', fontWeight: 600 }}
          />
          <Typography sx={{ fontSize: 'inherit', color: 'text.disabled' }}>
            {stats.caracteres} caracteres
          </Typography>
          <Typography sx={{ fontSize: 'inherit', color: accent, fontWeight: 600 }}>
            ~{stats.tiempoLectura} min lectura
          </Typography>
        </Box>
      </Box>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* MENÚ DESPLEGABLE: TÍTULOS                                 */}
      {/* ══════════════════════════════════════════════════════════ */}
      <Menu
        anchorEl={anchorTitulos}
        open={Boolean(anchorTitulos)}
        onClose={() => setAnchorTitulos(null)}
        slotProps={{
          paper: {
            sx: { borderRadius: '10px', minWidth: 200, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }
          }
        }}
      >
        <MenuItem onClick={() => { setAnchorTitulos(null); applyLinePrefix('# '); }}>
          <ListItemText primary="Título 1 (Principal)" secondary="Encabezado de gran tamaño (#)" primaryTypographyProps={{ fontSize: '0.82rem', fontWeight: 700 }} secondaryTypographyProps={{ fontSize: '0.68rem' }} />
        </MenuItem>
        <MenuItem onClick={() => { setAnchorTitulos(null); applyLinePrefix('## '); }}>
          <ListItemText primary="Título 2 (Sección)" secondary="Subtítulo de sección (##)" primaryTypographyProps={{ fontSize: '0.82rem', fontWeight: 700 }} secondaryTypographyProps={{ fontSize: '0.68rem' }} />
        </MenuItem>
        <MenuItem onClick={() => { setAnchorTitulos(null); applyLinePrefix('### '); }}>
          <ListItemText primary="Título 3 (Subsección)" secondary="Tema secundario (###)" primaryTypographyProps={{ fontSize: '0.82rem', fontWeight: 600 }} secondaryTypographyProps={{ fontSize: '0.68rem' }} />
        </MenuItem>
        <MenuItem onClick={() => { setAnchorTitulos(null); applyLinePrefix('#### '); }}>
          <ListItemText primary="Título 4 (Menor)" secondary="Epígrafe o punto específico (####)" primaryTypographyProps={{ fontSize: '0.82rem', fontWeight: 600 }} secondaryTypographyProps={{ fontSize: '0.68rem' }} />
        </MenuItem>
      </Menu>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* MENÚ DESPLEGABLE: TABLAS                                  */}
      {/* ══════════════════════════════════════════════════════════ */}
      <Menu
        anchorEl={anchorTabla}
        open={Boolean(anchorTabla)}
        onClose={() => setAnchorTabla(null)}
        slotProps={{
          paper: {
            sx: { borderRadius: '10px', minWidth: 220, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }
          }
        }}
      >
        <MenuItem onClick={() => insertTable(2, 3)}>
          <ListItemIcon><TableIcon sx={{ fontSize: 18 }} /></ListItemIcon>
          <ListItemText primary="Tabla de 2 columnas" secondary="2 encabezados × 3 filas" primaryTypographyProps={{ fontSize: '0.82rem', fontWeight: 600 }} secondaryTypographyProps={{ fontSize: '0.68rem' }} />
        </MenuItem>
        <MenuItem onClick={() => insertTable(3, 4)}>
          <ListItemIcon><TableIcon sx={{ fontSize: 18 }} /></ListItemIcon>
          <ListItemText primary="Tabla de 3 columnas" secondary="3 encabezados × 4 filas (estándar)" primaryTypographyProps={{ fontSize: '0.82rem', fontWeight: 600 }} secondaryTypographyProps={{ fontSize: '0.68rem' }} />
        </MenuItem>
        <MenuItem onClick={() => insertTable(4, 4)}>
          <ListItemIcon><TableIcon sx={{ fontSize: 18 }} /></ListItemIcon>
          <ListItemText primary="Tabla de 4 columnas" secondary="4 encabezados × 4 filas" primaryTypographyProps={{ fontSize: '0.82rem', fontWeight: 600 }} secondaryTypographyProps={{ fontSize: '0.68rem' }} />
        </MenuItem>
      </Menu>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* MENÚ DESPLEGABLE: NOTAS Y TIPS PEDAGÓGICOS                */}
      {/* ══════════════════════════════════════════════════════════ */}
      <Menu
        anchorEl={anchorNotas}
        open={Boolean(anchorNotas)}
        onClose={() => setAnchorNotas(null)}
        slotProps={{
          paper: {
            sx: { borderRadius: '10px', minWidth: 240, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }
          }
        }}
      >
        <MenuItem onClick={() => insertCallout('nota')}>
          <ListItemIcon><LightbulbIcon sx={{ fontSize: 18, color: '#eab308' }} /></ListItemIcon>
          <ListItemText primary="Nota Importante" secondary="Destaca un concepto central 💡" primaryTypographyProps={{ fontSize: '0.82rem', fontWeight: 600 }} secondaryTypographyProps={{ fontSize: '0.68rem' }} />
        </MenuItem>
        <MenuItem onClick={() => insertCallout('ejemplo')}>
          <ListItemIcon><ExampleIcon sx={{ fontSize: 18, color: '#3b82f6' }} /></ListItemIcon>
          <ListItemText primary="Ejemplo Demostrativo" secondary="Muestra un ejercicio o aplicación práctica 📝" primaryTypographyProps={{ fontSize: '0.82rem', fontWeight: 600 }} secondaryTypographyProps={{ fontSize: '0.68rem' }} />
        </MenuItem>
        <MenuItem onClick={() => insertCallout('alerta')}>
          <ListItemIcon><WarningIcon sx={{ fontSize: 18, color: '#ef4444' }} /></ListItemIcon>
          <ListItemText primary="Alerta o Advertencia" secondary="Resalta errores comunes o precauciones ⚠️" primaryTypographyProps={{ fontSize: '0.82rem', fontWeight: 600 }} secondaryTypographyProps={{ fontSize: '0.68rem' }} />
        </MenuItem>
      </Menu>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* DIÁLOGO: INSERTAR ENLACE                                  */}
      {/* ══════════════════════════════════════════════════════════ */}
      <Dialog
        open={modalEnlaceOpen}
        onClose={() => setModalEnlaceOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px !important',
            overflow: 'hidden',
            background: isDark ? '#09101d' : '#ffffff',
            border: `1.5px solid ${isDark ? 'rgba(250,204,21,0.25)' : 'rgba(2,136,209,0.25)'}`,
            boxShadow: isDark
              ? '0 0 0 1px rgba(250,204,21,0.06), 0 32px 64px rgba(0,0,0,0.8)'
              : '0 32px 64px rgba(0,0,0,0.18)',
          }
        }}
      >
        <Box sx={{
          px: 3, pt: 2.5, pb: 2,
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)'}`,
          background: isDark ? 'rgba(250,204,21,0.12)' : 'rgba(2,136,209,0.10)',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box>
              <Typography
                sx={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: alpha(accent, 0.8),
                  mb: 0.3,
                }}
              >
                RECURSO EXTERNO · HIPERVÍNCULO
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Box
                  sx={{
                    width: 34, height: 34, borderRadius: '9px', flexShrink: 0,
                    background: alpha(accent, 0.15),
                    border: `1px solid ${alpha(accent, 0.3)}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <LinkIcon sx={{ color: accent, fontSize: 18 }} />
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', lineHeight: 1.1, color: 'text.primary' }}>
                  Insertar enlace web
                </Typography>
              </Box>
            </Box>

            <Box
              onClick={() => setModalEnlaceOpen(false)}
              sx={{
                width: 32, height: 32, borderRadius: '9px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)'}`,
                color: 'text.secondary',
                transition: 'all 0.15s',
                '&:hover': { background: alpha(accent, 0.12), borderColor: alpha(accent, 0.4), color: accent },
              }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </Box>
          </Box>
        </Box>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, p: 3 }}>
          <TextField
            label="Texto visible para el estudiante"
            size="small"
            fullWidth
            value={textoEnlace}
            onChange={(e) => setTextoEnlace(e.target.value)}
            placeholder="Ejemplo: Ver video explicativo"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '14px',
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                '& fieldset': {
                  borderColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)',
                  borderRadius: '14px',
                },
                '&:hover fieldset': { borderColor: alpha(accent, 0.5) },
                '&.Mui-focused fieldset': { borderColor: accent, borderWidth: '1.5px' },
              },
            }}
          />
          <TextField
            label="Dirección web (URL)"
            size="small"
            fullWidth
            value={urlEnlace}
            onChange={(e) => setUrlEnlace(e.target.value)}
            placeholder="https://..."
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '14px',
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                '& fieldset': {
                  borderColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)',
                  borderRadius: '14px',
                },
                '&:hover fieldset': { borderColor: alpha(accent, 0.5) },
                '&.Mui-focused fieldset': { borderColor: accent, borderWidth: '1.5px' },
              },
            }}
          />
        </DialogContent>

        <DialogActions sx={{
          px: 3, py: 2,
          borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)'}`,
          gap: 1,
        }}>
          <Button
            onClick={() => setModalEnlaceOpen(false)}
            variant="outlined"
            sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600, fontSize: '0.82rem' }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleInsertarEnlaceConfirmado}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.82rem',
              background: `linear-gradient(135deg, ${accent}, ${accentDark ?? accent})`,
              color: isDark ? '#000' : '#fff',
              boxShadow: `0 4px 14px ${alpha(accent, 0.3)}`,
              px: 2.5,
            }}
          >
            Insertar enlace
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EditorContenidoMarkdown;
