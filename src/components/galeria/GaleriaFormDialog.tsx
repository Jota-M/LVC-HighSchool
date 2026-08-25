'use client';
// components/galeria/GaleriaFormDialog.tsx

import React, { useState, useEffect, useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    IconButton,
    CircularProgress,
    Stack,
    Switch,
    FormControlLabel,
    Alert,
    alpha,
    useTheme,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import AddPhotoAlternateRoundedIcon from '@mui/icons-material/AddPhotoAlternateRounded';
import type { FotoGaleria, CrearFotoDTO, ActualizarFotoDTO } from '@/types/galeriaTypes';

interface GaleriaFormDialogProps {
    open: boolean;
    foto: FotoGaleria | null;
    onClose: () => void;
    onSubmit: (data: CrearFotoDTO | ActualizarFotoDTO) => Promise<void>;
}

export const GaleriaFormDialog: React.FC<GaleriaFormDialogProps> = ({
    open,
    foto,
    onClose,
    onSubmit,
}) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const brand = isDark ? '#facc15' : '#0288d1';
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isEditing = Boolean(foto);

    const [titulo, setTitulo] = useState('');
    const [orden, setOrden] = useState<number>(0);
    const [fechaInicio, setFechaInicio] = useState<string>('');
    const [fechaFin, setFechaFin] = useState<string>('');
    const [activo, setActivo] = useState(true);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        if (foto) {
            setTitulo(foto.titulo || '');
            setOrden(foto.orden ?? 0);
            setFechaInicio(foto.fecha_inicio ? foto.fecha_inicio.substring(0, 10) : '');
            setFechaFin(foto.fecha_fin ? foto.fecha_fin.substring(0, 10) : '');
            setActivo(foto.activo ?? true);
            setPreviewUrl(foto.imagen_url || null);
            setSelectedFile(null);
        } else {
            setTitulo('');
            setOrden(0);
            setFechaInicio('');
            setFechaFin('');
            setActivo(true);
            setSelectedFile(null);
            setPreviewUrl(null);
        }
        setErrorMsg(null);
    }, [foto, open]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setErrorMsg('El archivo seleccionado debe ser una imagen (JPG, PNG, WebP, etc.).');
                return;
            }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setErrorMsg(null);
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        if (isEditing && foto?.imagen_url) {
            setPreviewUrl(foto.imagen_url);
        } else {
            setPreviewUrl(null);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);

        if (!titulo.trim()) {
            setErrorMsg('Por favor ingrese un título descriptivo para la foto.');
            return;
        }

        if (!isEditing && !selectedFile) {
            setErrorMsg('Debe seleccionar una imagen para la galería.');
            return;
        }

        if (fechaInicio && fechaFin && fechaInicio > fechaFin) {
            setErrorMsg('La fecha de inicio no puede ser posterior a la fecha de fin.');
            return;
        }

        try {
            setSubmitting(true);

            if (isEditing) {
                const payload: ActualizarFotoDTO = {
                    titulo: titulo.trim(),
                    orden: Number(orden) || 0,
                    fecha_inicio: fechaInicio || null,
                    fecha_fin: fechaFin || null,
                    activo,
                };
                if (selectedFile) {
                    payload.foto = selectedFile;
                }
                await onSubmit(payload);
            } else {
                const payload: CrearFotoDTO = {
                    titulo: titulo.trim(),
                    foto: selectedFile!,
                    orden: Number(orden) || 0,
                    fecha_inicio: fechaInicio || null,
                    fecha_fin: fechaFin || null,
                };
                await onSubmit(payload);
            }
            onClose();
        } catch (err: any) {
            setErrorMsg(err.response?.data?.message || err.message || 'Error al guardar la imagen.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={submitting ? undefined : onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '24px',
                    bgcolor: isDark ? '#0a1128' : '#ffffff',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
                },
            }}
        >
            <DialogTitle
                sx={{
                    p: 3,
                    pb: 1.5,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: alpha(brand, 0.15),
                            color: brand,
                        }}
                    >
                        <AddPhotoAlternateRoundedIcon />
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight={800}>
                            {isEditing ? 'Editar Foto de Galería' : 'Nueva Foto de Galería'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {isEditing
                                ? 'Modifica los datos o reemplaza la imagen del banner'
                                : 'Sube una fotografía o banner para el carrusel institucional'}
                        </Typography>
                    </Box>
                </Box>

                <IconButton onClick={onClose} disabled={submitting} size="small">
                    <CloseRoundedIcon />
                </IconButton>
            </DialogTitle>

            <form onSubmit={handleSubmit}>
                <DialogContent sx={{ p: 3, pt: 1.5 }}>
                    {errorMsg && (
                        <Alert severity="error" sx={{ mb: 2.5, borderRadius: '12px' }}>
                            {errorMsg}
                        </Alert>
                    )}

                    <Stack spacing={2.5}>
                        {/* Selector / Previsualización de Imagen */}
                        <Box>
                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                                Imagen del Banner / Fotografía {!isEditing && '*'}
                            </Typography>

                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                            />

                            {previewUrl ? (
                                <Box
                                    sx={{
                                        position: 'relative',
                                        width: '100%',
                                        paddingTop: '50%',
                                        borderRadius: '16px',
                                        overflow: 'hidden',
                                        border: `2px solid ${alpha(brand, 0.3)}`,
                                        bgcolor: '#000',
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src={previewUrl}
                                        alt="Preview"
                                        sx={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                        }}
                                    />
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: 10,
                                            right: 10,
                                            display: 'flex',
                                            gap: 1,
                                        }}
                                    >
                                        <Button
                                            size="small"
                                            variant="contained"
                                            onClick={() => fileInputRef.current?.click()}
                                            sx={{
                                                bgcolor: 'rgba(0,0,0,0.7)',
                                                backdropFilter: 'blur(8px)',
                                                fontSize: '0.75rem',
                                                '&:hover': { bgcolor: 'rgba(0,0,0,0.9)' },
                                            }}
                                        >
                                            Cambiar
                                        </Button>
                                        {selectedFile && (
                                            <IconButton
                                                size="small"
                                                onClick={handleRemoveFile}
                                                sx={{
                                                    bgcolor: 'rgba(239, 68, 68, 0.8)',
                                                    color: '#fff',
                                                    '&:hover': { bgcolor: '#ef4444' },
                                                }}
                                            >
                                                <DeleteOutlineRoundedIcon fontSize="small" />
                                            </IconButton>
                                        )}
                                    </Box>
                                </Box>
                            ) : (
                                <Box
                                    onClick={() => fileInputRef.current?.click()}
                                    sx={{
                                        border: `2px dashed ${alpha(theme.palette.divider, 0.3)}`,
                                        borderRadius: '16px',
                                        p: 4,
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.01),
                                        '&:hover': {
                                            borderColor: brand,
                                            bgcolor: alpha(brand, 0.05),
                                        },
                                    }}
                                >
                                    <CloudUploadRoundedIcon sx={{ fontSize: 44, color: brand, mb: 1 }} />
                                    <Typography variant="body2" fontWeight={700}>
                                        Haz clic aquí para seleccionar o arrastrar una imagen
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Formatos recomendados: JPG, PNG, WebP (Proporción sugerida: 16:9 o horizontal)
                                    </Typography>
                                </Box>
                            )}
                        </Box>

                        {/* Título */}
                        <TextField
                            label="Título / Descripción corta"
                            placeholder="Ej. Ceremonia de Graduación 2026"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            fullWidth
                            required
                            size="small"
                            variant="outlined"
                            slotProps={{
                                inputLabel: { shrink: true }
                            }}
                        />

                        {/* Orden y Switch de Activo */}
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                            <TextField
                                label="Orden de visualización"
                                type="number"
                                value={orden}
                                onChange={(e) => setOrden(parseInt(e.target.value) || 0)}
                                size="small"
                                sx={{ width: { xs: '100%', sm: 160 } }}
                                helperText="Menor número aparece primero"
                                slotProps={{
                                    inputLabel: { shrink: true }
                                }}
                            />

                            {isEditing && (
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={activo}
                                            onChange={(e) => setActivo(e.target.checked)}
                                            color="success"
                                        />
                                    }
                                    label={
                                        <Typography variant="body2" fontWeight={600}>
                                            {activo ? 'Foto Activa (Publicada)' : 'Foto Inactiva (Oculta)'}
                                        </Typography>
                                    }
                                    sx={{ mt: { xs: 1, sm: 0 } }}
                                />
                            )}
                        </Stack>

                        {/* Rango de Vigencia de Fechas */}
                        <Box>
                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                                Programación de Vigencia (Opcional)
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                                Si se dejan en blanco, la foto estará vigente permanentemente mientras esté activa.
                            </Typography>

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <TextField
                                    label="Fecha de Inicio"
                                    type="date"
                                    value={fechaInicio}
                                    onChange={(e) => setFechaInicio(e.target.value)}
                                    size="small"
                                    fullWidth
                                    slotProps={{
                                        inputLabel: { shrink: true }
                                    }}
                                />
                                <TextField
                                    label="Fecha de Fin"
                                    type="date"
                                    value={fechaFin}
                                    onChange={(e) => setFechaFin(e.target.value)}
                                    size="small"
                                    fullWidth
                                    slotProps={{
                                        inputLabel: { shrink: true }
                                    }}
                                />
                            </Stack>
                        </Box>
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button onClick={onClose} disabled={submitting} sx={{ borderRadius: '12px', textTransform: 'none' }}>
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={submitting}
                        startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : null}
                        sx={{
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 700,
                            px: 3,
                            background: isDark
                                ? 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)'
                                : 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
                            color: isDark ? '#000' : '#fff',
                        }}
                    >
                        {submitting ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Subir a Galería'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default GaleriaFormDialog;
