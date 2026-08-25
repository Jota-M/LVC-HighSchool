'use client';
// app/dashboard/galeria/page.tsx

import React, { useState, useMemo, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    Tabs,
    Tab,
    useTheme,
    Fade,
    keyframes,
    alpha,
    TextField,
    InputAdornment,
    CircularProgress,
    Grid,
    Snackbar,
    Alert,
    Card,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Stack,
    Pagination,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import CollectionsBookmarkRoundedIcon from '@mui/icons-material/CollectionsBookmarkRounded';
import ViewModuleRoundedIcon from '@mui/icons-material/ViewModuleRounded';
import ViewCarouselRoundedIcon from '@mui/icons-material/ViewCarouselRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import EventBusyRoundedIcon from '@mui/icons-material/EventBusyRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import PhotoLibraryRoundedIcon from '@mui/icons-material/PhotoLibraryRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

import { useGaleria } from '@/hooks/useGaleria';
import { GaleriaCard } from '@/components/galeria/GaleriaCard';
import { GaleriaStatCard } from '@/components/galeria/GaleriaStatCard';
import { GaleriaFormDialog } from '@/components/galeria/GaleriaFormDialog';
import { GaleriaCarouselPreview } from '@/components/galeria/GaleriaCarouselPreview';
import { GaleriaImageViewer } from '@/components/galeria/GaleriaImageViewer';
import type { FotoGaleria, CrearFotoDTO, ActualizarFotoDTO } from '@/types/galeriaTypes';

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`;

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
    <div role="tabpanel" hidden={value !== index}>
        {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
);

export default function GaleriaDashboardPage() {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const brand = isDark ? '#facc15' : '#0288d1';

    const [activeTab, setActiveTab] = useState(0);
    const [search, setSearch] = useState('');
    const [filtroActivo, setFiltroActivo] = useState<string>('todos');
    const [filtroVigencia, setFiltroVigencia] = useState<string>('todos');

    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [selectedFoto, setSelectedFoto] = useState<FotoGaleria | null>(null);
    const [previewFoto, setPreviewFoto] = useState<FotoGaleria | null>(null);
    const [fotoToDelete, setFotoToDelete] = useState<FotoGaleria | null>(null);

    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error' | 'info';
    }>({
        open: false,
        message: '',
        severity: 'success',
    });

    const {
        fotos,
        vigentes,
        loading,
        loadingVigentes,
        total,
        page,
        limit,
        totalPaginas,
        fetchVigentes,
        crearFoto,
        actualizarFoto,
        toggleActivo,
        eliminarFoto,
        cambiarPagina,
        setFiltros,
    } = useGaleria({ autoLoad: true, limit: 12 });

    // Actualizar filtros en hook al cambiar selects
    useEffect(() => {
        setFiltros((prev) => ({
            ...prev,
            page: 1,
            activo: filtroActivo === 'activos' ? true : filtroActivo === 'inactivos' ? false : undefined,
            vigente: filtroVigencia === 'vigentes' ? true : undefined,
        }));
    }, [filtroActivo, filtroVigencia, setFiltros]);

    // Cargar vigentes cuando se cambia al tab de preview carrusel
    useEffect(() => {
        if (activeTab === 1) {
            fetchVigentes();
        }
    }, [activeTab, fetchVigentes]);

    // Filtrado por búsqueda en cliente
    const fotosFiltradas = useMemo(() => {
        if (!search.trim()) return fotos;
        const s = search.toLowerCase();
        return fotos.filter((f) => f.titulo.toLowerCase().includes(s));
    }, [fotos, search]);

    // Métricas para pestaña de Estadísticas
    const hoy = new Date().toISOString().split('T')[0];
    const metricas = useMemo(() => {
        const totalFotos = fotos.length;
        const activas = fotos.filter((f) => f.activo).length;
        const inactivas = totalFotos - activas;
        const vigentesHoy = fotos.filter(
            (f) =>
                f.activo &&
                (!f.fecha_inicio || f.fecha_inicio <= hoy) &&
                (!f.fecha_fin || f.fecha_fin >= hoy)
        ).length;
        const vencidas = fotos.filter((f) => f.fecha_fin && f.fecha_fin < hoy).length;
        const programadas = fotos.filter((f) => f.fecha_inicio && f.fecha_inicio > hoy).length;

        return {
            totalFotos,
            activas,
            inactivas,
            vigentesHoy,
            vencidas,
            programadas,
        };
    }, [fotos, hoy]);

    // Handlers
    const handleOpenCreate = () => {
        setSelectedFoto(null);
        setFormDialogOpen(true);
    };

    const handleOpenEdit = (foto: FotoGaleria) => {
        setSelectedFoto(foto);
        setFormDialogOpen(true);
    };

    const handleFormSubmit = async (data: CrearFotoDTO | ActualizarFotoDTO) => {
        if (selectedFoto) {
            await actualizarFoto(selectedFoto.id, data as ActualizarFotoDTO);
            setSnackbar({ open: true, message: 'Foto actualizada correctamente', severity: 'success' });
        } else {
            await crearFoto(data as CrearFotoDTO);
            setSnackbar({ open: true, message: 'Foto agregada a la galería con éxito', severity: 'success' });
        }
        fetchVigentes();
    };

    const handleToggleActivo = async (foto: FotoGaleria) => {
        try {
            const updated = await toggleActivo(foto.id);
            setSnackbar({
                open: true,
                message: updated.activo ? 'Foto activada para exhibición' : 'Foto desactivada',
                severity: 'info',
            });
            fetchVigentes();
        } catch {
            setSnackbar({ open: true, message: 'Error al cambiar estado de la foto', severity: 'error' });
        }
    };

    const handleConfirmDelete = async () => {
        if (!fotoToDelete) return;
        try {
            await eliminarFoto(fotoToDelete.id);
            setSnackbar({ open: true, message: 'Foto eliminada correctamente', severity: 'success' });
            setFotoToDelete(null);
            fetchVigentes();
        } catch {
            setSnackbar({ open: true, message: 'Error al eliminar la foto', severity: 'error' });
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', py: 2 }}>
            <Container maxWidth="xl">
                {/* Header */}
                <Fade in timeout={500}>
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
                            {/* Titulo + Subtitulo */}
                            <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <CollectionsBookmarkRoundedIcon
                                        sx={{
                                            color: isDark ? '#facc15' : '#0288d1',
                                            fontSize: 36,
                                            animation: `${bounce} 1.5s infinite`,
                                        }}
                                    />
                                    <Typography
                                        variant="h1"
                                        sx={{
                                            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.4rem' },
                                            fontWeight: 800,
                                            background: isDark
                                                ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                                                : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                        }}
                                    >
                                        Galería Institucional
                                    </Typography>
                                </Box>

                                <Typography
                                    variant="body1"
                                    color="text.secondary"
                                    sx={{
                                        fontWeight: 500,
                                        letterSpacing: 0.3,
                                        mt: 0.5,
                                    }}
                                >
                                    Administra los banners, fotografías del carrusel y memorias visuales institucionales.
                                </Typography>
                            </Box>

                            {/* Botón de acción */}
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={<AddIcon />}
                                onClick={handleOpenCreate}
                                sx={{
                                    fontSize: { xs: '0.875rem', md: '1rem' },
                                    borderRadius: '14px',
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    px: 3.5,
                                    py: 1.3,
                                    background: isDark
                                        ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                                        : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                                    color: isDark ? '#000' : '#fff',
                                    boxShadow: isDark
                                        ? '0 6px 20px rgba(250, 204, 21, 0.25)'
                                        : '0 6px 20px rgba(2, 136, 209, 0.25)',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: isDark
                                            ? '0 8px 24px rgba(250, 204, 21, 0.35)'
                                            : '0 8px 24px rgba(2, 136, 209, 0.35)',
                                    },
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                Nueva Foto / Banner
                            </Button>
                        </Box>

                        {/* Tabs de Navegación */}
                        <Tabs
                            value={activeTab}
                            onChange={(_, val) => setActiveTab(val)}
                            sx={{
                                background: isDark
                                    ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                                    : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                                borderRadius: '16px',
                                p: 0.8,
                                backdropFilter: 'blur(20px)',
                                '& .MuiTab-root': {
                                    borderRadius: '12px',
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    minHeight: 44,
                                    color: isDark ? '#000' : '#fff',
                                },
                                '& .Mui-selected': {
                                    color: '#fff',
                                },
                                '& .MuiTabs-indicator': {
                                    backgroundColor: '#fff',
                                    height: 3,
                                    borderRadius: '3px 3px 0 0',
                                },
                            }}
                        >
                            <Tab icon={<ViewModuleRoundedIcon />} iconPosition="start" label="Fotos & Banners" />
                            <Tab icon={<ViewCarouselRoundedIcon />} iconPosition="start" label="Vista Previa Carrusel" />
                            <Tab icon={<AssessmentRoundedIcon />} iconPosition="start" label="Estadísticas" />
                        </Tabs>
                    </Box>
                </Fade>

                {/* TAB 0: Listado de Fotos & Banners */}
                <TabPanel value={activeTab} index={0}>
                    <Fade in timeout={600}>
                        <Box>
                            {/* Barra de Filtros */}
                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={2}
                                sx={{ mb: 3 }}
                                alignItems="center"
                            >
                                <TextField
                                    placeholder="Buscar por título de foto..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    size="small"
                                    fullWidth
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon fontSize="small" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                <TextField
                                    select
                                    label="Estado"
                                    value={filtroActivo}
                                    onChange={(e) => setFiltroActivo(e.target.value)}
                                    size="small"
                                    sx={{ minWidth: { xs: '100%', sm: 160 } }}
                                >
                                    <MenuItem value="todos">Todos los estados</MenuItem>
                                    <MenuItem value="activos">Solo Activos</MenuItem>
                                    <MenuItem value="inactivos">Solo Inactivos</MenuItem>
                                </TextField>

                                <TextField
                                    select
                                    label="Vigencia"
                                    value={filtroVigencia}
                                    onChange={(e) => setFiltroVigencia(e.target.value)}
                                    size="small"
                                    sx={{ minWidth: { xs: '100%', sm: 180 } }}
                                >
                                    <MenuItem value="todos">Todas las fechas</MenuItem>
                                    <MenuItem value="vigentes">Solo Vigentes Hoy</MenuItem>
                                </TextField>
                            </Stack>

                            {/* Contenido Grid */}
                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                                    <CircularProgress sx={{ color: brand }} />
                                </Box>
                            ) : fotosFiltradas.length === 0 ? (
                                <Box
                                    sx={{
                                        textAlign: 'center',
                                        py: 8,
                                        px: 2,
                                        borderRadius: '20px',
                                        border: `1px dashed ${alpha(theme.palette.divider, 0.2)}`,
                                        bgcolor: isDark ? alpha('#fff', 0.01) : alpha('#000', 0.01),
                                    }}
                                >
                                    <PhotoLibraryRoundedIcon sx={{ fontSize: 54, color: 'text.disabled', mb: 1.5 }} />
                                    <Typography variant="h6" fontWeight={700} gutterBottom>
                                        No se encontraron fotos en la galería
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                        {search
                                            ? 'No hay resultados que coincidan con la búsqueda actual.'
                                            : 'Comienza subiendo la primera fotografía o banner para el carrusel.'}
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        startIcon={<AddIcon />}
                                        onClick={handleOpenCreate}
                                        sx={{
                                            borderRadius: '12px',
                                            textTransform: 'none',
                                            fontWeight: 700,
                                            bgcolor: brand,
                                            color: isDark ? '#000' : '#fff',
                                        }}
                                    >
                                        Subir Foto
                                    </Button>
                                </Box>
                            ) : (
                                <>
                                    <Grid container spacing={3}>
                                        {fotosFiltradas.map((foto) => (
                                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={foto.id}>
                                                <GaleriaCard
                                                    foto={foto}
                                                    onEdit={handleOpenEdit}
                                                    onDelete={(f) => setFotoToDelete(f)}
                                                    onToggleActivo={handleToggleActivo}
                                                    onPreview={(f) => setPreviewFoto(f)}
                                                />
                                            </Grid>
                                        ))}
                                    </Grid>

                                    {/* Paginación */}
                                    {totalPaginas > 1 && (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
                                            <Pagination
                                                count={totalPaginas}
                                                page={page}
                                                onChange={(_, p) => cambiarPagina(p)}
                                                color="primary"
                                                shape="rounded"
                                            />
                                        </Box>
                                    )}
                                </>
                            )}
                        </Box>
                    </Fade>
                </TabPanel>

                {/* TAB 1: Vista Previa Carrusel */}
                <TabPanel value={activeTab} index={1}>
                    <Fade in timeout={600}>
                        <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
                            <GaleriaCarouselPreview fotos={vigentes} loading={loadingVigentes} />
                        </Box>
                    </Fade>
                </TabPanel>

                {/* TAB 2: Estadísticas & Métricas */}
                <TabPanel value={activeTab} index={2}>
                    <Fade in timeout={600}>
                        <Box>
                            {/* Stat Cards */}
                            <Grid container spacing={3} sx={{ mb: 4 }}>
                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <GaleriaStatCard
                                        title="Total de Fotos"
                                        value={total}
                                        icon={<PhotoLibraryRoundedIcon />}
                                        color={brand}
                                        subtitle="Registros en el sistema"
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <GaleriaStatCard
                                        title="Vigentes Hoy"
                                        value={metricas.vigentesHoy}
                                        icon={<EventAvailableRoundedIcon />}
                                        color="#10b981"
                                        subtitle="En exhibición en el carrusel público"
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <GaleriaStatCard
                                        title="Fotos Activas"
                                        value={metricas.activas}
                                        icon={<CheckCircleRoundedIcon />}
                                        color="#3b82f6"
                                        subtitle={`${metricas.inactivas} fotos ocultas`}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <GaleriaStatCard
                                        title="Fotos Inactivas"
                                        value={metricas.inactivas}
                                        icon={<CancelRoundedIcon />}
                                        color="#ef4444"
                                        subtitle="Desactivadas manualmente"
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <GaleriaStatCard
                                        title="Programadas a Futuro"
                                        value={metricas.programadas}
                                        icon={<AccessTimeRoundedIcon />}
                                        color="#f59e0b"
                                        subtitle="Iniciarán en fecha posterior"
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <GaleriaStatCard
                                        title="Vencidas"
                                        value={metricas.vencidas}
                                        icon={<EventBusyRoundedIcon />}
                                        color="#8b5cf6"
                                        subtitle="Fecha de fin ya superada"
                                    />
                                </Grid>
                            </Grid>

                            {/* Tabla Resumen de Banners */}
                            <Card
                                sx={{
                                    borderRadius: '20px',
                                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                    overflow: 'hidden',
                                }}
                            >
                                <Box sx={{ p: 2.5, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
                                    <Typography variant="h6" fontWeight={800}>
                                        Resumen de Banners Registrados
                                    </Typography>
                                </Box>
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow
                                                sx={{
                                                    '& th': {
                                                        fontWeight: 700,
                                                        bgcolor: isDark
                                                            ? alpha('#facc15', 0.08)
                                                            : alpha('#0288d1', 0.05),
                                                    },
                                                }}
                                            >
                                                <TableCell>Miniatura</TableCell>
                                                <TableCell>Título</TableCell>
                                                <TableCell align="center">Orden</TableCell>
                                                <TableCell>Vigencia</TableCell>
                                                <TableCell>Subido por</TableCell>
                                                <TableCell align="center">Estado</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {fotos.map((f) => (
                                                <TableRow key={f.id} hover>
                                                    <TableCell sx={{ width: 80 }}>
                                                        <Box
                                                            component="img"
                                                            src={f.imagen_url}
                                                            alt={f.titulo}
                                                            sx={{
                                                                width: 60,
                                                                height: 38,
                                                                borderRadius: '8px',
                                                                objectFit: 'cover',
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" fontWeight={700}>
                                                            {f.titulo}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Chip label={f.orden} size="small" />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {f.fecha_inicio || f.fecha_fin
                                                                ? `${f.fecha_inicio || 'Inicio'} → ${f.fecha_fin || 'Sin límite'}`
                                                                : 'Permanente'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">
                                                            {f.creado_por_username || 'Sistema'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Chip
                                                            label={f.activo ? 'Activa' : 'Inactiva'}
                                                            size="small"
                                                            color={f.activo ? 'success' : 'default'}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Card>
                        </Box>
                    </Fade>
                </TabPanel>
            </Container>

            {/* Dialog Formulario (Crear / Editar) */}
            <GaleriaFormDialog
                open={formDialogOpen}
                foto={selectedFoto}
                onClose={() => setFormDialogOpen(false)}
                onSubmit={handleFormSubmit}
            />

            {/* Lightbox / Visor de Imagen */}
            <GaleriaImageViewer
                open={Boolean(previewFoto)}
                foto={previewFoto}
                onClose={() => setPreviewFoto(null)}
            />

            {/* Diálogo de Confirmación para Eliminar */}
            <Dialog
                open={Boolean(fotoToDelete)}
                onClose={() => setFotoToDelete(null)}
                PaperProps={{
                    sx: {
                        borderRadius: '20px',
                        bgcolor: isDark ? '#0a1128' : '#ffffff',
                    },
                }}
            >
                <DialogTitle sx={{ fontWeight: 800 }}>Confirmar Eliminación</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        ¿Estás seguro de que deseas eliminar permanentemente la foto{' '}
                        <strong>&quot;{fotoToDelete?.titulo}&quot;</strong>? Esta acción también borrará la imagen
                        almacenada en la nube.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2.5, pt: 0 }}>
                    <Button onClick={() => setFotoToDelete(null)} sx={{ borderRadius: '10px' }}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirmDelete}
                        variant="contained"
                        color="error"
                        startIcon={<DeleteOutlineRoundedIcon />}
                        sx={{ borderRadius: '10px', fontWeight: 700 }}
                    >
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar de retroalimentación */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3500}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    severity={snackbar.severity}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    sx={{ borderRadius: '12px', fontWeight: 600 }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
