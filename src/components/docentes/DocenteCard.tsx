'use client';
import React, { useState } from 'react';
import {
  Box, Typography, IconButton, Chip, Tooltip, alpha, useTheme,
  Avatar, Menu, MenuItem, ListItemIcon, ListItemText
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  Assignment as AssignIcon,
  Badge as BadgeIcon,
  PersonAdd as UserAddIcon
} from '@mui/icons-material';
import { Docente } from '../../services/docentes';
import docentesService from '../../services/docentes';

interface DocenteCardProps {
  docente: Docente;
  onView: (docente: Docente) => void;
  onEdit: (docente: Docente) => void;
  onDelete: (docente: Docente) => void;
  onAsignar: (docente: Docente) => void;
  onCrearUsuario?: (docente: Docente) => void;
}

const DocenteCard: React.FC<DocenteCardProps> = ({
  docente, onView, onEdit, onDelete, onAsignar, onCrearUsuario
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const contratoColor = docentesService.getTipoContratoColor(docente.tipo_contrato);
  const nivelLabel = docentesService.getNivelFormacionLabel(docente.nivel_formacion);
  const contratoLabel = docentesService.getTipoContratoLabel(docente.tipo_contrato);

  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        position: 'relative',
        borderRadius: 3,
        overflow: 'hidden',
        bgcolor: 'background.paper',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovered ? 'translateY(-6px)' : 'none',
        boxShadow: isHovered
          ? `0 16px 32px ${alpha(theme.palette.primary.main, 0.15)}`
          : `0 2px 8px ${alpha(theme.palette.common.black, 0.06)}`,
        cursor: 'pointer',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${contratoColor}, ${alpha(contratoColor, 0.5)})`
        }
      }}
      onClick={() => onView(docente)}
    >
      {/* Header con foto y acciones */}
      <Box sx={{ p: 2.5, pb: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          {/* Avatar */}
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={docente.foto_url}
              sx={{
                width: 64,
                height: 64,
                border: `3px solid ${alpha(contratoColor, 0.3)}`,
                boxShadow: `0 4px 12px ${alpha(contratoColor, 0.2)}`,
                transition: 'transform 0.2s',
                transform: isHovered ? 'scale(1.05)' : 'none'
              }}
            >
              <PersonIcon sx={{ fontSize: 32 }} />
            </Avatar>
            {/* Indicador de activo */}
            <Box sx={{
              position: 'absolute',
              bottom: 2,
              right: 2,
              width: 14,
              height: 14,
              borderRadius: '50%',
              bgcolor: docente.activo ? 'success.main' : 'grey.400',
              border: '2px solid white'
            }} />
          </Box>

          {/* Info principal */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight="700" noWrap>
              {docente.nombres} {docente.apellidos}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Chip
                label={docente.codigo}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main'
                }}
              />
              <Chip
                label={contratoLabel}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.65rem',
                  bgcolor: alpha(contratoColor, 0.15),
                  color: contratoColor,
                  fontWeight: 600
                }}
              />
            </Box>

            {docente.especialidad && (
              <Typography variant="caption" color="text.secondary" noWrap>
                {docente.especialidad}
              </Typography>
            )}
          </Box>

          {/* Menú de acciones */}
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); setAnchorEl(e.currentTarget); }}
            sx={{
              opacity: isHovered ? 1 : 0.5,
              transition: 'opacity 0.2s'
            }}
          >
            <MoreIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Stats rápidos */}
      <Box sx={{ px: 2.5, py: 2 }}>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 1.5,
          p: 1.5,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.grey[500], 0.04)
        }}>
          <Tooltip title="Asignaciones activas">
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                <AssignIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight="700" color="primary.main">
                  {docente.total_asignaciones || 0}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">Materias</Typography>
            </Box>
          </Tooltip>
          
          <Tooltip title="Nivel de formación">
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                <SchoolIcon sx={{ fontSize: 16, color: 'secondary.main' }} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                {nivelLabel}
              </Typography>
            </Box>
          </Tooltip>
          
          <Tooltip title="Años de experiencia">
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" fontWeight="700" color="warning.main">
                {docente.experiencia_anios || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">Años Exp.</Typography>
            </Box>
          </Tooltip>
        </Box>
      </Box>

      {/* Footer con contacto */}
      <Box sx={{
        px: 2.5,
        py: 1.5,
        borderTop: `1px dashed ${alpha(theme.palette.divider, 0.5)}`,
        bgcolor: alpha(theme.palette.grey[500], 0.02)
      }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {docente.email && (
            <Tooltip title={docente.email}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <EmailIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 100 }}>
                  {docente.email}
                </Typography>
              </Box>
            </Tooltip>
          )}
          {docente.celular && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <PhoneIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
              <Typography variant="caption" color="text.secondary">
                {docente.celular}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Indicador de usuario */}
      {docente.usuario_id && (
        <Tooltip title="Tiene cuenta de usuario">
          <Box sx={{
            position: 'absolute',
            top: 12,
            right: 48,
            p: 0.5,
            borderRadius: 1,
            bgcolor: alpha(theme.palette.success.main, 0.1)
          }}>
            <BadgeIcon sx={{ fontSize: 16, color: 'success.main' }} />
          </Box>
        </Tooltip>
      )}

      {/* Menú contextual */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        onClick={(e) => e.stopPropagation()}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => { setAnchorEl(null); onView(docente); }}>
          <ListItemIcon><ViewIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Ver detalles</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setAnchorEl(null); onEdit(docente); }}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setAnchorEl(null); onAsignar(docente); }}>
          <ListItemIcon><AssignIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Asignar materia</ListItemText>
        </MenuItem>
        {!docente.usuario_id && onCrearUsuario && (
          <MenuItem onClick={() => { setAnchorEl(null); onCrearUsuario(docente); }}>
            <ListItemIcon><UserAddIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Crear usuario</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => { setAnchorEl(null); onDelete(docente); }} sx={{ color: 'error.main' }}>
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Eliminar</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default DocenteCard;