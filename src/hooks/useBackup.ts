// hooks/useBackup.ts
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { backupService } from '@/services/backupService';
import { Backup } from '@/types/backupTypes';

export const useBackups = () => {
  const [backups, setBackups]           = useState<Backup[]>([]);
  const [isLoading, setIsLoading]       = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Cargar lista desde PostgreSQL ──
  const cargar = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await backupService.listar();
      setBackups(res.data.backups);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cargar los backups');
      setBackups([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  // ── Generar nuevo backup → Cloudinary → BD ──
  const generar = useCallback(async (): Promise<boolean> => {
    setIsGenerating(true);
    try {
      const res = await backupService.generar();
      toast.success(`Backup generado: ${res.data.backup.filename}`);
      await cargar();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al generar el backup');
      return false;
    } finally {
      setIsGenerating(false);
    }
  }, [cargar]);

  // ── Descargar — usa cloudinary_url del objeto backup directamente ──
  // No pasa por el backend → evita problemas de NEXT_PUBLIC_API_URL vacío
  const descargar = useCallback((backup_key: string) => {
    const backup = backups.find(b => b.backup_key === backup_key);
    if (!backup?.cloudinary_url) {
      toast.error('No se encontró la URL de descarga');
      return;
    }
    window.open(backup.cloudinary_url, '_blank');
    toast.success('Descarga iniciada');
  }, [backups]);

  // ── Restaurar BD desde Cloudinary ──
  const restaurar = useCallback(async (backup_key: string): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      await backupService.restaurar(backup_key);
      toast.success('Base de datos restaurada exitosamente');
      await cargar();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al restaurar el backup');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [cargar]);

  // ── Eliminar de Cloudinary + soft delete en BD ──
  const eliminar = useCallback(async (backup_key: string): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      await backupService.eliminar(backup_key);
      toast.success('Backup eliminado correctamente');
      setBackups(prev => prev.filter(b => b.backup_key !== backup_key));
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar el backup');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // ── Estadísticas derivadas ──
  const stats = {
    total:        backups.length,
    disponibles:  backups.filter(b => b.status === 'completado').length,
    ultimoBackup: backups[0]?.created_at ?? null,
    espacioFormateado: (() => {
      const bytes = backups.reduce((acc, b) => acc + (b.size_bytes || 0), 0);
      if (bytes === 0)           return '—';
      if (bytes < 1024 * 1024)   return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    })(),
  };

  return {
    backups,
    stats,
    isLoading,
    isGenerating,
    isSubmitting,
    generar,
    descargar,
    restaurar,
    eliminar,
    refrescar: cargar,
  };
};