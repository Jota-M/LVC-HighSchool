// types/backupTypes.ts

export type BackupStatus = 'completado' | 'fallido' | 'en_progreso';

// ── Entidad principal (refleja backup_registro) ───────────────────────────────
export interface Backup {
  id:                     number;
  backup_key:             string;   // bkp_1715123456_abc12 — se usa como identificador en URLs
  filename:               string;
  database_name:          string;
  cloudinary_url:         string;
  cloudinary_public_id:   string;
  size_bytes:             number;
  size_formatted:         string;
  status:                 BackupStatus;
  ultima_restauracion_at: string | null;
  restaurado_por:         number | null;
  restaurado_por_username: string | null;
  creado_por:             number;
  creado_por_username:    string | null;
  created_at:             string;
  updated_at:             string;
  deleted_at:             string | null;
  eliminado_por:          number | null;
}

// ── Respuestas de la API ──────────────────────────────────────────────────────
export interface BackupsListResponse {
  success: boolean;
  data: { backups: Backup[] };
}

export interface BackupResponse {
  success: boolean;
  message: string;
  data: { backup: Backup };
}

export interface BackupDeleteResponse {
  success: boolean;
  message: string;
}

// ── Constantes UI ─────────────────────────────────────────────────────────────
export const BACKUP_STATUS_CONFIG: {
  value:   BackupStatus;
  label:   string;
  color:   string;
  bgColor: string;
}[] = [
  { value: 'completado',  label: 'Completado',  color: '#16a34a', bgColor: '#dcfce7' },
  { value: 'fallido',     label: 'Fallido',     color: '#dc2626', bgColor: '#fee2e2' },
  { value: 'en_progreso', label: 'En progreso', color: '#d97706', bgColor: '#fef3c7' },
];