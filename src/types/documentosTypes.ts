// types/documentosTypes.ts

export interface Documento {
  id: number;
  matricula_id: number;
  tipo_documento: string;
  nombre_archivo: string;
  url_archivo: string;
  verificado: boolean;
  verificado_por?: number;
  fecha_verificacion?: string;
  observaciones?: string;
  created_at: string;
  updated_at?: string;
}

export interface DocumentoUpload {
  tipo_documento: string;
  archivo: File;
}

export interface DocumentoVerificar {
  verificado: boolean;
  observaciones?: string;
}

export interface DocumentosResponse {
  success: boolean;
  data: {
    documentos: Documento[];
  };
  message?: string;
}

export interface DocumentoResponse {
  success: boolean;
  data: {
    documento: Documento;
  };
  message?: string;
}

export const TIPOS_DOCUMENTO = {
  certificado_nacimiento: 'Certificado de Nacimiento',
  ci_estudiante: 'CI del Estudiante',
  ci_tutor: 'CI del Tutor',
  libreta_familiar: 'Libreta Familiar',
  certificado_medico: 'Certificado Médico',
  boletin_anterior: 'Boletín del Año Anterior',
  comprobante_pago: 'Comprobante de Pago',
  otro: 'Otro Documento',
} as const;

export type TipoDocumento = keyof typeof TIPOS_DOCUMENTO;