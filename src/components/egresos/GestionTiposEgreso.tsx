// components/egresos/GestionTiposEgreso.tsx
'use client';
import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    TextField,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
    useTheme,
    alpha,
    Tooltip,
    Switch,
    FormControlLabel,
    InputAdornment,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Category as CategoryIcon,
    Close as CloseIcon,
    Search as SearchIcon,
    Code as CodeIcon,
    Label as LabelIcon,
    Description as DescriptionIcon,
    Palette as PaletteIcon,
} from '@mui/icons-material';
import { useEgresos } from '@/hooks/useEgresos';
import egresosService from '@/services/egresos';
import type { TipoEgreso, CrearTipoEgresoRequest } from '@/types/egresos';
import { keyframes } from '@mui/system';

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const GestionTiposEgreso: React.FC = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const {
        tipos,
        loadingTipos,
        crearTipo,
        actualizarTipo,
    } = useEgresos({
        autoLoad: true,
        loadTipos: true,
    });

    const [openDialog, setOpenDialog] = useState(false);
    const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoEgreso | null>(null);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState<CrearTipoEgresoRequest>({
        codigo: '',
        nombre: '',
        descripcion: '',
        categoria: 'otro',
        requiere_docente: false,
        activo: true,
        color: '#ef4444',
        orden: 0,
    });

    const redColor = '#ef4444';
    const greenColor = '#10b981';
    const blueColor = '#3b82f6';

    const limpiarFormulario = () => {
        setFormData({
            codigo: '',
            nombre: '',
            descripcion: '',
            categoria: 'otro',
            requiere_docente: false,
            activo: true,
            color: '#ef4444',
            orden: 0,
        });
        setModoEdicion(false);
        setTipoSeleccionado(null);
    };

    const handleNuevoTipo = () => {
        limpiarFormulario();
        setOpenDialog(true);
    };

    const handleEditarTipo = (tipo: TipoEgreso) => {
        setTipoSeleccionado(tipo);
        setFormData({
            codigo: tipo.codigo,
            nombre: tipo.nombre,
            descripcion: tipo.descripcion || '',
            categoria: tipo.categoria,
            requiere_docente: tipo.requiere_docente,
            activo: tipo.activo,
            color: tipo.color || '#ef4444',
            orden: tipo.orden || 0,
        });
        setModoEdicion(true);
        setOpenDialog(true);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked :
                name === 'orden' ? parseInt(value) || 0 : value,
        }));
    };

    const handleSubmit = async () => {
        try {
            if (modoEdicion && tipoSeleccionado) {
                const updateData: any = {
                    nombre: formData.nombre,
                    descripcion: formData.descripcion,
                    categoria: formData.categoria,
                    requiere_docente: formData.requiere_docente,
                    activo: formData.activo,
                    color: formData.color,
                    orden: formData.orden,
                };
                await actualizarTipo(tipoSeleccionado.id, updateData);
                alert('Tipo de egreso actualizado exitosamente');
            } else {
                await crearTipo(formData);
                alert('Tipo de egreso creado exitosamente');
            }
            setOpenDialog(false);
            limpiarFormulario();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error al guardar el tipo de egreso');
        }
    };

    const tiposFiltrados = tipos.filter((tipo) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            tipo.codigo.toLowerCase().includes(searchLower) ||
            tipo.nombre.toLowerCase().includes(searchLower) ||
            (tipo.descripcion && tipo.descripcion.toLowerCase().includes(searchLower)) ||
            egresosService.getCategoriaEgresoLabel(tipo.categoria).toLowerCase().includes(searchLower)
        );
    });

    return (
        <Box>
            {/* Header con búsqueda */}
            <Card
                sx={{
                    mb: 3,
                    position: 'relative',
                    overflow: 'hidden',
                    background: isDark
                        ? `linear-gradient(135deg, ${alpha(redColor, 0.2)} 0%, ${alpha(redColor, 0.05)} 100%)`
                        : `linear-gradient(135deg, ${alpha(redColor, 0.15)} 0%, ${alpha(redColor, 0.03)} 100%)`,
                    border: `1px solid ${alpha(redColor, 0.3)}`,
                    borderRadius: '20px',
                    backdropFilter: 'blur(20px)',
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        right: -50,
                        top: -50,
                        width: 200,
                        height: 200,
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${alpha(redColor, 0.2)} 0%, transparent 70%)`,
                        filter: 'blur(40px)',
                        pointerEvents: 'none',
                    }}
                />

                <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: { md: 'center' }, justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                                sx={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: `linear-gradient(135deg, ${redColor} 0%, #b91c1c 100%)`,
                                    boxShadow: `0 8px 24px ${alpha(redColor, 0.4)}`,
                                    color: '#fff',
                                }}
                            >
                                <CategoryIcon sx={{ fontSize: 28 }} />
                            </Box>
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
                                    Tipos de Egreso
                                </Typography>
                                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                    {tiposFiltrados.length} {tiposFiltrados.length === 1 ? 'categoría' : 'categorías'} configuradas
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', width: { xs: '100%', md: 'auto' } }}>
                            <TextField
                                size="small"
                                placeholder="Buscar tipo..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    minWidth: { xs: '100%', sm: 220 },
                                    '& .MuiOutlinedInput-root': { borderRadius: '12px' },
                                }}
                            />
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleNuevoTipo}
                                sx={{
                                    background: `linear-gradient(135deg, ${redColor} 0%, #b91c1c 100%)`,
                                    borderRadius: '12px',
                                    px: 3,
                                    py: 1,
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    whiteSpace: 'nowrap',
                                    boxShadow: `0 4px 12px ${alpha(redColor, 0.3)}`,
                                    '&:hover': {
                                        background: `linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)`,
                                        transform: 'translateY(-2px)',
                                    },
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                Nuevo Tipo
                            </Button>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* Tabla de tipos */}
            <Card
                sx={{
                    borderRadius: '20px',
                    overflow: 'hidden',
                    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                    animation: `${fadeInUp} 0.5s ease-out`,
                }}
            >
                <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: alpha(redColor, 0.06) }}>
                                <TableCell sx={{ fontWeight: 700 }}>Código</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Nombre</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Categoría</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="center">Requiere Docente</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="center">Estado</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="center">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tiposFiltrados.map((tipo) => (
                                <TableRow
                                    key={tipo.id}
                                    sx={{
                                        '&:hover': { backgroundColor: alpha(redColor, 0.03) },
                                        transition: 'background-color 0.2s ease',
                                    }}
                                >
                                    <TableCell>
                                        <Chip
                                            label={tipo.codigo}
                                            size="small"
                                            sx={{
                                                fontFamily: 'monospace',
                                                fontWeight: 600,
                                                backgroundColor: alpha(theme.palette.text.primary, 0.06),
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography sx={{ fontSize: '1.1rem' }}>
                                                {egresosService.getCategoriaIcon(tipo.categoria)}
                                            </Typography>
                                            <Typography fontWeight={600}>{tipo.nombre}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={egresosService.getCategoriaEgresoLabel(tipo.categoria)}
                                            size="small"
                                            sx={{
                                                backgroundColor: alpha(egresosService.getCategoriaColor(tipo.categoria), 0.15),
                                                color: egresosService.getCategoriaColor(tipo.categoria),
                                                fontWeight: 700,
                                                border: `1px solid ${alpha(egresosService.getCategoriaColor(tipo.categoria), 0.3)}`,
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        {tipo.requiere_docente ? (
                                            <Chip label="Sí" size="small" color="info" sx={{ fontWeight: 700 }} />
                                        ) : (
                                            <Chip label="No" size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                                        )}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={tipo.activo ? 'Activo' : 'Inactivo'}
                                            size="small"
                                            sx={{
                                                backgroundColor: alpha(tipo.activo ? greenColor : redColor, 0.15),
                                                color: tipo.activo ? greenColor : redColor,
                                                fontWeight: 700,
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Editar">
                                            <IconButton size="small" onClick={() => handleEditarTipo(tipo)}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {tiposFiltrados.length === 0 && !loadingTipos && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                        <Typography color="text.secondary">No hay tipos de egreso registrados</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>

            {/* Dialog crear/editar */}
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: '20px' } }}
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                    <Typography variant="h6" fontWeight={700}>
                        {modoEdicion ? 'Editar Tipo de Egreso' : 'Nuevo Tipo de Egreso'}
                    </Typography>
                    <IconButton onClick={() => setOpenDialog(false)} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers>
                    <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="Código"
                                name="codigo"
                                value={formData.codigo}
                                onChange={handleChange}
                                required
                                disabled={modoEdicion}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <CodeIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                helperText={modoEdicion ? 'El código no puede ser modificado' : 'Código único del tipo'}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="Nombre"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LabelIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label="Descripción"
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleChange}
                                multiline
                                rows={3}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                                            <DescriptionIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                select
                                label="Categoría"
                                name="categoria"
                                value={formData.categoria}
                                onChange={handleChange}
                                required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <CategoryIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                            >
                                <MenuItem value="personal">🧑‍🏫 Personal (planillas)</MenuItem>
                                <MenuItem value="operativo">🛠️ Operativo</MenuItem>
                                <MenuItem value="administrativo">📋 Administrativo</MenuItem>
                                <MenuItem value="otro">📦 Otro</MenuItem>
                            </TextField>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="Color"
                                name="color"
                                type="color"
                                value={formData.color}
                                onChange={handleChange}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PaletteIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': { borderRadius: '12px' },
                                    '& input[type="color"]': { height: 40, cursor: 'pointer' },
                                }}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="Orden de visualización"
                                name="orden"
                                type="number"
                                value={formData.orden}
                                onChange={handleChange}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                helperText="Orden en listados (menor a mayor)"
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1,
                                    p: 2,
                                    borderRadius: '12px',
                                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                }}
                            >
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.requiere_docente}
                                            onChange={handleChange}
                                            name="requiere_docente"
                                            sx={{
                                                '& .MuiSwitch-switchBase.Mui-checked': { color: blueColor },
                                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: blueColor },
                                            }}
                                        />
                                    }
                                    label={<Typography variant="body2" fontWeight={600}>Requiere Docente</Typography>}
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.activo}
                                            onChange={handleChange}
                                            name="activo"
                                            sx={{
                                                '& .MuiSwitch-switchBase.Mui-checked': { color: greenColor },
                                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: greenColor },
                                            }}
                                        />
                                    }
                                    label={<Typography variant="body2" fontWeight={600}>Estado Activo</Typography>}
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions sx={{ p: 3, gap: 2, backgroundColor: alpha(theme.palette.background.paper, 0.5) }}>
                    <Button
                        onClick={() => {
                            setOpenDialog(false);
                            limpiarFormulario();
                        }}
                        sx={{ borderRadius: '12px', px: 3, fontWeight: 600, textTransform: 'none', color: 'text.secondary' }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        sx={{
                            background: `linear-gradient(135deg, ${redColor} 0%, #b91c1c 100%)`,
                            fontWeight: 700,
                            borderRadius: '12px',
                            px: 4,
                            boxShadow: `0 4px 12px ${alpha(redColor, 0.3)}`,
                            textTransform: 'none',
                            '&:hover': {
                                background: `linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)`,
                                transform: 'translateY(-2px)',
                            },
                            transition: 'all 0.3s ease',
                        }}
                    >
                        {modoEdicion ? '✓ Actualizar' : '+ Crear'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default GestionTiposEgreso;