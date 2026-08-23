'use client';
// components/productos/AgregarVarianteDialog.tsx

import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
    Box, Typography, IconButton, Stack, InputAdornment, alpha, useTheme,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import type { Producto, VarianteFormData } from '@/types/productos';

interface AgregarVarianteDialogProps {
    open: boolean;
    producto: Producto | null;
    onClose: () => void;
    onSubmit: (productoId: number, data: VarianteFormData) => Promise<void>;
}

const VARIANTE_VACIA: VarianteFormData = { talla: '', color: '', sku: '', precio: undefined, stock_total: 0 };

export const AgregarVarianteDialog: React.FC<AgregarVarianteDialogProps> = ({ open, producto, onClose, onSubmit }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const brand = isDark ? '#facc15' : '#0288d1';

    const [form, setForm] = useState<VarianteFormData>(VARIANTE_VACIA);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Resetea el formulario cada vez que se abre para un producto distinto
    React.useEffect(() => {
        if (open) {
            setForm(VARIANTE_VACIA);
            setError(null);
        }
    }, [open, producto?.id]);

    const handleSubmit = async () => {
        if (!producto) return;
        setError(null);

        if (!form.talla?.trim() && !form.color?.trim()) {
            setError('Indicá al menos talla o color para identificar la variante');
            return;
        }
        if ((form.stock_total ?? 0) < 0) {
            setError('El stock no puede ser negativo');
            return;
        }

        setSaving(true);
        try {
            await onSubmit(producto.id, form);
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al agregar la variante');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="xs" fullWidth
            PaperProps={{ sx: { borderRadius: '20px' } }}>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                    <Typography variant="h6" fontWeight={800}>Agregar variante</Typography>
                    {producto && (
                        <Typography variant="caption" color="text.secondary">
                            {producto.nombre} · {producto.codigo}
                        </Typography>
                    )}
                </Box>
                <IconButton onClick={onClose} size="small" disabled={saving}>
                    <CloseRoundedIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    {error && (
                        <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: alpha('#ef4444', 0.1), color: '#ef4444', fontSize: 13 }}>
                            {error}
                        </Box>
                    )}

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            label="Talla"
                            value={form.talla || ''}
                            onChange={(e) => setForm({ ...form, talla: e.target.value })}
                            fullWidth
                            size="small"
                            autoFocus
                        />
                        <TextField
                            label="Color"
                            value={form.color || ''}
                            onChange={(e) => setForm({ ...form, color: e.target.value })}
                            fullWidth
                            size="small"
                        />
                    </Box>

                    <TextField
                        label="SKU (opcional)"
                        value={form.sku || ''}
                        onChange={(e) => setForm({ ...form, sku: e.target.value })}
                        fullWidth
                        size="small"
                    />

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            label="Stock inicial"
                            type="number"
                            value={form.stock_total ?? 0}
                            onChange={(e) => setForm({ ...form, stock_total: parseInt(e.target.value) || 0 })}
                            fullWidth
                            size="small"
                        />
                        <TextField
                            label="Precio (opcional)"
                            type="number"
                            value={form.precio ?? ''}
                            onChange={(e) => setForm({ ...form, precio: e.target.value ? parseFloat(e.target.value) : undefined })}
                            InputProps={{ startAdornment: <InputAdornment position="start">Bs</InputAdornment> }}
                            fullWidth
                            size="small"
                        />
                    </Box>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2.5 }}>
                <Button onClick={onClose} disabled={saving}>Cancelar</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={saving}
                    sx={{ bgcolor: brand, '&:hover': { bgcolor: brand, opacity: 0.9 } }}
                >
                    {saving ? 'Guardando...' : 'Agregar variante'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AgregarVarianteDialog;