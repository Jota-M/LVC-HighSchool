'use client';
// app/dashboard/productos/page.tsx

import React, { useMemo, useState } from 'react';
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
    Menu,
    MenuItem,
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
    LinearProgress,
    Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import CheckroomRoundedIcon from '@mui/icons-material/CheckroomRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import ViewModuleRoundedIcon from '@mui/icons-material/ViewModuleRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import PaidRoundedIcon from '@mui/icons-material/PaidRounded';
import StyleRoundedIcon from '@mui/icons-material/StyleRounded';

import { useProductos } from '@/hooks/useProductos';
import { ProductoFormDialog } from '@/components/productos/ProductoFormDialog';
import { ProductoCard } from '@/components/productos/ProductoCard';
import { ProductoStatCard } from '@/components/productos/Productostatcard';
import { CATEGORIAS_PRODUCTO, type Producto, type CategoriaProducto } from '@/types/productos';

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`;

const STOCK_BAJO_UMBRAL = 5;

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
    <div role="tabpanel" hidden={value !== index}>
        {value === index && <Box sx={{ pt: 4 }}>{children}</Box>}
    </div>
);

const ProductosAdminPage: React.FC = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const brand = isDark ? '#facc15' : '#0288d1';

    const [activeTab, setActiveTab] = useState(0);
    const [search, setSearch] = useState('');
    const [categoriaFiltro, setCategoriaFiltro] = useState<CategoriaProducto | ''>('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
    const [menuAnchor, setMenuAnchor] = useState<{ el: HTMLElement; producto: Producto } | null>(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    // Sin filtro de categoría acá: Inventario y Estadísticas necesitan el catálogo completo
    const { productos, loading, crearProducto, actualizarProducto, eliminarProducto } = useProductos();

    const productosFiltrados = productos.filter((p: Producto) =>
        (p.nombre.toLowerCase().includes(search.toLowerCase()) || p.codigo.toLowerCase().includes(search.toLowerCase())) &&
        (categoriaFiltro === '' || p.categoria === categoriaFiltro)
    );

    // ============== Inventario: aplanar variantes en filas ==============
    const filasInventario = useMemo(() => {
        return productos.flatMap((p) => {
            if (!p.tiene_variantes || !p.variantes?.length) {
                return [{
                    productoId: p.id,
                    nombre: p.nombre,
                    codigo: p.codigo,
                    categoria: p.categoria,
                    variante: null as null | string,
                    stockDisponible: null as null | number,
                    stockTotal: null as null | number,
                }];
            }
            return p.variantes.map((v) => ({
                productoId: p.id,
                nombre: p.nombre,
                codigo: p.codigo,
                categoria: p.categoria,
                variante: [v.talla, v.color].filter(Boolean).join(' / ') || '-',
                stockDisponible: v.stock_disponible,
                stockTotal: v.stock_total,
            }));
        });
    }, [productos]);

    const variantesBajoStock = filasInventario.filter(
        (f) => f.stockDisponible !== null && f.stockDisponible <= STOCK_BAJO_UMBRAL
    );
    const unidadesTotales = filasInventario.reduce((sum, f) => sum + (f.stockDisponible ?? 0), 0);
    const productosSinControl = productos.filter((p) => !p.tiene_variantes).length;

    // ============== Estadísticas ==============
    const totalProductos = productos.length;
    const totalActivos = productos.filter((p) => p.activo).length;
    const totalInactivos = totalProductos - totalActivos;
    const sinVariantes = productos.filter((p) => !p.tiene_variantes).length;

    const valorInventario = productos.reduce((sum, p) => {
        if (!p.tiene_variantes || !p.variantes?.length) return sum;
        return sum + p.variantes.reduce((s, v) => s + (v.precio ?? p.precio_base) * v.stock_disponible, 0);
    }, 0);

    const porCategoria = (Object.keys(CATEGORIAS_PRODUCTO) as CategoriaProducto[]).map((cat) => ({
        categoria: cat,
        label: CATEGORIAS_PRODUCTO[cat],
        cantidad: productos.filter((p) => p.categoria === cat).length,
    }));

    // ============== Handlers ==============
    const handleOpenDialog = (producto: Producto | null = null) => {
        setEditingProducto(producto);
        setDialogOpen(true);
    };

    const handleSubmit = async (data: any) => {
        if (editingProducto) {
            await actualizarProducto(editingProducto.id, data);
            setSnackbar({ open: true, message: 'Producto actualizado', severity: 'success' });
        } else {
            await crearProducto(data);
            setSnackbar({ open: true, message: 'Producto creado', severity: 'success' });
        }
    };

    const handleEliminar = async (producto: Producto) => {
        setMenuAnchor(null);
        if (!confirm(`¿Eliminar "${producto.nombre}"?`)) return;
        try {
            await eliminarProducto(producto.id);
            setSnackbar({ open: true, message: 'Producto eliminado', severity: 'success' });
        } catch (err: any) {
            setSnackbar({ open: true, message: err.response?.data?.message || 'Error al eliminar', severity: 'error' });
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', py: 4 }}>
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
                            {/* IZQUIERDA: TÍTULO + PÁRRAFO */}
                            <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <CheckroomRoundedIcon
                                        sx={{
                                            color: isDark ? '#facc15' : '#0288d1',
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
                                            animation: 'fadeIn 1s ease-out',
                                            '@keyframes fadeIn': {
                                                from: { opacity: 0, transform: 'translateY(-10px)' },
                                                to: { opacity: 1, transform: 'translateY(0)' },
                                            },
                                        }}
                                    >
                                        Uniformes y deportivos
                                    </Typography>
                                </Box>

                                <Typography
                                    variant="body1"
                                    color="text.secondary"
                                    sx={{
                                        fontWeight: 500,
                                        letterSpacing: 0.3,
                                        animation: 'fadeInText 1.2s ease-out',
                                        '@keyframes fadeInText': {
                                            from: { opacity: 0, transform: 'translateY(5px)' },
                                            to: { opacity: 1, transform: 'translateY(0)' },
                                        },
                                    }}
                                >
                                    Administra el catálogo, el stock y las estadísticas de venta.
                                </Typography>
                            </Box>

                            {/* DERECHA: BOTÓN — solo tiene sentido en el tab de Productos */}
                            {activeTab === 0 && (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        gap: 2,
                                        alignItems: 'center',
                                        width: { xs: '100%', md: 'auto' },
                                        justifyContent: { xs: 'flex-start', md: 'flex-end' },
                                    }}
                                >
                                    <Button
                                        variant="contained"
                                        size="large"
                                        startIcon={<AddIcon />}
                                        onClick={() => handleOpenDialog(null)}
                                        sx={{
                                            fontSize: { xs: '0.5rem', md: '1rem' },
                                            borderRadius: '12px',
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            px: 4,
                                            py: 1.5,
                                            background: isDark
                                                ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                                                : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                                            color: isDark ? '#000' : '#fff',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: isDark
                                                    ? '0 8px 24px rgba(250, 204, 21, 0.3)'
                                                    : '0 8px 24px rgba(2, 136, 209, 0.3)',
                                            },
                                            transition: 'all 0.3s ease',
                                        }}
                                    >
                                        Nuevo Producto
                                    </Button>
                                </Box>
                            )}
                        </Box>

                        {/* Tabs */}
                        <Tabs
                            value={activeTab}
                            onChange={(_, newValue) => setActiveTab(newValue)}
                            sx={{
                                background: isDark
                                    ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                                    : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                                borderRadius: '16px',
                                p: 1,
                                backdropFilter: 'blur(20px)',
                                '& .MuiTab-root': {
                                    borderRadius: '12px',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    minHeight: 48,
                                    color: isDark ? '#000' : '#fff',
                                },
                                '& .Mui-selected': {
                                    color: isDark ? '#fff' : '#fff',
                                },
                                '& .MuiTabs-indicator': {
                                    backgroundColor: isDark ? '#fff' : '#fff',
                                    height: 3,
                                    borderRadius: '3px 3px 0 0',
                                },
                            }}
                        >
                            <Tab icon={<ViewModuleRoundedIcon />} iconPosition="start" label="Productos" />
                            <Tab icon={<Inventory2RoundedIcon />} iconPosition="start" label="Inventario" />
                            <Tab icon={<AssessmentRoundedIcon />} iconPosition="start" label="Estadísticas" />
                        </Tabs>
                    </Box>
                </Fade>

                {/* TAB 0: Productos */}
                <TabPanel value={activeTab} index={0}>
                    <Fade in timeout={700}>
                        <Box>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
                                <TextField
                                    placeholder="Buscar por nombre o código..."
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
                                    label="Categoría"
                                    value={categoriaFiltro}
                                    onChange={(e) => setCategoriaFiltro(e.target.value as CategoriaProducto | '')}
                                    size="small"
                                    sx={{ minWidth: 200 }}
                                >
                                    <MenuItem value="">Todas</MenuItem>
                                    {Object.entries(CATEGORIAS_PRODUCTO).map(([value, label]) => (
                                        <MenuItem key={value} value={value}>{label as string}</MenuItem>
                                    ))}
                                </TextField>
                            </Stack>

                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                                    <CircularProgress sx={{ color: brand }} />
                                </Box>
                            ) : productosFiltrados.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 6 }}>
                                    <Inventory2RoundedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                                    <Typography color="text.secondary">No hay productos que coincidan con la búsqueda.</Typography>
                                </Box>
                            ) : (
                                <Grid container spacing={3}>
                                    {productosFiltrados.map((producto: Producto) => (
                                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={producto.id}>
                                            <Fade in timeout={300}>
                                                <Box sx={{ height: '100%' }}>
                                                    <ProductoCard
                                                        producto={producto}
                                                        onEdit={handleOpenDialog}
                                                        onDelete={handleEliminar}
                                                        onMenuOpen={(e, p) => setMenuAnchor({ el: e.currentTarget, producto: p })}
                                                    />
                                                </Box>
                                            </Fade>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </Box>
                    </Fade>
                </TabPanel>

                {/* TAB 1: Inventario */}
                <TabPanel value={activeTab} index={1}>
                    <Fade in timeout={700}>
                        <Box>
                            {/* Resumen rápido, estilo StatCard */}
                            <Grid container spacing={3} sx={{ mb: 3 }}>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <ProductoStatCard
                                        title="Unidades en stock"
                                        value={unidadesTotales}
                                        icon={<Inventory2RoundedIcon />}
                                        color={brand}
                                        subtitle="Disponibles en todas las variantes"
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <ProductoStatCard
                                        title={`Stock bajo (≤${STOCK_BAJO_UMBRAL})`}
                                        value={variantesBajoStock.length}
                                        icon={<WarningAmberRoundedIcon />}
                                        color="#ef4444"
                                        subtitle={variantesBajoStock.length > 0 ? 'Requieren reposición' : 'Todo en orden'}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <ProductoStatCard
                                        title="Sin control de stock"
                                        value={productosSinControl}
                                        icon={<BlockRoundedIcon />}
                                        color="#f59e0b"
                                        subtitle="Productos sin variantes"
                                    />
                                </Grid>
                            </Grid>

                            {/* Tabla de inventario por variante */}
                            <TableContainer component={Card} sx={{ borderRadius: '16px', border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: isDark ? alpha('#facc15', 0.08) : alpha('#0288d1', 0.05) } }}>
                                            <TableCell>Producto</TableCell>
                                            <TableCell>Categoría</TableCell>
                                            <TableCell>Variante</TableCell>
                                            <TableCell align="right">Disponible</TableCell>
                                            <TableCell align="right">Total</TableCell>
                                            <TableCell align="center">Estado</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filasInventario.map((fila, idx) => (
                                            <TableRow key={`${fila.productoId}-${idx}`} hover>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight={700}>{fila.nombre}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{fila.codigo}</Typography>
                                                </TableCell>
                                                <TableCell>{CATEGORIAS_PRODUCTO[fila.categoria]}</TableCell>
                                                <TableCell>{fila.variante ?? '—'}</TableCell>
                                                <TableCell align="right">{fila.stockDisponible ?? '—'}</TableCell>
                                                <TableCell align="right">{fila.stockTotal ?? '—'}</TableCell>
                                                <TableCell align="center">
                                                    {fila.stockDisponible === null ? (
                                                        <Chip label="Sin control" size="small" />
                                                    ) : fila.stockDisponible <= STOCK_BAJO_UMBRAL ? (
                                                        <Chip icon={<WarningAmberRoundedIcon />} label="Stock bajo" size="small" color="error" />
                                                    ) : (
                                                        <Chip label="OK" size="small" color="success" />
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </Fade>
                </TabPanel>

                {/* TAB 2: Estadísticas */}
                <TabPanel value={activeTab} index={2}>
                    <Fade in timeout={700}>
                        <Box>
                            <Grid container spacing={3} sx={{ mb: 3 }}>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <ProductoStatCard
                                        title="Total de productos"
                                        value={totalProductos}
                                        icon={<Inventory2RoundedIcon />}
                                        color={brand}
                                        subtitle="Registrados en el catálogo"
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <ProductoStatCard
                                        title="Activos"
                                        value={totalActivos}
                                        icon={<CheckCircleRoundedIcon />}
                                        color="#10b981"
                                        subtitle={totalProductos > 0 ? `${((totalActivos / totalProductos) * 100).toFixed(1)}% del total` : undefined}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <ProductoStatCard
                                        title="Inactivos"
                                        value={totalInactivos}
                                        icon={<CancelRoundedIcon />}
                                        color="#ef4444"
                                        subtitle={totalInactivos > 0 ? 'Fuera de venta' : 'Todo en orden'}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <ProductoStatCard
                                        title="Sin variantes"
                                        value={sinVariantes}
                                        icon={<StyleRoundedIcon />}
                                        color="#8b5cf6"
                                        subtitle="Sin talla/color registrados"
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <ProductoStatCard
                                        title="Valor de inventario"
                                        value={`Bs ${valorInventario.toFixed(2)}`}
                                        icon={<PaidRoundedIcon />}
                                        color="#06b6d4"
                                        subtitle="Precio × stock disponible"
                                    />
                                </Grid>
                            </Grid>

                            {/* Distribución por categoría */}
                            <Card sx={{ p: 3, borderRadius: '16px', border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                                <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2 }}>
                                    Distribución por categoría
                                </Typography>
                                <Stack spacing={2}>
                                    {porCategoria.map(({ categoria, label, cantidad }) => {
                                        const pct = totalProductos > 0 ? Math.round((cantidad / totalProductos) * 100) : 0;
                                        return (
                                            <Box key={categoria}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                    <Typography variant="body2" fontWeight={600}>{label}</Typography>
                                                    <Typography variant="body2" color="text.secondary">{cantidad} ({pct}%)</Typography>
                                                </Box>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={pct}
                                                    sx={{
                                                        height: 8,
                                                        borderRadius: 4,
                                                        bgcolor: alpha(brand, 0.1),
                                                        '& .MuiLinearProgress-bar': { bgcolor: brand, borderRadius: 4 },
                                                    }}
                                                />
                                            </Box>
                                        );
                                    })}
                                </Stack>
                            </Card>
                        </Box>
                    </Fade>
                </TabPanel>
            </Container>

            {/* Menú contextual por card */}
            <Menu anchorEl={menuAnchor?.el} open={!!menuAnchor} onClose={() => setMenuAnchor(null)}>
                <MenuItem onClick={() => { handleOpenDialog(menuAnchor!.producto); setMenuAnchor(null); }}>
                    <EditRoundedIcon fontSize="small" sx={{ mr: 1 }} /> Editar
                </MenuItem>
                <MenuItem onClick={() => handleEliminar(menuAnchor!.producto)} sx={{ color: '#ef4444' }}>
                    <DeleteOutlineRoundedIcon fontSize="small" sx={{ mr: 1 }} /> Eliminar
                </MenuItem>
            </Menu>

            <ProductoFormDialog
                open={dialogOpen}
                producto={editingProducto}
                onClose={() => setDialogOpen(false)}
                onSubmit={handleSubmit}
            />

            <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ProductosAdminPage;