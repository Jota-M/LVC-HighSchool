// src/components/preinscripciones/PreinscripcionesHeader.tsx

import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  keyframes,
  alpha,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import AddIcon from '@mui/icons-material/Add';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import SettingsIcon from '@mui/icons-material/Settings';
import AssignmentIcon from '@mui/icons-material/Assignment';

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`;

interface PreinscripcionesHeaderProps {
  onRefresh: () => void;
  onExport: () => void;
  onExportPDF?: () => void;
  onNew?: () => void;
}

export const PreinscripcionesHeader: React.FC<PreinscripcionesHeaderProps> = ({
  onRefresh,
  onExport,
  onExportPDF,
  onNew,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent = isDark ? '#facc15' : '#0288d1';
  const accentDark = isDark ? '#f59e0b' : '#01579b';

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => setAnchorEl(null);

  const handleExportExcel = () => {
    handleMenuClose();
    onExport();
  };

  const handleExportPDF = () => {
    handleMenuClose();
    onExportPDF?.();
  };

  const iconBtnSx = {
    borderRadius: '12px',
    border: `1px solid ${alpha(accent, 0.3)}`,
    color: alpha(accent, 0.8),
    backgroundColor: alpha(accent, 0.07),
    '&:hover': {
      backgroundColor: alpha(accent, 0.15),
      borderColor: accent,
      color: accent,
    },
    transition: 'all 0.2s ease',
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 2, md: 0 },
          mb: 3,
        }}
      >
        {/* Título */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AssignmentIcon
              sx={{
                color: accent,
                fontSize: 36,
                animation: `${bounce} 1.5s infinite`,
              }}
            />
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                fontWeight: 800,
                background: isDark
                  ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                  : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Preinscripciones
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, letterSpacing: 0.3 }}>
            Gestiona y supervisa todas las solicitudes de inscripción
          </Typography>
        </Box>

        {/* Acciones */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title="Actualizar">
            <IconButton onClick={onRefresh} sx={iconBtnSx}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Exportar">
            <IconButton onClick={handleMenuOpen} sx={iconBtnSx}>
              <CloudDownloadIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Gestionar Cupos">
            <IconButton
              onClick={() => (window.location.href = '/dashboard/preinscripciones/cupos')}
              sx={iconBtnSx}
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>

          {onNew && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onNew}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1.5,
                background: isDark
                  ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                  : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                color: isDark ? '#000' : '#fff',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: isDark
                    ? '0 8px 24px rgba(250,204,21,0.3)'
                    : '0 8px 24px rgba(2,136,209,0.3)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Nueva
            </Button>
          )}
        </Stack>
      </Box>

      {/* Tabs bar (barra de color igual que en Estudiantes) */}
      <Box
        sx={{
          background: isDark
            ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
            : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
          borderRadius: '16px',
          p: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <AssignmentIcon sx={{ color: isDark ? '#000' : '#fff', fontSize: 20 }} />
        <Typography
          variant="body2"
          sx={{
            color: isDark ? '#000' : '#fff',
            fontWeight: 700,
          }}
        >
          Lista de Preinscripciones
        </Typography>
      </Box>

      {/* Menú de exportación */}
      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            minWidth: 200,
            mt: 1,
            border: `1px solid ${alpha(accent, 0.2)}`,
          },
        }}
      >
        <MenuItem onClick={handleExportExcel}>
          <ListItemIcon>
            <TableChartIcon fontSize="small" sx={{ color: '#107C41' }} />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="body2" fontWeight={600}>Exportar a Excel</Typography>
            <Typography variant="caption" color="text.secondary">Descarga archivo .xlsx</Typography>
          </ListItemText>
        </MenuItem>

        {onExportPDF && (
          <MenuItem onClick={handleExportPDF}>
            <ListItemIcon>
              <PictureAsPdfIcon fontSize="small" sx={{ color: '#dc2626' }} />
            </ListItemIcon>
            <ListItemText>
              <Typography variant="body2" fontWeight={600}>Exportar a PDF</Typography>
              <Typography variant="caption" color="text.secondary">Descarga archivo .pdf</Typography>
            </ListItemText>
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};