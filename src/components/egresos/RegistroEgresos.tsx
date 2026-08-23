// components/egresos/RegistroEgresos.tsx
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
    Fade,
    Switch,
    FormControlLabel,
    Alert,
    Avatar,
} from '@mui/material';
import {
    DataGrid,
    GridColDef,
    GridRenderCellParams,
} from '@mui/x-data-grid';
import {
    Add as AddIcon,
    Visibility as ViewIcon,
    CheckCircle as VerifyIcon,
    Cancel as AnularIcon,
    AttachFile as AttachIcon,
    Search as SearchIcon,
    Close as CloseIcon,
    Receipt as ReceiptIcon,
    AccountBalance as BankIcon,
    CreditCard as CardIcon,
    Money as MoneyIcon,
    QrCode as QrCodeIcon,
} from '@mui/icons-material';
import { useEgresos } from '@/hooks/useEgresos';
import egresosService from '@/services/egresos';
import type { Egreso, CrearEgresoRequest } from '@/types/egresos';

// NOTA: a diferencia de Registroingresos.tsx, este componente usa un único
// DataGrid (sin vista de cards para mobile) para mantenerlo más liviano.
// Si se necesita paridad total con la vista mobile, se puede portar
// MobileCardView de Registroingresos.tsx siguiendo el mismo patrón.

