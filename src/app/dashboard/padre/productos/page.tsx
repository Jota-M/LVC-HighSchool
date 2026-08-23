'use client';
// app/dashboard/padre/productos/page.tsx
// Tienda escolar con navegación por pestañas:
// - Pestaña "Tienda": Catálogo editorial y compra de uniformes/útiles.
// - Pestaña "Mis Pedidos": Historial completo y pagos pendientes.

import React, { useMemo, useState } from 'react';
import {
    Box, Container, Typography, Fade, useTheme, alpha,
    Button, CircularProgress, IconButton, Badge, Tooltip,
    Tabs, Tab, TextField, InputAdornment, FormControl, Select, MenuItem,
} from '@mui/material';
import { keyframes } from '@mui/system';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import CheckroomRoundedIcon from '@mui/icons-material/CheckroomRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import InventoryRoundedIcon from '@mui/icons-material/InventoryRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import { ProductoCard } from '@/components/productos/padre/ProductoCard';
import { CarritoDrawer } from '@/components/productos/padre/CarritoDrawer';
import { ModalAsignarEstudiante } from '@/components/productos/padre/ModalAsignarEstudiante';
import { MisPedidosTab } from '@/components/productos/padre/MisPedidosTab';

import {
    useCatalogoProductos,
    useCarritoProductos,
    useHijosConProductos,
    usePedidoLibre,
    useMisPedidos,
} from '@/hooks/usePadreProductos';
import {
    type Producto,
    type CategoriaProducto,
} from '@/types/productos';

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`;

const CATEGORIAS_FILTRO: { value: CategoriaProducto | 'todas'; label: string }[] = [
    { value: 'todas', label: 'Todas las categorías' },
    { value: 'uniforme', label: 'Uniformes' },
    { value: 'deportivo', label: 'Deportivos' },
    { value: 'utiles', label: 'Útiles' },
    { value: 'otro', label: 'Otro' },
];

export default function ProductosCatalogoPage() {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const gold = isDark ? '#facc15' : '#0288d1';
    const goldDeep = isDark ? '#f59e0b' : '#01579b';
    const goldSoft = alpha(gold, isDark ? 0.15 : 0.1);
    const gradient = `linear-gradient(135deg, ${gold} 0%, ${goldDeep} 100%)`;
    const router = useRouter();

    // Pestaña activa principal: 'tienda' | 'pedidos'
    const [tabPrincipal, setTabPrincipal] = useState<'tienda' | 'pedidos'>('tienda');

    // Filtro de categoría + buscador en tienda
    const [categoriaFiltro, setCategoriaFiltro] = useState<CategoriaProducto | 'todas'>('todas');
    const [busqueda, setBusqueda] = useState('');
    const filtrosCatalogo = categoriaFiltro !== 'todas' ? { categoria: categoriaFiltro } : undefined;

    const { productos, loading: loadingCatalogo, recargar: recargarCatalogo } = useCatalogoProductos(filtrosCatalogo);
    const { items, agregarItem, quitarItem, actualizarCantidad, vaciarCarrito, total } = useCarritoProductos();
    const { hijos } = useHijosConProductos();
    const { crearPedido } = usePedidoLibre();
    const { pedidos, loading: loadingPedidos, recargar: recargarPedidos } = useMisPedidos();

    const pedidosPendientes = pedidos.filter(p => p.estado === 'pendiente_pago');

    // Filtrado client-side por nombre, sobre lo que ya devolvió el hook (filtrado por categoría)
    const productosFiltrados = useMemo(() => {
        const q = busqueda.trim().toLowerCase();
        if (!q) return productos;
        return productos.filter((p: Producto) => p.nombre.toLowerCase().includes(q));
    }, [productos, busqueda]);

    const [carritoAbierto, setCarritoAbierto] = useState(false);
    const [creandoPedido, setCreandoPedido] = useState(false);

    // Selección de variante por producto
    const [seleccion, setSeleccion] = useState<Record<number, number>>({});

    // Modal de asignación de hijo (checkout)
    const [modalHijo, setModalHijo] = useState(false);
    const [estudianteSeleccionado, setEstudianteSeleccionado] = useState<number | 'general'>('general');

    const handleAgregarAlCarrito = (producto: Producto) => {
        const varianteId = seleccion[producto.id] ?? producto.variantes?.[0]?.id;
        const variante = producto.variantes?.find((v) => v.id === varianteId);

        if (!variante) {
            toast.error('Elegí una opción antes de agregar');
            return;
        }
        if (variante.stock_disponible <= 0) {
            toast.error('Sin stock disponible para esa variante');
            return;
        }

        agregarItem({
            producto_variante_id: variante.id,
            cantidad: 1,
            producto_nombre: producto.nombre,
            talla: variante.talla,
            color: variante.color,
            precio_unitario: variante.precio ?? producto.precio_base,
        });
        toast.success(`${producto.nombre} agregado al carrito`);
    };

    const handleAbrirCheckout = () => {
        if (items.length === 0) return;
        const hijosConMatricula = hijos.filter(h => h.matricula_id);
        if (hijosConMatricula.length > 0) {
            setEstudianteSeleccionado('general');
            setModalHijo(true);
        } else {
            handleConfirmarPedido('general');
        }
    };

    const handleConfirmarPedido = async (asignacion: number | 'general') => {
        setModalHijo(false);
        setCreandoPedido(true);
        try {
            const estudianteId = asignacion !== 'general' ? asignacion : undefined;
            const pedido = await crearPedido(items, estudianteId);
            vaciarCarrito();
            setCarritoAbierto(false);
            recargarPedidos(); // Refresca pedidos
            toast.success('Pedido creado. ¡Ahora podés pagarlo!');
            router.push(`/dashboard/padre/productos/pagar/${pedido.id}`);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'No se pudo crear el pedido');
        } finally {
            setCreandoPedido(false);
        }
    };

    const hijosConMatricula = hijos.filter(h => h.matricula_id);
    const inputBorder = isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1);
    const inputBg = isDark ? alpha('#fff', 0.05) : alpha('#000', 0.03);

    return (
        <Box sx={{ minHeight: '100vh', py: 4 }}>
            <Container maxWidth="xl">

                {/* ── Header Principal ─────────────────────────────── */}
                <Fade in timeout={500}>
                    <Box sx={{ mb: 3 }}>
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
                                            color: gold,
                                            fontSize: 36,
                                            animation: `${bounce} 1.5s infinite`,
                                        }}
                                    />
                                    <Typography
                                        variant="h1"
                                        sx={{
                                            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                                            fontWeight: 800,
                                            background: gradient,
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                        }}
                                    >
                                        Tienda escolar
                                    </Typography>
                                </Box>
                                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, letterSpacing: 0.3 }}>
                                    Uniformes, deportivos, útiles y seguimiento de tus pedidos.
                                </Typography>
                            </Box>

                            {/* DERECHA: ACCIONES */}
                            <Box
                                sx={{
                                    display: 'flex', gap: 1.5, alignItems: 'center',
                                    width: { xs: '100%', md: 'auto' },
                                    justifyContent: { xs: 'flex-end', md: 'flex-end' },
                                }}
                            >
                                <Tooltip title="Actualizar">
                                    <IconButton
                                        onClick={() => {
                                            if (tabPrincipal === 'tienda') recargarCatalogo();
                                            else recargarPedidos();
                                        }}
                                        sx={{
                                            bgcolor: inputBg,
                                            '&:hover': { bgcolor: goldSoft },
                                        }}
                                    >
                                        <RefreshRoundedIcon />
                                    </IconButton>
                                </Tooltip>

                                <Badge badgeContent={items.length} color="warning">
                                    <IconButton
                                        onClick={() => setCarritoAbierto(true)}
                                        sx={{
                                            background: items.length > 0 ? gradient : inputBg,
                                            boxShadow: items.length > 0 ? `0 4px 16px ${alpha(gold, 0.35)}` : 'none',
                                            transition: 'all 0.25s',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: `0 6px 18px ${alpha(gold, 0.4)}`,
                                            },
                                        }}
                                    >
                                        <ShoppingCartRoundedIcon sx={{ color: items.length > 0 ? (isDark ? '#000' : '#fff') : gold }} />
                                    </IconButton>
                                </Badge>
                            </Box>
                        </Box>

                        {/* ── Tabs Principales (barra degradada, estilo Estudiantes) ── */}
                        <Tabs
                            value={tabPrincipal}
                            onChange={(_, newVal) => setTabPrincipal(newVal)}
                            sx={{
                                background: gradient,
                                borderRadius: '16px',
                                p: 1,
                                backdropFilter: 'blur(20px)',
                                '& .MuiTab-root': {
                                    borderRadius: '12px',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    minHeight: 48,
                                    color: isDark ? alpha('#000', 0.65) : alpha('#fff', 0.8),
                                },
                                '& .Mui-selected': {
                                    color: isDark ? '#000' : '#fff',
                                },
                                '& .MuiTabs-indicator': {
                                    backgroundColor: isDark ? '#000' : '#fff',
                                    height: 3,
                                    borderRadius: '3px 3px 0 0',
                                },
                            }}
                        >
                            <Tab
                                value="tienda"
                                icon={<StorefrontRoundedIcon sx={{ fontSize: 20 }} />}
                                iconPosition="start"
                                label="Tienda & Catálogo"
                                sx={{ fontWeight: 700, fontSize: { xs: '0.85rem', sm: '0.95rem' }, minHeight: 48 }}
                            />
                            <Tab
                                value="pedidos"
                                icon={
                                    <Badge
                                        badgeContent={pedidosPendientes.length}
                                        color="error"
                                        sx={{ '& .MuiBadge-badge': { fontWeight: 800, fontSize: '0.7rem', right: -4, top: 2 } }}
                                    >
                                        <ReceiptLongRoundedIcon sx={{ fontSize: 20 }} />
                                    </Badge>
                                }
                                iconPosition="start"
                                label="Mis Pedidos & Historial"
                                sx={{ fontWeight: 700, fontSize: { xs: '0.85rem', sm: '0.95rem' }, minHeight: 48 }}
                            />
                        </Tabs>
                    </Box>
                </Fade>

                {/* ── VISTA 1: TIENDA & CATÁLOGO ────────────────────── */}
                {tabPrincipal === 'tienda' && (
                    <Fade in timeout={400}>
                        <Box>
                            {/* ── Buscador (fila propia, ancho completo) ── */}
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Buscar productos por nombre..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchRoundedIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    mb: 1.5,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                        bgcolor: inputBg,
                                        '& fieldset': { borderColor: inputBorder },
                                        '&:hover fieldset': { borderColor: alpha(gold, 0.4) },
                                        '&.Mui-focused fieldset': { borderColor: gold },
                                    },
                                }}
                            />

                            {/* ── Categorías: pastillas transparentes (mismo tono que el buscador) ── */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    gap: 0.5,
                                    p: 0.5,
                                    mb: 3,
                                    borderRadius: '13px',
                                    bgcolor: inputBg,
                                    border: `1px solid ${inputBorder}`,
                                    overflowX: 'auto',
                                    '&::-webkit-scrollbar': { display: 'none' },
                                }}
                            >
                                {CATEGORIAS_FILTRO.map(cat => {
                                    const activa = categoriaFiltro === cat.value;
                                    return (
                                        <Box
                                            key={cat.value}
                                            onClick={() => setCategoriaFiltro(cat.value)}
                                            sx={{
                                                px: 2, py: 0.9,
                                                borderRadius: '10px',
                                                cursor: 'pointer',
                                                whiteSpace: 'nowrap',
                                                fontWeight: 700,
                                                fontSize: '0.85rem',
                                                color: activa ? gold : 'text.secondary',
                                                bgcolor: activa ? alpha(gold, 0.12) : 'transparent',
                                                transition: 'all 0.15s',
                                                '&:hover': { bgcolor: activa ? alpha(gold, 0.16) : (isDark ? alpha('#fff', 0.04) : alpha('#000', 0.03)) },
                                            }}
                                        >
                                            {cat.label}
                                        </Box>
                                    );
                                })}
                            </Box>

                            {/* ── Grid del Catálogo ── */}
                            {loadingCatalogo ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 10 }}>
                                    <CircularProgress sx={{ color: gold }} />
                                    <Typography variant="body2" color="text.secondary">Cargando catálogo…</Typography>
                                </Box>
                            ) : productosFiltrados.length === 0 ? (
                                <Fade in timeout={400}>
                                    <Box sx={{ textAlign: 'center', py: 8 }}>
                                        <Box sx={{
                                            width: 72, height: 72, borderRadius: '20px', mx: 'auto', mb: 2,
                                            bgcolor: goldSoft, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            {busqueda ? (
                                                <SearchRoundedIcon sx={{ color: gold, fontSize: 34 }} />
                                            ) : (
                                                <InventoryRoundedIcon sx={{ color: gold, fontSize: 34 }} />
                                            )}
                                        </Box>
                                        <Typography fontWeight={700} sx={{ mb: 0.5 }}>
                                            {busqueda ? `Sin resultados para "${busqueda}"` : 'No hay productos disponibles'}
                                        </Typography>
                                        <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
                                            {busqueda ? 'Probá con otro término de búsqueda.' : 'Probá con otra categoría o volvé a intentar.'}
                                        </Typography>
                                        <Button
                                            startIcon={<RefreshRoundedIcon />}
                                            onClick={() => {
                                                if (busqueda) { setBusqueda(''); } else { recargarCatalogo(); }
                                            }}
                                            sx={{ borderRadius: '10px', fontWeight: 700, color: gold }}
                                        >
                                            {busqueda ? 'Limpiar búsqueda' : 'Reintentar'}
                                        </Button>
                                    </Box>
                                </Fade>
                            ) : (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: { xs: 2, sm: 2.5 },
                                    }}
                                >
                                    {productosFiltrados.map((producto: Producto, idx: number) => (
                                        <Box
                                            key={producto.id}
                                            sx={{
                                                flex: '0 1 auto',
                                                width: {
                                                    xs: 'calc(50% - 8px)',
                                                    sm: '200px',
                                                    md: '210px',
                                                },
                                            }}
                                        >
                                            <ProductoCard
                                                producto={producto}
                                                varianteSeleccionadaId={seleccion[producto.id]}
                                                onCambiarVariante={(productoId, varianteId) =>
                                                    setSeleccion(prev => ({ ...prev, [productoId]: varianteId }))
                                                }
                                                onAgregar={handleAgregarAlCarrito}
                                                delayIndex={idx}
                                            />
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    </Fade>
                )}

                {/* ── VISTA 2: MIS PEDIDOS & HISTORIAL ─────────────── */}
                {tabPrincipal === 'pedidos' && (
                    <Fade in timeout={400}>
                        <Box>
                            <MisPedidosTab
                                pedidos={pedidos}
                                loading={loadingPedidos}
                                onRecargar={recargarPedidos}
                                onIrATienda={() => setTabPrincipal('tienda')}
                            />
                        </Box>
                    </Fade>
                )}

            </Container>

            {/* ── Carrito Drawer ───────────────────────────────── */}
            <CarritoDrawer
                open={carritoAbierto}
                onClose={() => setCarritoAbierto(false)}
                items={items}
                total={total}
                creandoPedido={creandoPedido}
                onQuitarItem={quitarItem}
                onActualizarCantidad={actualizarCantidad}
                onCheckout={handleAbrirCheckout}
            />

            {/* ── Modal de Asignación de Hijo ──────────────────── */}
            <ModalAsignarEstudiante
                open={modalHijo}
                onClose={() => setModalHijo(false)}
                hijos={hijosConMatricula}
                estudianteSeleccionado={estudianteSeleccionado}
                onCambiarSeleccion={setEstudianteSeleccionado}
                onConfirmar={() => handleConfirmarPedido(estudianteSeleccionado)}
                creandoPedido={creandoPedido}
            />
        </Box>
    );
}