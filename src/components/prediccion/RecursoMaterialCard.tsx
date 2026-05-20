'use client';
// components/prediccion/RecursoMaterialCard.tsx
//
// Tarjeta de material recomendado para el panel de predicción.
// Si tiene material_id real → link al repositorio.
// Si es sugerencia genérica → muestra info sin link interno.

import React from 'react';
import {
  Box, Typography, Chip, Button, alpha, Tooltip,
} from '@mui/material';
import MenuBookRoundedIcon    from '@mui/icons-material/MenuBookRounded';
import OpenInNewRoundedIcon   from '@mui/icons-material/OpenInNewRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import LinkRoundedIcon        from '@mui/icons-material/LinkRounded';
import StarRoundedIcon        from '@mui/icons-material/StarRounded';
import { RecursoRecomendado } from '@/types/prediccionTypes';

// ── Icono según tipo de material ──────────────────────────────
function getIconEmoji(tipo?: string): string {
  if (!tipo) return '📄';
  const t = tipo.toUpperCase();
  if (t === 'PDF')   return '📕';
  if (t === 'VIDEO') return '🎬';
  if (t === 'PPT')   return '📊';
  if (t === 'DOC')   return '📝';
  if (t === 'LINK')  return '🔗';
  if (t === 'IMG')   return '🖼️';
  if (t === 'AUDIO') return '🎵';
  if (t === 'CODE')  return '💻';
  return '📄';
}

// ── Color del chip de tipo ────────────────────────────────────
function getTipoColor(tipo?: string): { bg: string; color: string } {
  if (!tipo) return { bg: alpha('#6b7280', 0.12), color: '#6b7280' };
  const t = tipo.toUpperCase();
  if (t === 'PDF')   return { bg: alpha('#dc2626', 0.1),  color: '#dc2626' };
  if (t === 'VIDEO') return { bg: alpha('#8b5cf6', 0.1),  color: '#8b5cf6' };
  if (t === 'PPT')   return { bg: alpha('#f59e0b', 0.1),  color: '#f59e0b' };
  if (t === 'DOC')   return { bg: alpha('#2563eb', 0.1),  color: '#2563eb' };
  if (t === 'LINK')  return { bg: alpha('#06b6d4', 0.1),  color: '#06b6d4' };
  return { bg: alpha('#6b7280', 0.1), color: '#6b7280' };
}

interface RecursoMaterialCardProps {
  recurso:     RecursoRecomendado;
  isDark:      boolean;
  accent:      string;
  /** Ruta base para el repositorio. Default: /dashboard/docente/materiales */
  basePath?:   string;
  /** Si true, muestra el índice (1., 2., etc.) */
  index?:      number;
}

