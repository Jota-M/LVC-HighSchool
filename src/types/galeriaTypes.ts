// types/galeriaTypes.ts

export interface FotoGaleria {
    id: number;
    titulo: string;
    imagen_url: string;
    cloudinary_public_id?: string;
    orden: number;
    fecha_inicio: string | null;
    fecha_fin: string | null;
    activo: boolean;
    creado_por?: number;
    creado_por_username?: string;
    creado_en?: string;
    actualizado_en?: string;
}

export interface FiltrosGaleria {
    activo?: boolean;
    vigente?: boolean;
    page?: number;
    limit?: number;
    search?: string;
}

export interface GaleriaListResponse {
    success: boolean;
    data: {
        fotos: FotoGaleria[];
        total: number;
        page: number;
        limit: number;
        total_paginas: number;
    };
    message?: string;
}

export interface GaleriaVigentesResponse {
    success: boolean;
    data: {
        fotos: FotoGaleria[];
    };
    message?: string;
}

export interface GaleriaDetailResponse {
    success: boolean;
    data: {
        foto: FotoGaleria;
    };
    message?: string;
}

export interface CrearFotoDTO {
    titulo: string;
    foto: File;
    orden?: number;
    fecha_inicio?: string | null;
    fecha_fin?: string | null;
}

export interface ActualizarFotoDTO {
    titulo?: string;
    foto?: File;
    orden?: number;
    fecha_inicio?: string | null;
    fecha_fin?: string | null;
    activo?: boolean;
}
