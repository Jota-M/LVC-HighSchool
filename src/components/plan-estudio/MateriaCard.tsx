'use client';
import React, { useState } from 'react';
import {
  Box, Typography, IconButton, Chip, Tooltip, alpha, useTheme,
  Menu, MenuItem, ListItemIcon, ListItemText, Collapse, Paper
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
  CheckCircle as RequiredIcon,
  TrendingFlat as ArrowIcon
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
  const isDark = theme.palette.mode === 'dark';
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const areaColor = materia.area_color || (isDark ? '#6b7280' : '#9ca3af');

  return (
    <Paper
      elevation={0}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        background: isDark
          ? alpha('#1e293b', 0.6)
          : alpha('#ffffff', 0.9),
        border: `2px solid ${alpha(areaColor, 0.3)}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isDragging 
          ? 'rotate(2deg) scale(1.03)' 
          : isHovered 
          ? 'translateY(-8px) scale(1.01)' 
          : 'none',
        boxShadow: isDragging
          ? `0 24px 48px ${alpha(areaColor, 0.35)}`
          : isHovered
          ? `0 16px 32px ${alpha(areaColor, 0.25)}`
          : `0 4px 12px ${alpha(theme.palette.common.black, 0.08)}`,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 5,
          background: `linear-gradient(90deg, ${areaColor}, ${alpha(areaColor, 0.6)})`,
          boxShadow: `0 2px 8px ${alpha(areaColor, 0.4)}`,
        }
      }}
    >
      {/* Header de la Card */}
      <Box sx={{ p: 2.5, pt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          {/* Drag Handle */}
          <Box sx={{
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.2s',
            cursor: 'grab',
            color: 'text.disabled',
            mt: 0.5,
            '&:active': {
              cursor: 'grabbing',
            }
          }}>
            <DragIcon fontSize="small" />
          </Box>

          {/* Número de orden */}
          <Box sx={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            background: `linear-gradient(135deg, ${areaColor}, ${alpha(areaColor, 0.7)})`,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.9rem',
            flexShrink: 0,
            boxShadow: `0 4px 12px ${alpha(areaColor, 0.4)}`,
          }}>
            {index + 1}
          </Box>

          {/* Info Principal */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  lineHeight: 1.2,
                }}
              >
                {materia.materia_nombre}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1 }}>
              <Chip
                label={materia.materia_codigo}
                size="small"
                sx={{
                  height: 24,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  bgcolor: alpha(areaColor, 0.15),
                  color: areaColor,
                  border: `1px solid ${alpha(areaColor, 0.3)}`,
                }}
              />
              
              {materia.es_obligatoria && (
                <Tooltip title="Materia Obligatoria">
                  <Chip
                    icon={<RequiredIcon sx={{ fontSize: 14 }} />}
                    label="Obligatoria"
                    size="small"
                    sx={{
                      height: 24,
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      bgcolor: alpha('#10b981', 0.15),
                      color: '#10b981',
                      border: `1px solid ${alpha('#10b981', 0.3)}`,
                    }}
                  />
                </Tooltip>
              )}
              
              {materia.tiene_laboratorio && (
                <Tooltip title="Incluye Laboratorio">
                  <Chip
                    icon={<LabIcon sx={{ fontSize: 14 }} />}
                    label="Lab"
                    size="small"
                    sx={{
                      height: 24,
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      bgcolor: alpha('#8b5cf6', 0.15),
                      color: '#8b5cf6',
                      border: `1px solid ${alpha('#8b5cf6', 0.3)}`,
                    }}
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
              transition: 'all 0.2s',
              bgcolor: isHovered ? alpha(areaColor, 0.1) : 'transparent',
              '&:hover': {
                bgcolor: alpha(areaColor, 0.2),
              }
            }}
          >
            <MoreIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Stats rápidos */}
        <Box sx={{
          display: 'flex',
          gap: 3,
          mt: 2,
          pt: 2,
          borderTop: `1px dashed ${alpha(theme.palette.divider, 0.3)}`
        }}>
          <Tooltip title="Horas semanales">
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              px: 1.5,
              py: 0.75,
              borderRadius: '8px',
              bgcolor: alpha('#06b6d4', 0.1),
              border: `1px solid ${alpha('#06b6d4', 0.2)}`,
            }}>
              <ScheduleIcon sx={{ fontSize: 18, color: '#06b6d4' }} />
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#06b6d4' }}>
                {materia.horas_semanales || 0}h
              </Typography>
            </Box>
          </Tooltip>
          
          <Tooltip title="Créditos">
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              px: 1.5,
              py: 0.75,
              borderRadius: '8px',
              bgcolor: alpha('#f59e0b', 0.1),
              border: `1px solid ${alpha('#f59e0b', 0.2)}`,
            }}>
              <StarIcon sx={{ fontSize: 18, color: '#f59e0b' }} />
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#f59e0b' }}>
                {materia.creditos || 0}
              </Typography>
            </Box>
          </Tooltip>
          
          <Box sx={{ flex: 1 }} />
          
          <Tooltip title={expanded ? "Ver menos" : "Ver más detalles"}>
            <IconButton
              size="small"
              onClick={() => setExpanded(!expanded)}
              sx={{
                transform: expanded ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.3s ease',
                bgcolor: alpha(areaColor, 0.1),
                '&:hover': {
                  bgcolor: alpha(areaColor, 0.2),
                }
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
          px: 2.5,
          pb: 2.5,
          pt: 0,
          bgcolor: isDark
            ? alpha('#000', 0.2)
            : alpha(areaColor, 0.03),
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 2,
            pt: 2,
          }}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                Área de Conocimiento
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  bgcolor: areaColor,
                  boxShadow: `0 0 8px ${alpha(areaColor, 0.6)}`,
                }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {materia.area_nombre || 'Sin área'}
                </Typography>
              </Box>
            </Box>
            
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                Nota Mínima
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {materia.nota_minima_aprobacion} puntos
              </Typography>
            </Box>
            
            {materia.peso_porcentual && (
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                  Peso Porcentual
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
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
        PaperProps={{
          sx: {
            borderRadius: '12px',
            mt: 0.5,
            minWidth: 200,
          }
        }}
      >
        <MenuItem 
          onClick={() => { setAnchorEl(null); onEdit(materia); }}
          sx={{ 
            borderRadius: '8px',
            mx: 1,
            my: 0.5,
          }}
        >
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Editar configuración</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => { setAnchorEl(null); onDelete(materia); }} 
          sx={{ 
            color: 'error.main',
            borderRadius: '8px',
            mx: 1,
            my: 0.5,
          }}
        >
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Remover del plan</ListItemText>
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default MateriaCard;