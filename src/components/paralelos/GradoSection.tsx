// components/GradoSection.tsx
import React from 'react';
import {
  Card,
  Box,
  Avatar,
  Typography,
  Stack,
  Chip,
  Badge,
  IconButton,
  Tooltip,
  Collapse,
  Divider,
  Paper,
  Button,
  Grid,
  Fade,
  alpha,
  useTheme
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ClassIcon from '@mui/icons-material/Class';
import GroupsIcon from '@mui/icons-material/Groups';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Grado, Nivel, ParaleloConExtras } from '../../services/paraleloService';
import { getNivelColor, getNivelIcon } from '../../utils/paraleloHelpers';
import { ParaleloCard } from './ParaleloCard';

interface GradoSectionProps {
  grado: Grado;
  nivel: Nivel | undefined;
  paralelos: ParaleloConExtras[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onAddParalelo: () => void;
  onEditParalelo: (paralelo: ParaleloConExtras) => void;
  onDeleteParalelo: (id: number) => void;
  index: number;
}

export const GradoSection: React.FC<GradoSectionProps> = ({
  grado,
  nivel,
  paralelos,
  isExpanded,
  onToggleExpand,
  onAddParalelo,
  onEditParalelo,
  onDeleteParalelo,
  index
}) => {
  const theme = useTheme();
  const nivelColor = getNivelColor(nivel?.orden ?? 0);
  const nivelIcon = getNivelIcon(nivel?.orden ?? 0);
  const totalEstudiantes = paralelos.reduce((sum, p) => sum + (p.total_estudiantes || 0), 0);

  return (
    <Fade in timeout={800 + index * 100}>
      <Card
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: isExpanded
            ? `0 16px 48px ${alpha(nivelColor, 0.25)}`
            : `0 4px 12px ${alpha(theme.palette.common.black, 0.1)}`,
          border: isExpanded
            ? `2px solid ${nivelColor}`
            : `1px solid ${theme.palette.divider}`,
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 12px 32px ${alpha(nivelColor, 0.2)}`,
          }
        }}
      >
        {/* Header del Grado */}
        <Box
          onClick={onToggleExpand}
          sx={{
            p: 3,
            cursor: 'pointer',
            background: isExpanded
              ? `linear-gradient(135deg, ${alpha(nivelColor, 0.15)} 0%, ${alpha(nivelColor, 0.05)} 100%)`
              : 'transparent',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: `linear-gradient(135deg, ${alpha(nivelColor, 0.1)} 0%, ${alpha(nivelColor, 0.03)} 100%)`,
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: nivelColor,
                  fontSize: '1.8rem',
                  boxShadow: `0 8px 16px ${alpha(nivelColor, 0.4)}`,
                  transition: 'all 0.3s ease',
                  transform: isExpanded ? 'scale(1.1)' : 'none'
                }}
              >
                {nivelIcon}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                  <Typography variant="h5" fontWeight="700">
                    {grado.nombre}
                  </Typography>
                  <Chip
                    label={nivel?.nombre ?? 'Sin nivel'}
                    size="small"
                    sx={{
                      bgcolor: alpha(nivelColor, 0.2),
                      color: nivelColor,
                      fontWeight: 'bold'
                    }}
                  />
                </Stack>
                <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                  <Badge
                    badgeContent={paralelos.length}
                    color="primary"
                    sx={{
                      '& .MuiBadge-badge': {
                        fontSize: '0.75rem',
                        fontWeight: 'bold'
                      }
                    }}
                  >
                    <Chip
                      icon={<ClassIcon />}
                      label="Paralelos"
                      size="small"
                      variant="outlined"
                      sx={{ borderColor: nivelColor }}
                    />
                  </Badge>
                  <Chip
                    icon={<GroupsIcon />}
                    label={`${totalEstudiantes} estudiantes`}
                    size="small"
                    variant="outlined"
                    sx={{ borderColor: nivelColor }}
                  />
                </Stack>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="Agregar paralelo">
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddParalelo();
                  }}
                  sx={{
                    bgcolor: alpha(nivelColor, 0.1),
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: nivelColor,
                      color: 'white',
                      transform: 'rotate(90deg) scale(1.2)',
                    }
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>
              <IconButton
                sx={{
                  transition: 'all 0.3s ease',
                  transform: isExpanded ? 'rotate(180deg)' : 'none'
                }}
              >
                {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* Paralelos */}
        <Collapse in={isExpanded} timeout={500}>
          <Divider />
          <Box sx={{ p: 3, bgcolor: alpha(nivelColor, 0.02) }}>
            {paralelos.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  bgcolor: alpha(theme.palette.warning.main, 0.05),
                  border: `2px dashed ${alpha(theme.palette.warning.main, 0.3)}`,
                  borderRadius: 2
                }}
              >
                <WarningAmberIcon sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No hay paralelos registrados
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Comienza agregando paralelos (A, B, C) a este grado
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={onAddParalelo}
                  sx={{
                    bgcolor: nivelColor,
                    '&:hover': { bgcolor: nivelColor, filter: 'brightness(0.9)' }
                  }}
                >
                  Agregar Primer Paralelo
                </Button>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {paralelos.map((paralelo, paraleloIndex) => (
                  <Grid size={{xs:12, sm:6, md:4}} key={paralelo.id}>
                    <ParaleloCard
                      paralelo={paralelo}
                      nivelColor={nivelColor}
                      onEdit={() => onEditParalelo(paralelo)}
                      onDelete={() => onDeleteParalelo(paralelo.id)}
                      index={paraleloIndex}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Collapse>
      </Card>
    </Fade>
  );
};