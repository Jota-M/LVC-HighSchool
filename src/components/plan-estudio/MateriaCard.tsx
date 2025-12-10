'use client';
import React, { useState } from 'react';
import {
  Box, Typography, IconButton, Chip, Tooltip, alpha, useTheme,
  Menu, MenuItem, ListItemIcon, ListItemText, Collapse
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  Science as LabIcon,
  ExpandMore as ExpandIcon,
  DragIndicator as DragIcon,
  CheckCircle as RequiredIcon
} from '@mui/icons-material';
import { GradoMateria } from '../../services/planEstudios';

interface MateriaCardProps {
  materia: GradoMateria;
  index: number;
  onEdit: (materia: GradoMateria) => void;
  onDelete: (materia: GradoMateria) => void;
  isDragging?: boolean;
}

const MateriaCard: React.FC<MateriaCardProps> = ({
  materia, index, onEdit, onDelete, isDragging
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const areaColor = materia.area_color || theme.palette.grey[400];

  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        position: 'relative',
        borderRadius: 3,
        overflow: 'hidden',
        bgcolor: 'background.paper',
        border: `1px solid ${alpha(areaColor, 0.3)}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isDragging ? 'rotate(3deg) scale(1.02)' : isHovered ? 'translateY(-4px)' : 'none',
        boxShadow: isDragging
          ? `0 20px 40px ${alpha(areaColor, 0.3)}`
          : isHovered
          ? `0 12px 24px ${alpha(areaColor, 0.2)}`
          : `0 2px 8px ${alpha(theme.palette.common.black, 0.08)}`,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${areaColor}, ${alpha(areaColor, 0.5)})`,
        }
      }}
    >
      {/* Header de la Card */}
      <Box sx={{ p: 2, pt: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          {/* Drag Handle */}
          <Box sx={{
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.2s',
            cursor: 'grab',
            color: 'text.disabled',
            mt: 0.5
          }}>
            <DragIcon fontSize="small" />
          </Box>

          {/* Número de orden */}
          <Box sx={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            bgcolor: alpha(areaColor, 0.15),
            color: areaColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.8rem',
            flexShrink: 0
          }}>
            {index + 1}
          </Box>

          {/* Info Principal */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography
                variant="subtitle1"
                fontWeight="700"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {materia.materia_nombre}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={materia.materia_codigo}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  bgcolor: alpha(areaColor, 0.1),
                  color: areaColor,
                  border: `1px solid ${alpha(areaColor, 0.3)}`
                }}
              />
              
              {materia.es_obligatoria && (
                <Tooltip title="Materia Obligatoria">
                  <Chip
                    icon={<RequiredIcon sx={{ fontSize: 14 }} />}
                    label="Req"
                    size="small"
                    color="primary"
                    sx={{ height: 22, fontSize: '0.65rem' }}
                  />
                </Tooltip>
              )}
              
              {materia.tiene_laboratorio && (
                <Tooltip title="Incluye Laboratorio">
                  <Chip
                    icon={<LabIcon sx={{ fontSize: 14 }} />}
                    label="Lab"
                    size="small"
                    color="secondary"
                    sx={{ height: 22, fontSize: '0.65rem' }}
                  />
                </Tooltip>
              )}
            </Box>
          </Box>

          {/* Menú de acciones */}
          <IconButton
            size="small"
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{
              opacity: isHovered ? 1 : 0.5,
              transition: 'opacity 0.2s'
            }}
          >
            <MoreIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Stats rápidos */}
        <Box sx={{
          display: 'flex',
          gap: 2,
          mt: 2,
          pt: 1.5,
          borderTop: `1px dashed ${alpha(theme.palette.divider, 0.5)}`
        }}>
          <Tooltip title="Horas semanales">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="caption" fontWeight="600">
                {materia.horas_semanales || 0}h
              </Typography>
            </Box>
          </Tooltip>
          
          <Tooltip title="Créditos">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <StarIcon sx={{ fontSize: 16, color: 'warning.main' }} />
              <Typography variant="caption" fontWeight="600">
                {materia.creditos || 0}
              </Typography>
            </Box>
          </Tooltip>
          
          <Box sx={{ flex: 1 }} />
          
          <Tooltip title="Ver detalles">
            <IconButton
              size="small"
              onClick={() => setExpanded(!expanded)}
              sx={{
                transform: expanded ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s'
              }}
            >
              <ExpandIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Detalles expandibles */}
      <Collapse in={expanded}>
        <Box sx={{
          px: 2,
          pb: 2,
          pt: 0,
          bgcolor: alpha(theme.palette.grey[500], 0.03)
        }}>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 1.5,
            fontSize: '0.8rem'
          }}>
            <Box>
              <Typography variant="caption" color="text.secondary">Área</Typography>
              <Typography variant="body2" fontWeight="500">
                {materia.area_nombre || 'Sin área'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Nota Mínima</Typography>
              <Typography variant="body2" fontWeight="500">
                {materia.nota_minima_aprobacion} pts
              </Typography>
            </Box>
            {materia.peso_porcentual && (
              <Box>
                <Typography variant="caption" color="text.secondary">Peso</Typography>
                <Typography variant="body2" fontWeight="500">
                  {materia.peso_porcentual}%
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Collapse>

      {/* Menú contextual */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => { setAnchorEl(null); onEdit(materia); }}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Editar configuración</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setAnchorEl(null); onDelete(materia); }} sx={{ color: 'error.main' }}>
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Remover del plan</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default MateriaCard;