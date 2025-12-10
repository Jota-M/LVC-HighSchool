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
// ESTADOS INICIALES
// =============================================
const estadoInicialEstudiante = (): PreEstudianteForm => ({
  nombres: '',
  apellido_paterno: '',
  apellido_materno: '',
  ci: '',
  fecha_nacimiento: null,
  lugar_nacimiento: '',
  genero: '',
  direccion: '',
  zona: '',
  ciudad: '',
  telefono: '',
  email: '',
  contacto_emergencia: '',
  telefono_emergencia: '',
  tiene_discapacidad: false,
  tipo_discapacidad: '',
  institucion_procedencia: '',
  ultimo_grado_cursado: '',
  grado_solicitado: '',
  repite_grado: false,
  turno_solicitado: '',
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

export function usePreinscripcion() {
  // =============================================
  // 🆕 ESTADOS PARA MODO MÚLTIPLE
  // =============================================
  const [etapa, setEtapa] = useState<'seleccion_modo' | 'formulario'>('seleccion_modo');
  const [modo, setModo] = useState<ModoRegistro>('nuevo');
  const [padreExistente, setPadreExistente] = useState<any>(null);
  
  // Array de estudiantes
  const [estudiantes, setEstudiantes] = useState<PreEstudianteForm[]>([estadoInicialEstudiante()]);
  const [estudianteActivo, setEstudianteActivo] = useState(0);
  
  // Documentos por estudiante
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

  // =============================================
  // VALIDACIONES
  // =============================================
  const validarPaso = (paso: number): boolean => {
    const nuevosErrores: ErroresFormulario = {};
    const estudianteActual = estudiantes[estudianteActivo];

    if (paso === 0) {
      if (!estudianteActual.nombres) nuevosErrores.nombres = 'Campo requerido';
      if (!estudianteActual.apellido_paterno) nuevosErrores.apellido_paterno = 'Campo requerido';
      if (!estudianteActual.fecha_nacimiento) nuevosErrores.fecha_nacimiento = 'Campo requerido';
      if (!estudianteActual.genero) nuevosErrores.genero = 'Campo requerido';
      if (!estudianteActual.grado_solicitado) nuevosErrores.grado_solicitado = 'Campo requerido';
      if (!estudianteActual.turno_solicitado) nuevosErrores.turno_solicitado = 'Campo requerido';
    }

    if (paso === 1 && modo !== 'padre_existente') {
      if (!representante.nombres) nuevosErrores.nombres_rep = 'Campo requerido';
      if (!representante.apellido_paterno) nuevosErrores.apellido_paterno_rep = 'Campo requerido';
      if (!representante.ci) nuevosErrores.ci_rep = 'Campo requerido';
      if (!representante.telefono) nuevosErrores.telefono_rep = 'Campo requerido';
    }

    if (paso === 2) {
      const docs = documentosEstudiantes[estudianteActivo];
      if (!docs.cedula_estudiante) nuevosErrores.cedula_estudiante = 'Documento requerido';
      if (!docs.certificado_nacimiento) nuevosErrores.certificado_nacimiento = 'Documento requerido';
      if (!docs.libreta_notas) nuevosErrores.libreta_notas = 'Documento requerido';

      if (modo !== 'padre_existente' && !documentosRepresentante.cedula_representante) {
        nuevosErrores.cedula_representante = 'Documento requerido';
      }
    }

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
  // ENVÍO (usando preinscripcionService)
  // =============================================
  const handleSubmit = async () => {
    if (!validarPaso(activeStep)) return;

    setIsSubmitting(true);

    try {
      // ✅ Modo simple: usar servicio original
      if (modo === 'nuevo' && estudiantes.length === 1) {
        const estudianteData = {
          ...estudiantes[0],
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
        
        await preinscripcionService.crear(
          {
            estudiante: estudianteData,
            representante: representanteData,
          },
          {
            foto_estudiante: docs.foto_estudiante || undefined,
            cedula_estudiante: docs.cedula_estudiante || undefined,
            certificado_nacimiento: docs.certificado_nacimiento || undefined,
            libreta_notas: docs.libreta_notas || undefined,
            cedula_representante: documentosRepresentante.cedula_representante || undefined,
          }
        );

      } else {
        // ✅ Modo múltiple o padre existente: usar endpoint múltiple
        const formData = new FormData();

        formData.append('modo', modo);
        if (padreExistente) {
          formData.append('padre_id', padreExistente.id.toString());
        }

        const estudiantesData = estudiantes.map((est) => ({
          ...est,
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

        // ✅ Usar axios a través de api
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