'use client';
// components/materiales/detalle/VisorArchivo.tsx

import React, { useState } from 'react';
import {
  Box, Typography, Button, alpha, useTheme,
  CircularProgress, IconButton, Tooltip, Chip,
} from '@mui/material';
import {
  OpenInNew as OpenIcon,
  Download as DownloadIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Fullscreen as FullscreenIcon,
  BrokenImage as BrokenIcon,
} from '@mui/icons-material';
import { MaterialAcademico } from '@/types/materialTypes';
import { materialAcademicoService } from '@/services/materialService';

interface VisorArchivoProps {
  material:   MaterialAcademico;
  matriculaId?: number;
  accent:     string;
  accentDark: string;
  isDark:     boolean;
}

type VisorMode = 'embed' | 'error' | 'loading';

export const VisorArchivo: React.FC<VisorArchivoProps> = ({
  material, matriculaId, accent, accentDark, isDark,
}) => {
  const [mode, setMode]   = useState<VisorMode>('loading');
  const [zoom, setZoom]   = useState(100);
  const gradient = `linear-gradient(135deg, ${accent}, ${accentDark})`;

  const url = material.es_enlace_externo ? material.url_externa : material.url_archivo;
  const mime = material.tipo_mime ?? '';

  // Tipo de visor a usar
  const isPDF       = mime.includes('pdf') || url?.toLowerCase().includes('.pdf');
  const isVideo     = mime.includes('video') || ['mp4','mov','avi','webm'].some(e => url?.includes(e));
  const isImage     = mime.includes('image') || ['jpg','jpeg','png','gif','webp'].some(e => url?.includes(e));
  const isYouTube   = url?.includes('youtube.com') || url?.includes('youtu.be');
  const isDrive     = url?.includes('drive.google.com');
  const isOffice    = mime.includes('word') || mime.includes('presentation') || mime.includes('sheet')
                      || ['doc','docx','ppt','pptx','xls','xlsx'].some(e => url?.includes(`.${e}`));

  // Construir URL para embed
  const getEmbedUrl = (): string => {
    if (!url) return '';
    if (isYouTube) {
      const match = url.match(/(?:v=|youtu\.be\/)([^&\s]+)/);
      return match ? `https://www.youtube-nocookie.com/embed/${match[1]}` : url;
    }
    if (isDrive) {
      // https://drive.google.com/file/d/ID/view → embed
      const match = url.match(/\/d\/([^/]+)/);
      return match ? `https://drive.google.com/file/d/${match[1]}/preview` : url;
    }
    if (isOffice) {
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
    }
    return url;
  };

  const registrarDescarga = async () => {
    await materialAcademicoService.registrarAcceso(material.id, {
      tipo_accion: 'descarga',
      matricula_id: matriculaId,
    });
  };

  const registrarVisualizacion = async () => {
    await materialAcademicoService.registrarAcceso(material.id, {
      tipo_accion: 'visualizacion',
      matricula_id: matriculaId,
    });
  };

  if (!url) {
    return (
      <Box
        sx={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', height: 300, gap: 2,
          borderRadius: '14px',
          border: `1px dashed ${alpha(accent, 0.3)}`,
        }}
      >
        <BrokenIcon sx={{ fontSize: 48, color: alpha(accent, 0.4) }} />
        <Typography variant="body2" color="text.secondary">
          No hay archivo disponible para este material.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* ── Barra de controles ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 1.5,
          p: 1,
          borderRadius: '10px',
          bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.03),
          flexWrap: 'wrap',
        }}
      >
        {/* Tipo de archivo */}
        <Chip
          label={material.tipo_material_nombre || 'Archivo'}
          size="small"
          sx={{
            height: 24, fontSize: '0.7rem', fontWeight: 600,
            bgcolor: alpha(material.tipo_material_color || accent, 0.12),
            color: material.tipo_material_color || accent,
          }}
        />

        {material.nombre_archivo && (
          <Typography variant="caption" color="text.secondary" noWrap sx={{ flex: 1, minWidth: 0 }}>
            {material.nombre_archivo}
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 0.5, ml: 'auto' }}>
          {/* Zoom (solo PDF e imagen) */}
          {(isPDF || isImage) && (
            <>
              <Tooltip title="Reducir">
                <IconButton size="small" onClick={() => setZoom(z => Math.max(z - 25, 50))}>
                  <ZoomOutIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
              <Typography variant="caption" sx={{ alignSelf: 'center', minWidth: 36, textAlign: 'center' }}>
                {zoom}%
              </Typography>
              <Tooltip title="Ampliar">
                <IconButton size="small" onClick={() => setZoom(z => Math.min(z + 25, 200))}>
                  <ZoomInIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </>
          )}

          {/* Abrir en nueva pestaña */}
          <Tooltip title="Abrir en nueva pestaña">
            <IconButton
              size="small"
              component="a"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={registrarVisualizacion}
            >
              <OpenIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>

          {/* Descargar (solo archivos físicos) */}
          {!material.es_enlace_externo && (
            <Tooltip title="Descargar">
              <IconButton
                size="small"
                component="a"
                href={url}
                download={material.nombre_archivo || 'archivo'}
                onClick={registrarDescarga}
              >
                <DownloadIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* ── Área del visor ── */}
      <Box
        sx={{
          borderRadius: '14px',
          overflow: 'hidden',
          border: `1px solid ${isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08)}`,
          bgcolor: isDark ? alpha('#000', 0.3) : '#fafafa',
          position: 'relative',
          minHeight: 480,
        }}
      >
        {/* PDF embebido */}
        {isPDF && !material.es_enlace_externo && (
          <iframe
            src={`${url}#zoom=${zoom}`}
            style={{
              width: `${(100 * 100) / zoom}%`,
              height: '600px',
              border: 'none',
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top left',
            }}
            title={material.titulo}
            onLoad={() => setMode('embed')}
            onError={() => setMode('error')}
          />
        )}

        {/* Video nativo */}
        {isVideo && !material.es_enlace_externo && (
          <video
            controls
            style={{ width: '100%', maxHeight: 500, display: 'block' }}
            onCanPlay={() => setMode('embed')}
            onError={() => setMode('error')}
          >
            <source src={url} type={mime || 'video/mp4'} />
            Tu navegador no soporta reproducción de video.
          </video>
        )}

        {/* Imagen */}
        {isImage && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              p: 2,
              minHeight: 300,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={material.titulo}
              style={{
                maxWidth: '100%',
                maxHeight: 500,
                objectFit: 'contain',
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'center',
                transition: 'transform 0.2s',
                borderRadius: 8,
              }}
              onLoad={() => setMode('embed')}
              onError={() => setMode('error')}
            />
          </Box>
        )}

        {/* YouTube / Drive / Office iframe */}
        {(isYouTube || isDrive || isOffice || (material.es_enlace_externo && !isImage)) && (
          <iframe
            src={getEmbedUrl()}
            style={{ width: '100%', height: '520px', border: 'none' }}
            title={material.titulo}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={() => setMode('embed')}
            onError={() => setMode('error')}
          />
        )}

        {/* Archivos que no se pueden previsualizar (Word, Excel sin Office viewer) */}
        {!isPDF && !isVideo && !isImage && !isYouTube && !isDrive && !isOffice && !material.es_enlace_externo && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: 300,
              gap: 2,
            }}
          >
            <Typography variant="h2">
              {material.tipo_material_icono || '📄'}
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              Vista previa no disponible
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Este tipo de archivo no puede previsualizarse en el navegador.
            </Typography>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              component="a"
              href={url}
              download={material.nombre_archivo}
              onClick={registrarDescarga}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
                background: gradient,
                color: isDark ? '#000' : '#fff',
              }}
            >
              Descargar archivo
            </Button>
          </Box>
        )}
      </Box>

      {/* ── Botones de acción principales ── */}
      <Box sx={{ display: 'flex', gap: 1.5, mt: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={<OpenIcon />}
          component="a"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={registrarVisualizacion}
          sx={{
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 600,
            background: gradient,
            color: isDark ? '#000' : '#fff',
          }}
        >
          {material.es_enlace_externo ? 'Abrir enlace' : 'Abrir en nueva pestaña'}
        </Button>

        {!material.es_enlace_externo && (
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            component="a"
            href={url}
            download={material.nombre_archivo}
            onClick={registrarDescarga}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
              borderColor: alpha(accent, 0.5),
              color: accent,
              '&:hover': { borderColor: accent, bgcolor: alpha(accent, 0.06) },
            }}
          >
            Descargar
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default VisorArchivo;