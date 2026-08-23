'use client';
// components/productos/ProductoFormDialog.tsx

import React, { useState, useEffect, useRef } from 'react';
import {
    Dialog, DialogContent, Button, TextField, MenuItem,
    Box, Typography, Stack, InputAdornment,
    alpha, useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/CloseRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import SellRoundedIcon from '@mui/icons-material/SellRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import StyleRoundedIcon from '@mui/icons-material/StyleRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CircularProgress from '@mui/material/CircularProgress';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import type { Producto, ProductoFormData, VarianteFormData, CategoriaProducto } from '@/types/productos';
import { CATEGORIAS_PRODUCTO } from '@/types/productos';

interface ProductoFormDialogProps {
    open: boolean;
    producto: Producto | null; // null = crear, con valor = editar
    onClose: () => void;
    onSubmit: (data: ProductoFormData) => Promise<void>;
}

const varianteVacia = (): VarianteFormData => ({ talla: '', color: '', sku: '', precio: undefined, stock_total: 0 });

// ── pequeño helper visual: eyebrow de sección (ícono + etiqueta + regla) ─────
const SectionLabel: React.FC<{ icon: React.ReactNode; children: React.ReactNode; brand: string; borderField: string }> = ({
    icon, children, brand, borderField,
}) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
        <Box sx={{ display: 'flex', color: alpha(brand, 0.85), '& svg': { fontSize: 15 } }}>{icon}</Box>
        <Typography
            sx={{
                fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.08em',
                textTransform: 'uppercase', color: 'text.secondary', whiteSpace: 'nowrap',
            }}
        >
            {children}
        </Typography>
        <Box sx={{ flex: 1, height: '1px', background: borderField }} />
    </Box>
);

