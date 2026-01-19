// hooks/usePreinscripcion.ts
'use client';
import { useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import type {
  PreEstudianteForm,
  PreTutorForm,
  PreInscripcionFormData,
  ErroresFormulario,
  ModoRegistro,
} from '@/types/preinscripcionTypes';
import { preinscripcionService } from '@/services/preinscripcionService';

// =============================================
// 🆕 NUEVO: Interfaz para datos de preinscripción
// =============================================
export interface PreInscripcionInfo {
  periodo_academico_id: number | null;
  grado_id: number | null;
  turno_id: number | null;
}

// =============================================
// ESTADOS INICIALES
// =============================================
const estadoInicialEstudiante = (): PreEstudianteForm => ({
  nombres: '',
  apellido_paterno: '',
  apellido_materno: '',
  ci: '',
  rude: '',
  fecha_nacimiento: null,
  lugar_nacimiento: '',
  genero: '',
  direccion: '',
  zona: '',
  ciudad: '',
  telefono: '',
  email: '',
  contacto_emergencia: '',
  tiene_discapacidad: false,
  tipo_discapacidad: '',
  institucion_procedencia: '',
  ultimo_grado_cursado: '',
  grado_solicitado: '',     // ✅ Texto (ej: "PRE-K")
  repite_grado: false,
  turno_solicitado: '',     // ✅ Texto (ej: "TARDE")
});

const estadoInicialTutor = (): PreTutorForm => ({
  otro_parentesco: '',
  tipo_representante: '',
  nombres: '',
  apellido_paterno: '',
  apellido_materno: '',
  ci: '',
  fecha_nacimiento: null,
  genero: '',
  parentesco: 'padre',
  telefono: '',
  celular: '',
  email: '',
  direccion: '',
  ocupacion: '',
  lugar_trabajo: '',
  telefono_trabajo: '',
  estado_civil: '',
  nivel_educacion: '',
  vive_con_estudiante: true,
  es_tutor_principal: true,
});

const estadoInicialDocumentos = () => ({
  foto_estudiante: null,
  cedula_estudiante: null,
  certificado_nacimiento: null,
  libreta_notas: null,
});

// 🆕 Estado inicial para preinscripcion_info
const estadoInicialPreInscripcionInfo = (): PreInscripcionInfo => ({
  periodo_academico_id: null,
  grado_id: null,
  turno_id: null,
});

export function usePreinscripcion() {
  // =============================================
  // ESTADOS PARA MODO MÚLTIPLE
  // =============================================
  const [etapa, setEtapa] = useState<'seleccion_modo' | 'formulario'>('seleccion_modo');
  const [modo, setModo] = useState<ModoRegistro>('nuevo');
  const [padreExistente, setPadreExistente] = useState<any>(null);
  
  const [estudiantes, setEstudiantes] = useState<PreEstudianteForm[]>([estadoInicialEstudiante()]);
  const [estudianteActivo, setEstudianteActivo] = useState(0);
  
  const [documentosEstudiantes, setDocumentosEstudiantes] = useState<{
    [key: number]: {
      foto_estudiante: File | null;
      cedula_estudiante: File | null;
      certificado_nacimiento: File | null;
      libreta_notas: File | null;
    };
  }>({
    0: estadoInicialDocumentos(),
  });

  // 🆕 Estado para IDs de preinscripción
  const [preinscripcionInfo, setPreinscripcionInfo] = useState<PreInscripcionInfo>(
    estadoInicialPreInscripcionInfo()
  );

  // =============================================
  // ESTADOS ORIGINALES
  // =============================================
  const [activeStep, setActiveStep] = useState(0);
  const [errors, setErrors] = useState<ErroresFormulario>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [representante, setRepresentante] = useState<PreTutorForm>(estadoInicialTutor());
  const [documentosRepresentante, setDocumentosRepresentante] = useState<{
    cedula_representante: File | null;
  }>({ cedula_representante: null });

  // =============================================
  // HANDLERS DE MODO
  // =============================================
  const handleModoSeleccionado = (data: { modo: string; padre: any }) => {
    setModo(data.modo as ModoRegistro);
    setPadreExistente(data.padre);

    if (data.padre) {
      setRepresentante({
        ...estadoInicialTutor(),
        nombres: data.padre.nombres,
        apellido_paterno: data.padre.apellido_paterno,
        apellido_materno: data.padre.apellido_materno || '',
        ci: data.padre.ci,
        telefono: data.padre.telefono,
        celular: data.padre.celular || '',
        email: data.padre.email || '',
        direccion: data.padre.direccion || '',
        ocupacion: data.padre.ocupacion || '',
        lugar_trabajo: data.padre.lugar_trabajo || '',
      });
    }

    if (data.modo === 'multiple') {
      setEstudiantes([estadoInicialEstudiante(), estadoInicialEstudiante()]);
      setDocumentosEstudiantes({
        0: estadoInicialDocumentos(),
        1: estadoInicialDocumentos(),
      });
    }

    setEtapa('formulario');
  };

  const volverSeleccionModo = () => {
    setEtapa('seleccion_modo');
    setActiveStep(0);
    setEstudiantes([estadoInicialEstudiante()]);
    setRepresentante(estadoInicialTutor());
    setDocumentosEstudiantes({ 0: estadoInicialDocumentos() });
    setDocumentosRepresentante({ cedula_representante: null });
    setPreinscripcionInfo(estadoInicialPreInscripcionInfo()); // 🆕 Limpiar
    setErrors({});
  };

  // =============================================
  // HANDLERS DE MÚLTIPLES ESTUDIANTES
  // =============================================
  const agregarEstudiante = () => {
    if (estudiantes.length >= 5) {
      alert('Máximo 5 estudiantes por preinscripción');
      return;
    }
    const nuevoIndex = estudiantes.length;
    setEstudiantes([...estudiantes, estadoInicialEstudiante()]);
    setDocumentosEstudiantes({
      ...documentosEstudiantes,
      [nuevoIndex]: estadoInicialDocumentos(),
    });
  };

  const eliminarEstudiante = (index: number) => {
    if (estudiantes.length === 1) {
      alert('Debe haber al menos un estudiante');
      return;
    }
    const nuevosEstudiantes = estudiantes.filter((_, i) => i !== index);
    setEstudiantes(nuevosEstudiantes);

    const nuevosDocumentos = { ...documentosEstudiantes };
    delete nuevosDocumentos[index];
    setDocumentosEstudiantes(nuevosDocumentos);

    if (estudianteActivo >= nuevosEstudiantes.length) {
      setEstudianteActivo(nuevosEstudiantes.length - 1);
    }
  };

  // =============================================
  // HANDLERS DE CAMBIO
  // =============================================
  const updateEstudiante = (field: string, value: any) => {
    const nuevosEstudiantes = [...estudiantes];
    nuevosEstudiantes[estudianteActivo] = {
      ...nuevosEstudiantes[estudianteActivo],
      [field]: value,
    };
    setEstudiantes(nuevosEstudiantes);
  };

  const updateRepresentante = (field: string, value: any) => {
    setRepresentante({ ...representante, [field]: value });
  };

  const updateDocumento = (field: string, file: File | null) => {
    if (field === 'cedula_representante') {
      setDocumentosRepresentante({ cedula_representante: file });
    } else {
      setDocumentosEstudiantes({
        ...documentosEstudiantes,
        [estudianteActivo]: {
          ...documentosEstudiantes[estudianteActivo],
          [field]: file,
        },
      });
    }
  };

  // 🆕 Handler para actualizar preinscripcion_info
  const updatePreinscripcionInfo = (field: keyof PreInscripcionInfo, value: number | null) => {
    setPreinscripcionInfo(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // =============================================
  // VALIDACIONES
  // =============================================
  const validarPaso = (paso: number): boolean => {
    const nuevosErrores: ErroresFormulario = {};
    const estudianteActual = estudiantes[estudianteActivo];

    if (paso === 0) {
      // Validaciones existentes
      if (!estudianteActual.nombres) nuevosErrores.nombres = 'Campo requerido';
      if (!estudianteActual.apellido_paterno) nuevosErrores.apellido_paterno = 'Campo requerido';
      if (!estudianteActual.fecha_nacimiento) nuevosErrores.fecha_nacimiento = 'Campo requerido';
      if (!estudianteActual.genero) nuevosErrores.genero = 'Campo requerido';
      if (!estudianteActual.grado_solicitado) nuevosErrores.grado_solicitado = 'Campo requerido';
      if (!estudianteActual.turno_solicitado) nuevosErrores.turno_solicitado = 'Campo requerido';

      // 🆕 Validar que se hayan seleccionado los IDs
      if (!preinscripcionInfo.periodo_academico_id) {
        nuevosErrores.periodo_academico = 'Debe seleccionar un periodo académico';
      }
      if (!preinscripcionInfo.grado_id) {
        nuevosErrores.grado = 'Debe seleccionar el ID del grado';
      }
      if (!preinscripcionInfo.turno_id) {
        nuevosErrores.turno = 'Debe seleccionar el ID del turno';
      }
    }

    if (paso === 1 && modo !== 'padre_existente') {
      if (!representante.nombres) nuevosErrores.nombres_rep = 'Campo requerido';
      if (!representante.apellido_paterno) nuevosErrores.apellido_paterno_rep = 'Campo requerido';
      if (!representante.ci) nuevosErrores.ci_rep = 'Campo requerido';
      if (!representante.telefono) nuevosErrores.telefono_rep = 'Campo requerido';
    }

    // if (paso === 2) {
    //   const docs = documentosEstudiantes[estudianteActivo];
    //   if (!docs.cedula_estudiante) nuevosErrores.cedula_estudiante = 'Documento requerido';
    //   if (!docs.certificado_nacimiento) nuevosErrores.certificado_nacimiento = 'Documento requerido';
    //   if (!docs.libreta_notas) nuevosErrores.libreta_notas = 'Documento requerido';

    //   if (modo !== 'padre_existente' && !documentosRepresentante.cedula_representante) {
    //     nuevosErrores.cedula_representante = 'Documento requerido';
    //   }
    // }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // =============================================
  // NAVEGACIÓN
  // =============================================
  const handleNext = () => {
    if (validarPaso(activeStep)) {
      setActiveStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // =============================================
  // ENVÍO (✅ ACTUALIZADO CON preinscripcion_info)
  // =============================================
  const handleSubmit = async () => {
  if (!validarPaso(activeStep)) return;

  // Validar IDs
  if (!preinscripcionInfo.periodo_academico_id || 
      !preinscripcionInfo.grado_id || 
      !preinscripcionInfo.turno_id) {
    alert('Error: Faltan datos de período académico, grado o turno.');
    return;
  }

  setIsSubmitting(true);

  try {
    // ✅ MODO SIMPLE: Usar FormData en lugar de preinscripcionService.crear
    if (modo === 'nuevo' && estudiantes.length === 1) {
      const estudianteData = {
        ...estudiantes[0],
        rude: estudiantes[0].rude || '',
        fecha_nacimiento: estudiantes[0].fecha_nacimiento
          ? estudiantes[0].fecha_nacimiento.format('YYYY-MM-DD')
          : '',
      };

      const representanteData = {
        ...representante,
        fecha_nacimiento: representante.fecha_nacimiento
          ? representante.fecha_nacimiento.format('YYYY-MM-DD')
          : null,
      };

      const docs = documentosEstudiantes[0];
      
      // ✅ CREAR FormData (igual que en modo múltiple)
      const formData = new FormData();
      
      // Agregar datos como JSON strings
      formData.append('estudiante', JSON.stringify(estudianteData));
      formData.append('representante', JSON.stringify(representanteData));
      formData.append('preinscripcion_info', JSON.stringify({
        periodo_academico_id: preinscripcionInfo.periodo_academico_id,
        grado_id: preinscripcionInfo.grado_id,
        turno_id: preinscripcionInfo.turno_id,
      }));
      
      // ✅ Agregar archivos del estudiante
      if (docs.foto_estudiante) {
        formData.append('foto_estudiante', docs.foto_estudiante);
      }
      if (docs.cedula_estudiante) {
        formData.append('cedula_estudiante', docs.cedula_estudiante);
      }
      if (docs.certificado_nacimiento) {
        formData.append('certificado_nacimiento', docs.certificado_nacimiento);
      }
      if (docs.libreta_notas) {
        formData.append('libreta_notas', docs.libreta_notas);
      }
      
      // ✅ Agregar documento del representante
      if (documentosRepresentante.cedula_representante) {
        formData.append('cedula_representante', documentosRepresentante.cedula_representante);
      }
      
      // ✅ Enviar con api.post directamente
      const { default: api } = await import('@/lib/api');
      await api.post('/preinscripcion', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

    } else {
      // ✅ Modo múltiple o padre existente (ya está correcto)
      const formData = new FormData();

      formData.append('modo', modo);
      if (padreExistente) {
        formData.append('padre_id', padreExistente.id.toString());
      }

      formData.append('preinscripcion_info', JSON.stringify({
        periodo_academico_id: preinscripcionInfo.periodo_academico_id,
        grado_id: preinscripcionInfo.grado_id,
        turno_id: preinscripcionInfo.turno_id,
      }));

      const estudiantesData = estudiantes.map((est) => ({
        ...est,
        rude: est.rude || '',
        fecha_nacimiento: est.fecha_nacimiento ? est.fecha_nacimiento.format('YYYY-MM-DD') : '',
      }));
      formData.append('estudiantes', JSON.stringify(estudiantesData));

      if (modo !== 'padre_existente') {
        const representanteData = {
          ...representante,
          fecha_nacimiento: representante.fecha_nacimiento
            ? representante.fecha_nacimiento.format('YYYY-MM-DD')
            : null,
        };
        formData.append('representante', JSON.stringify(representanteData));

        if (documentosRepresentante.cedula_representante) {
          formData.append('cedula_representante', documentosRepresentante.cedula_representante);
        }
      }

      estudiantes.forEach((_, index) => {
        const docs = documentosEstudiantes[index];
        if (docs.foto_estudiante) formData.append(`foto_estudiante_${index}`, docs.foto_estudiante);
        if (docs.cedula_estudiante) formData.append(`cedula_estudiante_${index}`, docs.cedula_estudiante);
        if (docs.certificado_nacimiento) formData.append(`certificado_nacimiento_${index}`, docs.certificado_nacimiento);
        if (docs.libreta_notas) formData.append(`libreta_notas_${index}`, docs.libreta_notas);
      });

      const { default: api } = await import('@/lib/api');
      await api.post('/preinscripcion/multiple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }

    setIsSuccess(true);
  } catch (error: any) {
    console.error('Error al enviar:', error);
    alert(error.message || 'Error al enviar la preinscripción');
  } finally {
    setIsSubmitting(false);
  }
};

  // =============================================
  // LIMPIAR FORMULARIO
  // =============================================
  const limpiarFormulario = () => {
    if (confirm('¿Está seguro de que desea limpiar el formulario?')) {
      setEstudiantes([estadoInicialEstudiante()]);
      setEstudianteActivo(0);
      setRepresentante(estadoInicialTutor());
      setDocumentosEstudiantes({ 0: estadoInicialDocumentos() });
      setDocumentosRepresentante({ cedula_representante: null });
      setPreinscripcionInfo(estadoInicialPreInscripcionInfo()); // 🆕 Limpiar
      setActiveStep(0);
      setErrors({});
    }
  };

  // =============================================
  // RETURN
  // =============================================
  return {
    // Modo
    etapa,
    modo,
    padreExistente,
    handleModoSeleccionado,
    volverSeleccionModo,

    // Múltiples estudiantes
    estudiantes,
    estudianteActivo,
    setEstudianteActivo,
    agregarEstudiante,
    eliminarEstudiante,

    // 🆕 Preinscripción info
    preinscripcionInfo,
    updatePreinscripcionInfo,

    // Compatibilidad
    formData: {
      estudiante: estudiantes[estudianteActivo],
      representante,
      documentos: {
        ...documentosEstudiantes[estudianteActivo],
        cedula_representante: documentosRepresentante.cedula_representante,
      },
    },

    // Estados
    activeStep,
    errors,
    isSubmitting,
    isSuccess,

    // Handlers
    updateEstudiante,
    updateRepresentante,
    updateDocumento,
    handleNext,
    handleBack,
    handleSubmit,
    limpiarFormulario,
  };
}