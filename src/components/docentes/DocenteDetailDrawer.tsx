'use client';
import React, { useEffect } from 'react';
import {
  Drawer, Box, Typography, IconButton, Avatar, Chip, Divider,
  Button, alpha, useTheme, Tabs, Tab, CircularProgress, Tooltip,
  List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  Assignment as AssignIcon,
  Person as PersonIcon,
  Badge as BadgeIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Description as CVIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { Docente, AsignacionDocente, DocenteEstadisticas, CargaHoraria } from '../../services/docentes';
import docentesService from '../../services/docentes';
import AsignacionesList from './AsignacionesList';

interface DocenteDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  docente: Docente | null;
  estadisticas: DocenteEstadisticas | null;
  asignaciones: AsignacionDocente[];
  cargaHoraria: CargaHoraria | null;
  loading: boolean;
  onEdit: (docente: Docente) => void;
  onAsignar: (docente: Docente) => void;
  onEliminarAsignacion: (id: number) => void;
}

const DocenteDetailDrawer: React.FC<DocenteDetailDrawerProps> = ({
  open, onClose, docente, estadisticas, asignaciones, cargaHoraria,
  loading, onEdit, onAsignar, onEliminarAsignacion
}) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = React.useState(0);

  if (!docente) return null;

  const contratoColor = docentesService.getTipoContratoColor(docente.tipo_contrato);

  return (
    <Drawer anchor="right" open={open} onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 450 }, borderRadius: '16px 0 0 16px' } }}>
      
      {/* Header con foto */}
      <Box sx={{
        position: 'relative',
        p: 3,
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        color: 'white'
      }}>
        <IconButton onClick={onClose} sx={{ position: 'absolute', top: 8, right: 8, color: 'white' }}>
          <CloseIcon />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
          <Avatar src={docente.foto_url} sx={{
            width: 80, height: 80,
            border: '4px solid rgba(255,255,255,0.3)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
          }}>
            <PersonIcon sx={{ fontSize: 40 }} />
          </Avatar>
          
          <Box>
            <Typography variant="h5" fontWeight="700">
              {docente.nombres}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              {docente.apellidos}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Chip label={docente.codigo} size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 700 }} />
              <Chip label={docentesService.getTipoContratoLabel(docente.tipo_contrato)}
                size="small" sx={{ bgcolor: contratoColor, color: 'white' }} />
            </Box>
          </Box>
        </Box>

        {/* Stats rápidas */}
        {(estadisticas || cargaHoraria) && (
          <Box sx={{
            display: 'flex', gap: 3, mt: 3, pt: 2,
            borderTop: '1px solid rgba(255,255,255,0.2)'
          }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="800">
                {estadisticas?.asignaciones_activas || 0}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>Asignaciones</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="800">
                {cargaHoraria?.total_horas || 0}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>Horas/Sem</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="800">
                {estadisticas?.paralelos_asignados || 0}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>Paralelos</Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* Tabs */}
      <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="Info" sx={{ textTransform: 'none', fontWeight: 600 }} />
        <Tab label={`Asignaciones (${asignaciones.length})`} sx={{ textTransform: 'none', fontWeight: 600 }} />
      </Tabs>

      {/* Contenido */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {tabValue === 0 ? (
          <Box>
            {/* Información de contacto */}
            <Typography variant="subtitle2" fontWeight="700" color="text.secondary" sx={{ mb: 1 }}>
              Contacto
            </Typography>
            <List dense>
              {docente.email && (
                <ListItem>
                  <ListItemIcon><EmailIcon fontSize="small" color="action" /></ListItemIcon>
                  <ListItemText primary={docente.email} />
                </ListItem>
              )}
              {docente.celular && (
                <ListItem>
                  <ListItemIcon><PhoneIcon fontSize="small" color="action" /></ListItemIcon>
                  <ListItemText primary={docente.celular} secondary={docente.telefono} />
                </ListItem>
              )}
              {docente.direccion && (
                <ListItem>
                  <ListItemIcon><LocationIcon fontSize="small" color="action" /></ListItemIcon>
                  <ListItemText primary={docente.direccion} />
                </ListItem>
              )}
            </List>

            <Divider sx={{ my: 2 }} />

            {/* Formación */}
            <Typography variant="subtitle2" fontWeight="700" color="text.secondary" sx={{ mb: 1 }}>
              Formación Académica
            </Typography>
            <List dense>
              {docente.titulo_profesional && (
                <ListItem>
                  <ListItemIcon><SchoolIcon fontSize="small" color="action" /></ListItemIcon>
                  <ListItemText primary={docente.titulo_profesional} secondary="Título Profesional" />
                </ListItem>
              )}
              {docente.titulo_postgrado && (
                <ListItem>
                  <ListItemIcon><SchoolIcon fontSize="small" color="secondary" /></ListItemIcon>
                  <ListItemText primary={docente.titulo_postgrado} secondary="Postgrado" />
                </ListItem>
              )}
              {docente.especialidad && (
                <ListItem>
                  <ListItemIcon><AssignIcon fontSize="small" color="action" /></ListItemIcon>
                  <ListItemText primary={docente.especialidad} secondary="Especialidad" />
                </ListItem>
              )}
              <ListItem>
                <ListItemIcon><BadgeIcon fontSize="small" color="action" /></ListItemIcon>
                <ListItemText 
                  primary={docentesService.getNivelFormacionLabel(docente.nivel_formacion)}
                  secondary={`${docente.experiencia_anios || 0} años de experiencia`} 
                />
              </ListItem>
            </List>

            <Divider sx={{ my: 2 }} />

            {/* Contrato */}
            <Typography variant="subtitle2" fontWeight="700" color="text.secondary" sx={{ mb: 1 }}>
              Información Laboral
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon><WorkIcon fontSize="small" color="action" /></ListItemIcon>
                <ListItemText 
                  primary={docentesService.getTipoContratoLabel(docente.tipo_contrato)}
                  secondary="Tipo de Contrato" 
                />
              </ListItem>
              {docente.fecha_contratacion && (
                <ListItem>
                  <ListItemIcon><CalendarIcon fontSize="small" color="action" /></ListItemIcon>
                  <ListItemText 
                    primary={new Date(docente.fecha_contratacion).toLocaleDateString()}
                    secondary="Fecha de Contratación" 
                  />
                </ListItem>
              )}
              {docente.salario_mensual && (
                <ListItem>
                  <ListItemIcon><MoneyIcon fontSize="small" color="action" /></ListItemIcon>
                  <ListItemText 
                    primary={`Bs. ${docente.salario_mensual.toLocaleString()}`}
                    secondary="Salario Mensual" 
                  />
                </ListItem>
              )}
            </List>

            {docente.cv_url && (
              <Button variant="outlined" fullWidth startIcon={<CVIcon />} sx={{ mt: 2 }}
                href={docente.cv_url} target="_blank">
                Ver CV
              </Button>
            )}
          </Box>
        ) : (
          <Box>
            {/* Asignaciones */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2" fontWeight="700" color="text.secondary">
                Materias Asignadas
              </Typography>
              <Button size="small" startIcon={<AddIcon />} onClick={() => onAsignar(docente)}>
                Asignar
              </Button>
            </Box>

            {loading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress size={32} />
              </Box>
            ) : asignaciones.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <AssignIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography color="text.secondary">Sin asignaciones</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {asignaciones.map(asig => (
                  <Box key={asig.id} sx={{
                    p: 2, borderRadius: 2,
                    bgcolor: alpha(asig.materia_color || theme.palette.grey[400], 0.08),
                    border: `1px solid ${alpha(asig.materia_color || theme.palette.grey[400], 0.2)}`,
                    position: 'relative'
                  }}>
                    <Box sx={{
                      position: 'absolute', top: 0, left: 0, bottom: 0,
                      width: 4, borderRadius: '8px 0 0 8px',
                      bgcolor: asig.materia_color || theme.palette.grey[400]
                    }} />
                    <Typography variant="subtitle2" fontWeight="700">
                      {asig.materia_nombre}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {asig.materia_codigo} • {asig.grado_nombre} • {asig.paralelo_nombre}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Chip label={`${asig.horas_semanales || 0}h/sem`} size="small" />
                      <Chip label={asig.turno_nombre} size="small" variant="outlined" />
                      {asig.es_titular && <Chip label="Titular" size="small" color="primary" />}
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                      {asig.total_estudiantes || 0} estudiantes
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button fullWidth variant="contained" startIcon={<EditIcon />}
          onClick={() => onEdit(docente)} sx={{ borderRadius: 2 }}>
          Editar Docente
        </Button>
      </Box>
    </Drawer>
  );
};

export default DocenteDetailDrawer;