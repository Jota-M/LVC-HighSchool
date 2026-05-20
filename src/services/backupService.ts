// services/backupService.ts
import api from '@/lib/api';
import {
  BackupsListResponse,
  BackupResponse,
  BackupDeleteResponse,
} from '@/types/backupTypes';

// La descarga ya no pasa por el backend.
// El hook useBackups.descargar() usa backup.cloudinary_url directamente.

export const backupService = {

  async listar(): Promise<BackupsListResponse> {
    const response = await api.get('/backups');
    return response.data;
  },

  async obtenerPorKey(backup_key: string): Promise<BackupResponse> {
    const response = await api.get(`/backups/${backup_key}`);
    return response.data;
  },

  async generar(): Promise<BackupResponse> {
    const response = await api.post('/backups/generar');
    return response.data;
  },

  async restaurar(backup_key: string): Promise<BackupResponse> {
    const response = await api.post(`/backups/${backup_key}/restaurar`, { confirmar: true });
    return response.data;
  },

  async eliminar(backup_key: string): Promise<BackupDeleteResponse> {
    const response = await api.delete(`/backups/${backup_key}`);
    return response.data;
  },
};

export default backupService;