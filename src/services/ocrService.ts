// services/ocrService.ts
import axios from 'axios';
import api from '@/lib/api';

export interface CIData {
  ci: string;
  complemento: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  fecha_nacimiento: string; // DD/MM/YYYY
  lugar_nacimiento: string;
  genero?: '' | 'masculino' | 'femenino' | 'otro';
  estado_civil?: string;
  ocupacion?: string;
  direccion: string;
  zona?: string;
  ciudad?: string;
  padre_nombres: string;
  padre_ci: string;
  madre_nombres: string;
  madre_ci: string;
  confianza: 'alta' | 'media' | 'baja';
}

export interface OCRResult {
  success: boolean;
  datos?: CIData;
  message?: string;
  /** local = Tesseract (gratis), gemini = API con tokens */
  fuente?: 'local' | 'gemini';
}

export const ocrService = {
  /**
   * Envía una imagen de cédula al backend y retorna los datos extraídos.
   * @param imagen - El archivo de imagen de la cédula
   */
  async escanearCedula(imagen: File): Promise<OCRResult> {
    const formData = new FormData();
    formData.append('imagen', imagen);

    try {
      const response = await api.post<OCRResult>('/ocr/cedula', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // Tesseract local puede tardar (1ª vez descarga idioma)
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data && typeof error.response.data === 'object') {
        return error.response.data as OCRResult;
      }
      throw error;
    }
  },
};