export const ProductoFormDialog: React.FC<ProductoFormDialogProps> = ({ open, producto, onClose, onSubmit }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── tokens ──────────────────────────────────────────────────────────────
    const brand = isDark ? '#facc15' : '#0288d1';
    const brandSoft = isDark ? '#eab308' : '#01579b';
    const brandDim = isDark ? 'rgba(250,204,21,0.12)' : 'rgba(2,136,209,0.10)';
    const brandBorder = isDark ? 'rgba(250,204,21,0.25)' : 'rgba(2,136,209,0.25)';
    const bgModal = isDark ? '#09101dff' : '#ffffff';
    const bgField = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
    const bgFieldAlt = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.015)';
    const borderField = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';
    const R = '14px';

    const fieldSx = {
        '& .MuiOutlinedInput-root': {
            borderRadius: R,
            background: bgField,
            '& fieldset': { borderColor: borderField, borderRadius: R },
            '&:hover fieldset': { borderColor: alpha(brand, 0.5) },
            '&.Mui-focused fieldset': { borderColor: brand, borderWidth: '1.5px', borderRadius: R },
            '&.Mui-focused': { boxShadow: `0 0 0 3px ${alpha(brand, 0.12)}`, borderRadius: R },
            '&.Mui-disabled': { background: bgFieldAlt },
        },
        '& .MuiInputLabel-root': { color: 'text.secondary' },
        '& .MuiInputLabel-root.Mui-focused': { color: brand },
        '& .MuiSelect-select': { borderRadius: `${R} !important` },
        '& .MuiOutlinedInput-notchedOutline': { borderRadius: `${R} !important` },
    };

    const [form, setForm] = useState<ProductoFormData>({
        codigo: '', categoria: 'uniforme', nombre: '', descripcion: '',
        tiene_variantes: false, precio_base: 0, variantes: [varianteVacia()], stock_total: 0,
    });
    const [fotoFile, setFotoFile] = useState<File | null>(null);
    const [fotoPreview, setFotoPreview] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (producto) {
            // Si el producto es "simple" (sin talla/color), su stock vive en
            // la única variante "por defecto" que crea el backend.
            const stockDelProductoSimple = !producto.tiene_variantes
                ? producto.variantes?.[0]?.stock_total ?? 0
                : 0;

            setForm({
                codigo: producto.codigo,
                categoria: producto.categoria,
                nombre: producto.nombre,
                descripcion: producto.descripcion || '',
                tiene_variantes: producto.tiene_variantes,
                precio_base: producto.precio_base,
                nivel_academico_id: producto.nivel_academico_id || undefined,
                variantes: producto.variantes?.length ? producto.variantes.map((v) => ({
                    talla: v.talla, color: v.color, sku: v.sku, precio: v.precio ?? undefined, stock_total: v.stock_total,
                })) : [varianteVacia()],
                stock_total: stockDelProductoSimple,
            });
            setFotoPreview(producto.foto_url || null);
        } else {
            setForm({
                codigo: '', categoria: 'uniforme', nombre: '', descripcion: '',
                tiene_variantes: false, precio_base: 0, variantes: [varianteVacia()], stock_total: 0,
            });
            setFotoPreview(null);
        }
        setFotoFile(null);
        setError(null);
    }, [producto, open]);

    const validarYSetearFoto = (file: File | undefined) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setError('El archivo debe ser una imagen (JPG, PNG, WEBP, etc.)');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('La imagen debe pesar menos de 5MB');
            return;
        }
        setFotoFile(file);
        setFotoPreview(URL.createObjectURL(file));
        setError(null);
    };

    const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => validarYSetearFoto(e.target.files?.[0]);

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);
        validarYSetearFoto(e.dataTransfer.files?.[0]);
    };

    const quitarFoto = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFotoFile(null);
        setFotoPreview(producto?.foto_url || null);
    };

    const handleChangeVariante = (index: number, campo: keyof VarianteFormData, valor: any) => {
        setForm((prev) => ({
            ...prev,
            variantes: prev.variantes?.map((v, i) => (i === index ? { ...v, [campo]: valor } : v)),
        }));
    };

    const agregarVariante = () => {
        setForm((prev) => ({ ...prev, variantes: [...(prev.variantes || []), varianteVacia()] }));
    };

    const quitarVariante = (index: number) => {
        setForm((prev) => ({ ...prev, variantes: prev.variantes?.filter((_, i) => i !== index) }));
    };

    const handleSubmit = async () => {
        setError(null);

        if (!form.codigo.trim() || !form.nombre.trim()) {
            setError('Código y nombre son obligatorios');
            return;
        }
        if (form.precio_base < 0) {
            setError('El precio base no puede ser negativo');
            return;
        }
        if (!form.tiene_variantes && (form.stock_total ?? 0) < 0) {
            setError('El stock no puede ser negativo');
            return;
        }

        setSaving(true);
        try {
            if (fotoFile) {
                const formData = new FormData();
                formData.append('codigo', form.codigo);
                formData.append('categoria', form.categoria);
                formData.append('nombre', form.nombre);
                formData.append('descripcion', form.descripcion || '');
                formData.append('precio_base', String(form.precio_base));
                formData.append('tiene_variantes', String(form.tiene_variantes));
                if (form.nivel_academico_id) formData.append('nivel_academico_id', String(form.nivel_academico_id));
                formData.append('foto', fotoFile);
                if (!form.tiene_variantes) {
                    formData.append('stock_total', String(form.stock_total ?? 0));
                } else if (!producto && form.variantes) {
                    formData.append('variantes', JSON.stringify(form.variantes));
                }
                await onSubmit(formData as any);
            } else {
                const payload: ProductoFormData = { ...form };
                if (producto || form.tiene_variantes) {
                    // Al editar no se reenvían variantes (se manejan aparte);
                    // al crear un producto con variantes tampoco se toca stock_total.
                    delete payload.variantes;
                }
                if (form.tiene_variantes) {
                    delete payload.stock_total;
                }
                if (!producto && form.tiene_variantes) {
                    payload.variantes = form.variantes;
                }
                await onSubmit(payload);
            }
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al guardar el producto');
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        if (saving) return;
        onClose();
    };

    const categoriaLabel = CATEGORIAS_PRODUCTO[form.categoria as keyof typeof CATEGORIAS_PRODUCTO];

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '20px !important',
                    overflow: 'hidden',
                    background: bgModal,
                    border: `1.5px solid ${brandBorder}`,
                    boxShadow: isDark
                        ? `0 0 0 1px rgba(250,204,21,0.06), 0 32px 64px rgba(0,0,0,0.8)`
                        : `0 32px 64px rgba(0,0,0,0.18)`,
                },
            }}
        >
            {/* ── HEADER ── */}
            <Box
                sx={{
                    px: 3, pt: 2.5, pb: 2, position: 'relative', overflow: 'hidden',
                    borderBottom: `1px solid ${borderField}`,
                    background: `linear-gradient(135deg, ${brandDim} 0%, transparent 65%)`,
                }}
            >
                {/* watermark decorativo sutil */}
                <Inventory2RoundedIcon
                    sx={{
                        position: 'absolute', right: -14, top: -18, fontSize: 120,
                        color: brand, opacity: isDark ? 0.05 : 0.06, transform: 'rotate(-12deg)',
                        pointerEvents: 'none',
                    }}
                />
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
                    <Box>
                        <Typography
                            sx={{
                                fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
                                textTransform: 'uppercase', color: alpha(brand, 0.75), mb: 0.4,
                            }}
                        >
                            {producto ? `Editando · ${producto.codigo}` : 'Nuevo ítem de inventario'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                            <Box
                                sx={{
                                    width: 34, height: 34, borderRadius: '9px', flexShrink: 0,
                                    background: alpha(brand, 0.15),
                                    border: `1px solid ${alpha(brand, 0.3)}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                            >
                                <Inventory2RoundedIcon sx={{ color: brand, fontSize: 18 }} />
                            </Box>
                            <Typography sx={{ fontWeight: 800, fontSize: '1.35rem', lineHeight: 1.1, color: 'text.primary' }}>
                                {producto ? 'Editar producto' : 'Nuevo producto'}
                            </Typography>
                        </Box>
                    </Box>

                    <Box
                        onClick={handleClose}
                        sx={{
                            width: 32, height: 32, borderRadius: '9px', cursor: saving ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(255,255,255,0.05)',
                            border: `1px solid ${borderField}`,
                            color: 'text.secondary',
                            opacity: saving ? 0.4 : 1,
                            transition: 'all 0.15s',
                            '&:hover': saving ? {} : { background: alpha(brand, 0.12), borderColor: alpha(brand, 0.4), color: brand },
                        }}
                    >
                        <CloseIcon sx={{ fontSize: 16 }} />
                    </Box>
                </Box>
            </Box>

            {/* ── BODY ── */}
            <DialogContent sx={{ px: 3, py: 2.75 }}>
                <Stack spacing={2.5}>
                    {error && (
                        <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: alpha('#ef4444', 0.1), border: `1px solid ${alpha('#ef4444', 0.25)}`, color: '#ef4444', fontSize: 13, fontWeight: 600 }}>
                            {error}
                        </Box>
                    )}

                    {/* ── Sección: datos generales ── */}
                    <Box>
                        <SectionLabel icon={<SellRoundedIcon />} brand={brand} borderField={borderField}>
                            Información general
                        </SectionLabel>
                        <Stack spacing={1.5} sx={{ mt: 1.25 }}>
                            <Box sx={{ display: 'flex', gap: 1.5 }}>
                                <TextField
                                    label="Código"
                                    value={form.codigo}
                                    onChange={(e) => setForm({ ...form, codigo: e.target.value.toUpperCase() })}
                                    disabled={!!producto}
                                    fullWidth
                                    size="small"
                                    sx={{ maxWidth: 160, ...fieldSx }}
                                />
                                <TextField
                                    select
                                    label="Categoría"
                                    value={form.categoria}
                                    onChange={(e) => setForm({ ...form, categoria: e.target.value as CategoriaProducto })}
                                    fullWidth
                                    size="small"
                                    sx={fieldSx}
                                >
                                    {Object.entries(CATEGORIAS_PRODUCTO).map(([value, label]) => (
                                        <MenuItem key={value} value={value}>{label}</MenuItem>
                                    ))}
                                </TextField>
                            </Box>

                            <TextField
                                label="Nombre"
                                value={form.nombre}
                                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                fullWidth
                                size="small"
                                sx={fieldSx}
                            />

                            <TextField
                                label="Descripción"
                                value={form.descripcion}
                                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                                fullWidth
                                multiline
                                rows={2}
                                size="small"
                                sx={fieldSx}
                            />
                        </Stack>
                    </Box>

                    {/* ── Sección: precio y stock ── */}
                    <Box>
                        <SectionLabel icon={<PaymentsRoundedIcon />} brand={brand} borderField={borderField}>
                            Precio {!form.tiene_variantes ? '& stock' : ''}
                        </SectionLabel>
                        <Box sx={{ display: 'flex', gap: 1.5, mt: 1.25 }}>
                            <TextField
                                label="Precio base"
                                type="number"
                                value={form.precio_base}
                                onChange={(e) => setForm({ ...form, precio_base: parseFloat(e.target.value) || 0 })}
                                InputProps={{ startAdornment: <InputAdornment position="start">Bs</InputAdornment> }}
                                fullWidth
                                size="small"
                                sx={fieldSx}
                            />

                            {/* Stock del producto simple — solo si NO maneja talla/color */}
                            {!form.tiene_variantes && (
                                <TextField
                                    label="Stock"
                                    type="number"
                                    value={form.stock_total ?? 0}
                                    onChange={(e) => setForm({ ...form, stock_total: parseInt(e.target.value) || 0 })}
                                    fullWidth
                                    size="small"
                                    helperText="Cantidad disponible"
                                    sx={fieldSx}
                                />
                            )}
                        </Box>
                    </Box>

                    {/* ── Sección: imagen (dropzone) ── */}
                    <Box>
                        <SectionLabel icon={<ImageRoundedIcon />} brand={brand} borderField={borderField}>
                            Imagen del producto
                        </SectionLabel>
                        <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleFotoChange} />
                        <Box
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                            sx={{
                                mt: 1.25, borderRadius: '16px', cursor: 'pointer',
                                py: fotoPreview ? 2.5 : 4, px: 3,
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                textAlign: 'center', gap: 0.5, position: 'relative',
                                background: dragOver ? alpha(brand, 0.08) : bgFieldAlt,
                                border: `1.5px dashed ${dragOver ? brand : borderField}`,
                                transition: 'all 0.15s',
                                '&:hover': { borderColor: alpha(brand, 0.5), background: alpha(brand, 0.04) },
                            }}
                        >
                            {fotoFile && (
                                <Box
                                    onClick={quitarFoto}
                                    sx={{
                                        position: 'absolute', top: 10, right: 10,
                                        width: 26, height: 26, borderRadius: '8px', flexShrink: 0,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'text.secondary', background: bgField, border: `1px solid ${borderField}`,
                                        '&:hover': { background: alpha('#ef4444', 0.1), borderColor: alpha('#ef4444', 0.3), color: '#ef4444' },
                                    }}
                                >
                                    <CloseIcon sx={{ fontSize: 13 }} />
                                </Box>
                            )}

                            {fotoPreview ? (
                                <Box
                                    component="img"
                                    src={fotoPreview}
                                    alt="Vista previa"
                                    sx={{
                                        width: 84, height: 84, borderRadius: '12px', objectFit: 'cover', mb: 0.75,
                                        border: `1px solid ${borderField}`,
                                    }}
                                />
                            ) : (
                                <Box
                                    sx={{
                                        width: 52, height: 52, borderRadius: '50%', mb: 1,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: alpha(brand, 0.12), border: `1px solid ${alpha(brand, 0.3)}`,
                                    }}
                                >
                                    <ImageRoundedIcon sx={{ color: brand, fontSize: 24 }} />
                                </Box>
                            )}

                            <Typography variant="body2" fontWeight={800}>
                                {fotoFile ? fotoFile.name : fotoPreview ? 'Imagen cargada' : 'Arrastrá tu imagen acá'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5 }}>
                                Admite JPG, PNG o WEBP · máx. 5MB
                            </Typography>

                            <Button
                                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                                size="small"
                                variant="contained"
                                disableElevation
                                sx={{
                                    borderRadius: '10px', px: 2.25, textTransform: 'none', fontWeight: 700,
                                    background: isDark ? 'rgba(255,255,255,0.10)' : '#111827',
                                    color: '#fff',
                                    '&:hover': { background: isDark ? 'rgba(255,255,255,0.16)' : '#000' },
                                }}
                            >
                                {fotoPreview ? 'Cambiar imagen' : 'Elegir archivo'}
                            </Button>
                        </Box>
                    </Box>

                    {/* ── Sección: variantes ── */}
                    <Box>
                        <SectionLabel icon={<StyleRoundedIcon />} brand={brand} borderField={borderField}>
                            Talla y color
                        </SectionLabel>

                        <Box sx={{ display: 'flex', gap: 1.25, mt: 1.25 }}>
                            {/* opción: sin variantes */}
                            <Box
                                onClick={() => !producto && setForm({ ...form, tiene_variantes: false })}
                                sx={{
                                    flex: 1, p: 1.5, borderRadius: '12px', cursor: producto ? 'default' : 'pointer',
                                    background: !form.tiene_variantes ? alpha(brand, 0.1) : bgFieldAlt,
                                    border: `1.5px solid ${!form.tiene_variantes ? brand : borderField}`,
                                    opacity: producto && form.tiene_variantes ? 0.45 : 1,
                                    transition: 'all 0.15s', position: 'relative',
                                }}
                            >
                                {!form.tiene_variantes && (
                                    <CheckRoundedIcon sx={{ position: 'absolute', top: 8, right: 8, fontSize: 15, color: brand }} />
                                )}
                                <Typography variant="body2" fontWeight={700}>Producto único</Typography>
                                <Typography variant="caption" color="text.secondary">Un solo stock general</Typography>
                            </Box>

                            {/* opción: con variantes */}
                            <Box
                                onClick={() => !producto && setForm({ ...form, tiene_variantes: true })}
                                sx={{
                                    flex: 1, p: 1.5, borderRadius: '12px', cursor: producto ? 'default' : 'pointer',
                                    background: form.tiene_variantes ? alpha(brand, 0.1) : bgFieldAlt,
                                    border: `1.5px solid ${form.tiene_variantes ? brand : borderField}`,
                                    opacity: producto && !form.tiene_variantes ? 0.45 : 1,
                                    transition: 'all 0.15s', position: 'relative',
                                }}
                            >
                                {form.tiene_variantes && (
                                    <CheckRoundedIcon sx={{ position: 'absolute', top: 8, right: 8, fontSize: 15, color: brand }} />
                                )}
                                <Typography variant="body2" fontWeight={700}>Con variantes</Typography>
                                <Typography variant="caption" color="text.secondary">Talla, color y stock por variante</Typography>
                            </Box>
                        </Box>

                        {!!producto && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                Este modo no se puede cambiar después de crear el producto.
                            </Typography>
                        )}

                        {form.tiene_variantes && !producto && (
                            <Stack spacing={1.25} sx={{ mt: 1.75 }}>
                                {form.variantes?.map((variante, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            display: 'flex', gap: 1, alignItems: 'center',
                                            p: 1, borderRadius: '12px', background: bgField, border: `1px solid ${borderField}`,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 22, height: 22, borderRadius: '7px', flexShrink: 0,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                background: alpha(brand, 0.12), color: brand,
                                                fontSize: '0.68rem', fontWeight: 800,
                                            }}
                                        >
                                            {index + 1}
                                        </Box>
                                        <TextField
                                            label="Talla"
                                            value={variante.talla || ''}
                                            onChange={(e) => handleChangeVariante(index, 'talla', e.target.value)}
                                            size="small"
                                            sx={{ width: 84, ...fieldSx }}
                                        />
                                        <TextField
                                            label="Color"
                                            value={variante.color || ''}
                                            onChange={(e) => handleChangeVariante(index, 'color', e.target.value)}
                                            size="small"
                                            sx={{ width: 96, ...fieldSx }}
                                        />
                                        <TextField
                                            label="Stock"
                                            type="number"
                                            value={variante.stock_total ?? 0}
                                            onChange={(e) => handleChangeVariante(index, 'stock_total', parseInt(e.target.value) || 0)}
                                            size="small"
                                            sx={{ width: 84, ...fieldSx }}
                                        />
                                        <TextField
                                            label="Precio (opc.)"
                                            type="number"
                                            value={variante.precio ?? ''}
                                            onChange={(e) => handleChangeVariante(index, 'precio', e.target.value ? parseFloat(e.target.value) : undefined)}
                                            size="small"
                                            sx={{ width: 104, ...fieldSx }}
                                        />
                                        <Box
                                            onClick={() => (form.variantes?.length ?? 0) > 1 && quitarVariante(index)}
                                            sx={{
                                                width: 30, height: 30, borderRadius: '9px', flexShrink: 0,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                cursor: (form.variantes?.length ?? 0) <= 1 ? 'not-allowed' : 'pointer',
                                                opacity: (form.variantes?.length ?? 0) <= 1 ? 0.3 : 1,
                                                color: 'text.secondary',
                                                '&:hover': { background: alpha('#ef4444', 0.1), color: '#ef4444' },
                                            }}
                                        >
                                            <DeleteOutlineRoundedIcon fontSize="small" />
                                        </Box>
                                    </Box>
                                ))}

                                <Button
                                    startIcon={<AddRoundedIcon />}
                                    onClick={agregarVariante}
                                    size="small"
                                    sx={{
                                        alignSelf: 'flex-start', borderRadius: '10px', textTransform: 'none', fontWeight: 700,
                                        color: brand, '&:hover': { background: alpha(brand, 0.08) },
                                    }}
                                >
                                    Agregar variante
                                </Button>
                            </Stack>
                        )}

                        {form.tiene_variantes && producto && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                Para agregar variantes a este producto, usá el botón "+ Variante" en su card.
                            </Typography>
                        )}
                    </Box>
                </Stack>
            </DialogContent>

            {/* ── FOOTER ── */}
            <Box sx={{ px: 3, pb: 3, pt: 2, display: 'flex', alignItems: 'center', gap: 1, borderTop: `1px solid ${borderField}` }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                    {form.categoria ? categoriaLabel : ''}
                </Typography>
                <Box sx={{ flex: 1 }} />
                <Button
                    onClick={handleClose}
                    disabled={saving}
                    sx={{ borderRadius: '10px', color: 'text.secondary', px: 2, textTransform: 'none', fontWeight: 600, '&:hover': { background: 'rgba(255,255,255,0.05)' } }}
                >
                    Cancelar
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={saving}
                    startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveRoundedIcon />}
                    sx={{
                        borderRadius: '10px', px: 3, fontWeight: 700, textTransform: 'none',
                        background: brand, color: isDark ? '#000' : '#fff',
                        boxShadow: `0 4px 16px ${alpha(brand, 0.4)}`,
                        '&:hover': { background: brandSoft, boxShadow: `0 6px 20px ${alpha(brand, 0.5)}` },
                        '&.Mui-disabled': { opacity: 0.5, background: brand, color: isDark ? '#000' : '#fff' },
                    }}
                >
                    {saving ? 'Guardando...' : producto ? 'Guardar cambios' : 'Crear producto'}
                </Button>
            </Box>
        </Dialog>
    );
};