export const RegistroEgresos: React.FC = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const {
        tipos,
        egresos,
        loadingEgresos,
        cargarEgresos,
        crearEgreso,
        verificarEgreso,
        anularEgreso,
    } = useEgresos({
        autoLoad: true,
        loadTipos: true,
        loadEgresos: true,
    });

    const [openDialog, setOpenDialog] = useState(false);
    const [openDetalles, setOpenDetalles] = useState(false);
    const [egresoSeleccionado, setEgresoSeleccionado] = useState<Egreso | null>(null);
    const [comprobante, setComprobante] = useState<File | null>(null);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filtros, setFiltros] = useState({
        search: '',
        tipo_egreso_id: '',
        metodo_pago: '',
        estado: '',
    });

    const [formData, setFormData] = useState<CrearEgresoRequest>({
        tipo_egreso_id: 0,
        fecha_egreso: new Date().toISOString().split('T')[0],
        docente_id: undefined,
        concepto: '',
        descripcion: '',
        monto: 0,
        metodo_pago: 'efectivo',
        numero_comprobante: '',
        banco: '',
        numero_referencia: '',
        beneficiario: '',
        requiere_factura: false,
        numero_factura: '',
        nit_proveedor: '',
        observaciones: '',
    });

    const limpiarFormulario = () => {
        setFormData({
            tipo_egreso_id: 0,
            fecha_egreso: new Date().toISOString().split('T')[0],
            docente_id: undefined,
            concepto: '',
            descripcion: '',
            monto: 0,
            metodo_pago: 'efectivo',
            numero_comprobante: '',
            banco: '',
            numero_referencia: '',
            beneficiario: '',
            requiere_factura: false,
            numero_factura: '',
            nit_proveedor: '',
            observaciones: '',
        });
        setComprobante(null);
    };

    const handleNuevoEgreso = () => {
        limpiarFormulario();
        setOpenDialog(true);
    };

    const handleVerDetalles = (egreso: Egreso) => {
        setEgresoSeleccionado(egreso);
        setOpenDetalles(true);
    };

    const handleVerificar = async (egreso: Egreso) => {
        if (confirm('¿Está seguro de verificar este egreso?')) {
            try {
                await verificarEgreso(egreso.id);
                alert('Egreso verificado exitosamente');
            } catch (error: any) {
                alert(error.response?.data?.message || 'Error al verificar el egreso');
            }
        }
    };

    const handleAnular = async (egreso: Egreso) => {
        const motivo = prompt('Ingrese el motivo de anulación:');
        if (!motivo) return;

        if (confirm('¿Está seguro de anular este egreso?')) {
            try {
                await anularEgreso(egreso.id, motivo);
                alert('Egreso anulado exitosamente');
            } catch (error: any) {
                alert(error.response?.data?.message || 'Error al anular el egreso');
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked :
                name === 'tipo_egreso_id' || name === 'docente_id' || name === 'monto'
                    ? parseFloat(value) || 0
                    : value,
        }));
    };

    const handleArchivoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setComprobante(e.target.files[0]);
        }
    };

    const tipoSeleccionadoForm = tipos.find((t) => t.id === formData.tipo_egreso_id);

    const handleSubmit = async () => {
        try {
            if (!formData.concepto.trim()) {
                alert('El concepto es requerido');
                return;
            }

            const validacionMonto = egresosService.validarMonto(formData.monto);
            if (!validacionMonto.valido) {
                alert(validacionMonto.mensaje);
                return;
            }

            if (tipoSeleccionadoForm?.requiere_docente && !formData.docente_id) {
                alert('Este tipo de egreso requiere seleccionar un docente');
                return;
            }

            await crearEgreso(formData, comprobante || undefined);
            alert('Egreso registrado exitosamente');
            setOpenDialog(false);
            limpiarFormulario();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error al registrar el egreso');
        }
    };

    const handleFiltrar = () => {
        cargarEgresos({
            search: filtros.search,
            tipo_egreso_id: filtros.tipo_egreso_id ? parseInt(filtros.tipo_egreso_id) : undefined,
            metodo_pago: filtros.metodo_pago as any || undefined,
            estado: filtros.estado as any || undefined,
        });
    };

    const redColor = '#ef4444';

    const getMetodoPagoIcon = (metodo: string) => {
        switch (metodo) {
            case 'efectivo': return <MoneyIcon sx={{ fontSize: 14 }} />;
            case 'transferencia': return <BankIcon sx={{ fontSize: 14 }} />;
            case 'qr': return <QrCodeIcon sx={{ fontSize: 14 }} />;
            case 'tarjeta': return <CardIcon sx={{ fontSize: 14 }} />;
            default: return <MoneyIcon sx={{ fontSize: 14 }} />;
        }
    };

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case 'verificado': return '#10b981';
            case 'registrado': return '#f59e0b';
            case 'anulado': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const columns: GridColDef[] = [
        {
            field: 'avatar',
            headerName: '',
            width: 60,
            sortable: false,
            filterable: false,
            renderCell: () => (
                <Avatar sx={{ width: 40, height: 40, bgcolor: redColor, color: '#fff', fontSize: '0.875rem' }}>
                    <ReceiptIcon sx={{ fontSize: 20 }} />
                </Avatar>
            ),
        },
        {
            field: 'codigo_egreso',
            headerName: 'Código',
            width: 130,
            renderCell: (params: GridRenderCellParams) => (
                <Chip
                    label={params.value}
                    size="small"
                    sx={{
                        fontFamily: 'monospace',
                        fontWeight: 900,
                        fontSize: '0.7rem',
                        backgroundColor: alpha(redColor, 0.15),
                        color: redColor,
                        border: `1px solid ${alpha(redColor, 0.3)}`,
                    }}
                />
            ),
        },
        {
            field: 'fecha_egreso',
            headerName: 'Fecha',
            width: 110,
            renderCell: (params: GridRenderCellParams) => (
                <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem' }}>
                    {egresosService.formatearFechaCorta(params.value)}
                </Typography>
            ),
        },
        {
            field: 'tipo_egreso_nombre',
            headerName: 'Tipo de Egreso',
            flex: 1,
            minWidth: 150,
            renderCell: (params: GridRenderCellParams) => (
                <Chip
                    label={params.value}
                    size="small"
                    sx={{
                        backgroundColor: alpha(params.row.tipo_egreso_color || redColor, 0.2),
                        color: params.row.tipo_egreso_color || redColor,
                        fontWeight: 700,
                        fontSize: '0.75rem',
                    }}
                />
            ),
        },
        {
            field: 'concepto',
            headerName: 'Concepto / Beneficiario',
            flex: 1,
            minWidth: 200,
            renderCell: (params: GridRenderCellParams) => {
                const beneficiario = params.row.beneficiario || (params.row.docente_nombres
                    ? egresosService.obtenerNombreCompleto(
                        params.row.docente_nombres,
                        params.row.docente_apellido_paterno,
                        params.row.docente_apellido_materno
                    )
                    : null);
                return (
                    <Box sx={{ overflow: 'hidden', width: '100%' }}>
                        <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {params.value}
                        </Typography>
                        {beneficiario && (
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                {beneficiario}
                            </Typography>
                        )}
                    </Box>
                );
            },
        },
        {
            field: 'monto_neto',
            headerName: 'Monto',
            width: 120,
            align: 'right',
            headerAlign: 'right',
            renderCell: (params: GridRenderCellParams) => (
                <Typography variant="body2" fontWeight={900} color={redColor} sx={{ fontSize: '0.9rem' }}>
                    {egresosService.formatearMonto(params.value)}
                </Typography>
            ),
        },
        {
            field: 'metodo_pago',
            headerName: 'Método',
            width: 130,
            renderCell: (params: GridRenderCellParams) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {getMetodoPagoIcon(params.value)}
                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.75rem' }}>
                        {egresosService.getMetodoPagoLabel(params.value)}
                    </Typography>
                </Box>
            ),
        },
        {
            field: 'estado',
            headerName: 'Estado',
            width: 120,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params: GridRenderCellParams) => {
                const color = getEstadoColor(params.value);
                return (
                    <Chip
                        label={egresosService.getEstadoEgresoLabel(params.value)}
                        size="small"
                        sx={{
                            fontWeight: 800,
                            fontSize: '0.65rem',
                            height: 24,
                            backgroundColor: alpha(color, 0.15),
                            color,
                            border: `1px solid ${alpha(color, 0.3)}`,
                        }}
                    />
                );
            },
        },
        {
            field: 'acciones',
            headerName: 'Acciones',
            width: 150,
            headerAlign: 'center',
            align: 'center',
            sortable: false,
            filterable: false,
            renderCell: (params: GridRenderCellParams) => (
                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                    <Tooltip title="Ver detalles" arrow>
                        <IconButton
                            size="small"
                            onClick={(e) => { e.stopPropagation(); handleVerDetalles(params.row); }}
                            sx={{ width: 32, height: 32, backgroundColor: alpha('#3b82f6', 0.1) }}
                        >
                            <ViewIcon sx={{ fontSize: 16, color: '#3b82f6' }} />
                        </IconButton>
                    </Tooltip>
                    {params.row.estado === 'registrado' && !params.row.anulado && (
                        <Tooltip title="Verificar" arrow>
                            <IconButton
                                size="small"
                                onClick={(e) => { e.stopPropagation(); handleVerificar(params.row); }}
                                sx={{ width: 32, height: 32, backgroundColor: alpha('#10b981', 0.1) }}
                            >
                                <VerifyIcon sx={{ fontSize: 16, color: '#10b981' }} />
                            </IconButton>
                        </Tooltip>
                    )}
                    {!params.row.anulado && (
                        <Tooltip title="Anular" arrow>
                            <IconButton
                                size="small"
                                onClick={(e) => { e.stopPropagation(); handleAnular(params.row); }}
                                sx={{ width: 32, height: 32, backgroundColor: alpha('#ef4444', 0.1) }}
                            >
                                <AnularIcon sx={{ fontSize: 16, color: '#ef4444' }} />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
            ),
        },
    ];

    return (
        <Box>
            {/* Header + Filtros */}
            <Card
                sx={{
                    mb: 3,
                    borderRadius: '20px',
                    border: `1px solid ${alpha(redColor, 0.3)}`,
                    background: isDark
                        ? `linear-gradient(135deg, ${alpha(redColor, 0.15)} 0%, ${alpha(redColor, 0.03)} 100%)`
                        : `linear-gradient(135deg, ${alpha(redColor, 0.1)} 0%, ${alpha(redColor, 0.02)} 100%)`,
                }}
            >
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                        <Typography variant="h6" fontWeight={700}>
                            Egresos registrados
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleNuevoEgreso}
                            sx={{
                                background: `linear-gradient(135deg, ${redColor} 0%, #b91c1c 100%)`,
                                fontWeight: 600,
                                borderRadius: '12px',
                                px: 3,
                                boxShadow: `0 4px 12px ${alpha(redColor, 0.3)}`,
                            }}
                        >
                            Nuevo Egreso
                        </Button>
                    </Box>

                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Buscar"
                                placeholder="Código, concepto, beneficiario..."
                                value={filtros.search}
                                onChange={(e) => setFiltros({ ...filtros, search: e.target.value })}
                                InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <TextField
                                fullWidth
                                size="small"
                                select
                                label="Tipo de Egreso"
                                value={filtros.tipo_egreso_id}
                                onChange={(e) => setFiltros({ ...filtros, tipo_egreso_id: e.target.value })}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                            >
                                <MenuItem value="">Todos</MenuItem>
                                {tipos.map((tipo) => (
                                    <MenuItem key={tipo.id} value={tipo.id.toString()}>{tipo.nombre}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                            <TextField
                                fullWidth
                                size="small"
                                select
                                label="Método de Pago"
                                value={filtros.metodo_pago}
                                onChange={(e) => setFiltros({ ...filtros, metodo_pago: e.target.value })}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                            >
                                <MenuItem value="">Todos</MenuItem>
                                <MenuItem value="efectivo">Efectivo</MenuItem>
                                <MenuItem value="transferencia">Transferencia</MenuItem>
                                <MenuItem value="qr">QR</MenuItem>
                                <MenuItem value="tarjeta">Tarjeta</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                            <TextField
                                fullWidth
                                size="small"
                                select
                                label="Estado"
                                value={filtros.estado}
                                onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                            >
                                <MenuItem value="">Todos</MenuItem>
                                <MenuItem value="registrado">Registrado</MenuItem>
                                <MenuItem value="verificado">Verificado</MenuItem>
                                <MenuItem value="anulado">Anulado</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleFiltrar}
                                sx={{
                                    background: `linear-gradient(135deg, ${redColor} 0%, #b91c1c 100%)`,
                                    fontWeight: 600,
                                    borderRadius: '12px',
                                    height: '40px',
                                }}
                            >
                                Filtrar
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Tabla */}
            <Fade in>
                <Paper
                    sx={{
                        height: 650,
                        borderRadius: '24px',
                        overflow: 'hidden',
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        boxShadow: `0 8px 24px ${alpha(redColor, 0.1)}`,
                    }}
                >
                    <DataGrid
                        rows={egresos}
                        columns={columns}
                        loading={loadingEgresos}
                        pagination
                        paginationMode="client"
                        disableRowSelectionOnClick
                        paginationModel={{ page: page - 1, pageSize: rowsPerPage }}
                        onPaginationModelChange={(model) => {
                            setPage(model.page + 1);
                            if (model.pageSize !== rowsPerPage) setRowsPerPage(model.pageSize);
                        }}
                        pageSizeOptions={[10, 25, 50]}
                        sx={{
                            border: 'none',
                            '& .MuiDataGrid-cell': { borderColor: alpha(theme.palette.divider, 0.08), py: 2 },
                            '& .MuiDataGrid-columnHeaders': {
                                backgroundColor: isDark ? alpha(redColor, 0.08) : alpha(redColor, 0.05),
                                fontWeight: 800,
                                fontSize: '0.8rem',
                                textTransform: 'uppercase',
                            },
                            '& .MuiDataGrid-row': { cursor: 'pointer' },
                        }}
                        onRowClick={(params) => handleVerDetalles(params.row)}
                    />
                </Paper>
            </Fade>

            {/* Dialog de creación */}
            <Dialog
                open={openDialog}
                onClose={() => { setOpenDialog(false); limpiarFormulario(); }}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { borderRadius: '24px' } }}
            >
                <DialogTitle sx={{ background: `linear-gradient(135deg, ${redColor} 0%, #b91c1c 100%)`, color: '#fff', fontWeight: 700, borderRadius: '24px 24px 0 0' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ReceiptIcon />
                        Nuevo Egreso
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Tipo de Egreso *"
                                name="tipo_egreso_id"
                                value={formData.tipo_egreso_id}
                                onChange={handleChange}
                                required
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                            >
                                <MenuItem value={0}>Seleccione un tipo</MenuItem>
                                {tipos.filter(t => t.activo).map((tipo) => (
                                    <MenuItem key={tipo.id} value={tipo.id}>{tipo.nombre}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Fecha de Egreso"
                                name="fecha_egreso"
                                type="date"
                                value={formData.fecha_egreso}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Concepto *"
                                name="concepto"
                                value={formData.concepto}
                                onChange={handleChange}
                                required
                                placeholder="Ej: Sueldo docente - agosto 2026"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                            />
                        </Grid>

                        {tipoSeleccionadoForm?.requiere_docente && (
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="ID Docente *"
                                    name="docente_id"
                                    type="number"
                                    value={formData.docente_id || ''}
                                    onChange={handleChange}
                                    required
                                    helperText="Este tipo de egreso requiere un docente"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                />
                            </Grid>
                        )}

                        <Grid item xs={12} sm={tipoSeleccionadoForm?.requiere_docente ? 6 : 12}>
                            <TextField
                                fullWidth
                                label="Beneficiario"
                                name="beneficiario"
                                value={formData.beneficiario}
                                onChange={handleChange}
                                helperText="Nombre de quién recibe el pago (opcional si es un docente)"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Monto (Bs) *"
                                name="monto"
                                type="number"
                                value={formData.monto}
                                onChange={handleChange}
                                required
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Método de Pago *"
                                name="metodo_pago"
                                value={formData.metodo_pago}
                                onChange={handleChange}
                                required
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                            >
                                <MenuItem value="efectivo">Efectivo</MenuItem>
                                <MenuItem value="transferencia">Transferencia Bancaria</MenuItem>
                                <MenuItem value="qr">QR</MenuItem>
                                <MenuItem value="tarjeta">Tarjeta</MenuItem>
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Número de Comprobante"
                                name="numero_comprobante"
                                value={formData.numero_comprobante}
                                onChange={handleChange}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                            />
                        </Grid>

                        {(formData.metodo_pago === 'transferencia' || formData.metodo_pago === 'qr') && (
                            <>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Banco"
                                        name="banco"
                                        value={formData.banco}
                                        onChange={handleChange}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Número de Referencia"
                                        name="numero_referencia"
                                        value={formData.numero_referencia}
                                        onChange={handleChange}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                    />
                                </Grid>
                            </>
                        )}

                        <Grid item xs={12}>
                            <Button
                                variant="outlined"
                                component="label"
                                fullWidth
                                startIcon={<AttachIcon />}
                                sx={{
                                    borderRadius: '12px',
                                    borderColor: alpha(redColor, 0.3),
                                    color: redColor,
                                    height: '48px',
                                    '&:hover': { borderColor: redColor, backgroundColor: alpha(redColor, 0.1) },
                                }}
                            >
                                {comprobante ? comprobante.name : 'Adjuntar Comprobante'}
                                <input type="file" hidden accept="image/*,application/pdf" onChange={handleArchivoChange} />
                            </Button>
                        </Grid>

                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.requiere_factura}
                                        onChange={handleChange}
                                        name="requiere_factura"
                                        sx={{
                                            '& .MuiSwitch-switchBase.Mui-checked': { color: redColor },
                                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: redColor },
                                        }}
                                    />
                                }
                                label="Requiere Factura"
                            />
                        </Grid>
                        {formData.requiere_factura && (
                            <>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="NIT del Proveedor"
                                        name="nit_proveedor"
                                        value={formData.nit_proveedor}
                                        onChange={handleChange}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Número de Factura"
                                        name="numero_factura"
                                        value={formData.numero_factura}
                                        onChange={handleChange}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                    />
                                </Grid>
                            </>
                        )}

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Observaciones"
                                name="observaciones"
                                value={formData.observaciones}
                                onChange={handleChange}
                                multiline
                                rows={3}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button onClick={() => { setOpenDialog(false); limpiarFormulario(); }} sx={{ borderRadius: '12px', px: 3 }}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        sx={{
                            background: `linear-gradient(135deg, ${redColor} 0%, #b91c1c 100%)`,
                            fontWeight: 600,
                            borderRadius: '12px',
                            px: 3,
                            boxShadow: `0 4px 12px ${alpha(redColor, 0.3)}`,
                        }}
                    >
                        Registrar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog de detalles */}
            <Dialog
                open={openDetalles}
                onClose={() => setOpenDetalles(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: '24px' } }}
            >
                <DialogTitle
                    sx={{
                        background: `linear-gradient(135deg, ${redColor} 0%, #b91c1c 100%)`,
                        color: '#fff',
                        fontWeight: 700,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderRadius: '24px 24px 0 0',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ReceiptIcon />
                        Detalles del Egreso
                    </Box>
                    <IconButton size="small" onClick={() => setOpenDetalles(false)} sx={{ color: '#fff' }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    {egresoSeleccionado && (
                        <Box>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary">Código de Egreso</Typography>
                                <Typography variant="h6" fontWeight={700}>{egresoSeleccionado.codigo_egreso}</Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary">Tipo de Egreso</Typography>
                                <Typography variant="body1">{egresoSeleccionado.tipo_egreso_nombre}</Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary">Concepto</Typography>
                                <Typography variant="body1">{egresoSeleccionado.concepto}</Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary">Fecha</Typography>
                                <Typography variant="body2">{egresosService.formatearFecha(egresoSeleccionado.fecha_egreso)}</Typography>
                            </Box>

                            {(egresoSeleccionado.beneficiario || egresoSeleccionado.docente_nombres) && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="caption" color="text.secondary">Beneficiario</Typography>
                                    <Typography variant="body2">
                                        {egresoSeleccionado.beneficiario || egresosService.obtenerNombreCompleto(
                                            egresoSeleccionado.docente_nombres || '',
                                            egresoSeleccionado.docente_apellido_paterno,
                                            egresoSeleccionado.docente_apellido_materno
                                        )}
                                    </Typography>
                                </Box>
                            )}

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary">Monto</Typography>
                                <Typography variant="h6" fontWeight={700} color={redColor}>
                                    {egresosService.formatearMonto(egresoSeleccionado.monto_neto)}
                                </Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary">Método de Pago</Typography>
                                <Typography variant="body2">{egresosService.getMetodoPagoLabel(egresoSeleccionado.metodo_pago)}</Typography>
                            </Box>

                            {egresoSeleccionado.numero_comprobante && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="caption" color="text.secondary">Comprobante</Typography>
                                    <Typography variant="body2">{egresoSeleccionado.numero_comprobante}</Typography>
                                </Box>
                            )}

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary">Estado</Typography>
                                <Box sx={{ mt: 1 }}>
                                    <Chip
                                        label={egresosService.getEstadoEgresoLabel(egresoSeleccionado.estado)}
                                        sx={{
                                            fontWeight: 800,
                                            backgroundColor: alpha(getEstadoColor(egresoSeleccionado.estado), 0.15),
                                            color: getEstadoColor(egresoSeleccionado.estado),
                                        }}
                                    />
                                </Box>
                            </Box>

                            {egresoSeleccionado.verificado && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="caption" color="text.secondary">Verificado por</Typography>
                                    <Typography variant="body2">
                                        {egresoSeleccionado.verificado_por_username} - {egresosService.formatearFecha(egresoSeleccionado.fecha_verificacion || '')}
                                    </Typography>
                                </Box>
                            )}

                            {egresoSeleccionado.anulado && (
                                <Alert severity="error" sx={{ mt: 2, borderRadius: '12px' }}>
                                    <Typography variant="body2" fontWeight={600}>Egreso Anulado</Typography>
                                    {egresoSeleccionado.motivo_anulacion && (
                                        <Typography variant="caption">Motivo: {egresoSeleccionado.motivo_anulacion}</Typography>
                                    )}
                                </Alert>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenDetalles(false)} sx={{ borderRadius: '12px', px: 3 }}>
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default RegistroEgresos;