const RecursoMaterialCard: React.FC<RecursoMaterialCardProps> = ({
  recurso,
  isDark,
  accent,
  basePath = '/dashboard/docente/materiales',
  index,
}) => {
  const tieneIdReal   = recurso.material_id != null;
  const urlInterno    = tieneIdReal ? `${basePath}/${recurso.material_id}` : null;
  const urlExterno    = recurso.url;
  const tipoColors    = getTipoColor(recurso.tipo);
  const emoji         = getIconEmoji(recurso.tipo);

  return (
    <Box sx={{
      display:      'flex',
      gap:          1.2,
      p:            1.5,
      borderRadius: '12px',
      border:       `1.5px solid ${tieneIdReal
        ? alpha(accent, 0.25)
        : isDark ? alpha('#fff', 0.08) : alpha('#000', 0.07)}`,
      bgcolor:      tieneIdReal
        ? isDark ? alpha(accent, 0.05) : alpha(accent, 0.03)
        : isDark ? alpha('#fff', 0.02) : '#fff',
      transition:   'box-shadow 0.15s',
      '&:hover':    tieneIdReal ? { boxShadow: `0 4px 16px ${alpha(accent, 0.15)}` } : {},
    }}>

      {/* Índice + Emoji */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, gap: 0.5 }}>
        {index !== undefined && (
          <Typography variant="caption" sx={{ color: accent, fontWeight: 800, fontSize: 11, lineHeight: 1 }}>
            {index + 1}.
          </Typography>
        )}
        <Box sx={{
          width:        32,
          height:       32,
          borderRadius: '9px',
          bgcolor:      tieneIdReal ? alpha(accent, 0.12) : alpha('#6b7280', 0.08),
          display:      'flex',
          alignItems:   'center',
          justifyContent: 'center',
          fontSize:     '1rem',
        }}>
          {emoji}
        </Box>
      </Box>

      {/* Info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Título + badges */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.6, mb: 0.4, flexWrap: 'wrap' }}>
          <Typography
            variant="caption"
            fontWeight={700}
            sx={{ flex: 1, lineHeight: 1.4, fontSize: 11 }}
            noWrap
          >
            {recurso.titulo}
          </Typography>

          {/* Tipo */}
          <Chip
            size="small"
            label={recurso.tipo}
            sx={{
              height:   16,
              fontSize: '0.58rem',
              fontWeight: 700,
              bgcolor:  tipoColors.bg,
              color:    tipoColors.color,
              flexShrink: 0,
            }}
          />

          {/* Badge "Del repositorio" */}
          {tieneIdReal && (
            <Tooltip title="Material real del repositorio escolar">
              <Chip
                size="small"
                icon={<StarRoundedIcon sx={{ fontSize: '9px !important', color: `${accent} !important` }} />}
                label="Repositorio"
                sx={{
                  height:   16,
                  fontSize: '0.58rem',
                  fontWeight: 700,
                  bgcolor:  alpha(accent, 0.1),
                  color:    accent,
                  flexShrink: 0,
                }}
              />
            </Tooltip>
          )}
        </Box>

        {/* Tema */}
        {recurso.tema_titulo && (
          <Typography
            variant="caption"
            color="text.disabled"
            display="block"
            sx={{ fontSize: 10, mb: 0.4 }}
          >
            📚 {recurso.tema_titulo}
          </Typography>
        )}

        {/* Razón de Gemini */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mb: 0.8 }}>
          <AutoAwesomeRoundedIcon sx={{ fontSize: 11, color: '#f59e0b', mt: 0.15, flexShrink: 0 }} />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: 10, lineHeight: 1.5 }}
          >
            {recurso.razon}
          </Typography>
        </Box>

        {/* Botones de acción */}
        <Box sx={{ display: 'flex', gap: 0.8 }}>
          {/* Ver en el repositorio */}
          {urlInterno && (
            <Button
              size="small"
              variant="contained"
              href={urlInterno}
              target="_blank"
              startIcon={<MenuBookRoundedIcon sx={{ fontSize: '12px !important' }} />}
              sx={{
                fontSize:     '0.65rem',
                py:           0.3,
                px:           1,
                borderRadius: '8px',
                fontWeight:   700,
                bgcolor:      accent,
                color:        isDark ? '#000' : '#fff',
                minWidth:     0,
                '&:hover':    { bgcolor: alpha(accent, 0.85) },
              }}
            >
              Ver material
            </Button>
          )}

          {/* Enlace externo */}
          {urlExterno && (
            <Button
              size="small"
              variant="outlined"
              href={urlExterno}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<OpenInNewRoundedIcon sx={{ fontSize: '11px !important' }} />}
              sx={{
                fontSize:     '0.65rem',
                py:           0.3,
                px:           1,
                borderRadius: '8px',
                fontWeight:   700,
                borderColor:  alpha(accent, 0.4),
                color:        accent,
                minWidth:     0,
              }}
            >
              Abrir
            </Button>
          )}

          {/* Sin link disponible */}
          {!urlInterno && !urlExterno && (
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, fontStyle: 'italic' }}>
              Sin enlace disponible
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default RecursoMaterialCard;