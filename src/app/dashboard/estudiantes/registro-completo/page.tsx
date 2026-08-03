'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Box, Button, Container, Divider, FormControlLabel, Paper, Step, StepLabel, Stepper, Switch, Typography } from '@mui/material';
import { ArrowBack, ArrowForward, CheckCircle } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useSnackbar } from 'notistack';
import { Dayjs } from 'dayjs';

import { EstudianteStep } from '@/components/estudiantes/registro/EstudianteStep';
import { TutoresStep } from '@/components/estudiantes/registro/TutoresStep';
import { RelacionesFamiliaStep } from '@/components/estudiantes/registro/RelacionesFamiliaStep';
import { MatriculaStep } from '@/components/estudiantes/registro/MatriculaStep';
import { DocumentosStep } from '@/components/estudiantes/registro/DocumentosStep';
import { ConfirmacionStep } from '@/components/estudiantes/registro/ConfirmacionStep';
import { CredencialesModal } from '@/components/estudiantes/CredencialesModal';
import { registroCompletoService } from '@/services/estudiantesService';
import { EstudianteCreate, MatriculaCreate, RegistroCompletoResponse } from '@/types/estudianteTypes';

type EstudianteForm = Omit<EstudianteCreate, 'fecha_nacimiento'> & { fecha_nacimiento: Dayjs | null };
type TutorForm = {
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  ci: string;
  fecha_nacimiento: Dayjs | null;
  telefono: string;
  celular: string;
  email: string;
  direccion: string;
  ocupacion: string;
  parentesco: string;
  estado_civil: string;
  es_tutor_principal: boolean;
  vive_con_estudiante: boolean;
  autorizado_recoger: boolean;
  puede_autorizar_salidas: boolean;
  recibe_notificaciones: boolean;
  prioridad_contacto: number;
  observaciones: string;
  es_existente?: boolean;
};

type Documento = { file: File; tipo_documento: string; observaciones?: string; estudiante_index?: number };
type CredencialGenerada = { referencia: string; nombre_completo: string; username: string; password: string; email: string };

const pasos = ['Estudiantes', 'Tutores y relaciones', 'Usuarios', 'Matrículas', 'Documentos', 'Confirmación'];

const estudianteVacio = (): EstudianteForm => ({
  nombres: '', apellido_paterno: '', apellido_materno: '', fecha_nacimiento: null,
  ci: '', rude: '', lugar_nacimiento: '', genero: undefined, direccion: '', zona: '', ciudad: '',
  telefono: '', email: '', contacto_emergencia: '', tiene_discapacidad: false,
  tipo_discapacidad: '', observaciones: '',
});

export default function RegistroFamiliarPage() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [paso, setPaso] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [estudiantes, setEstudiantes] = useState<EstudianteForm[]>([estudianteVacio()]);
  const [fotos, setFotos] = useState<(File | null)[]>([null]);
  const [tutores, setTutores] = useState<TutorForm[]>([]);
  const [relaciones, setRelaciones] = useState<Record<string, boolean>>({});
  const [principal, setPrincipal] = useState<string | null>(null);
  const [crearUsuariosEstudiantes, setCrearUsuariosEstudiantes] = useState(false);
  const [crearUsuariosTutores, setCrearUsuariosTutores] = useState(false);
  const [incluirMatricula, setIncluirMatricula] = useState(true);
  const [matriculas, setMatriculas] = useState<MatriculaCreate[]>([]);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [credencialesGeneradas, setCredencialesGeneradas] = useState<CredencialGenerada[]>([]);
  const [resultadoModal, setResultadoModal] = useState<RegistroCompletoResponse['data'] | null>(null);
  const [modalExitoOpen, setModalExitoOpen] = useState(false);
  const [errorRegistro, setErrorRegistro] = useState<string | null>(null);
  const hayTutoresNuevos = tutores.some((tutor) => !tutor.es_existente);

  const cambiarRelacion = (key: string, seleccionada: boolean) => {
    setRelaciones((prev) => ({ ...prev, [key]: seleccionada }));
    if (!seleccionada && principal === key) setPrincipal(null);
  };

  const handleCerrarModal = () => {
    setModalExitoOpen(false);
    router.push('/dashboard/estudiantes');
  };

  const confirmar = async () => {
    const relacionesSeleccionadas = Object.entries(relaciones).filter(([, marcada]) => marcada);
    if (!relacionesSeleccionadas.length) {
      const mensaje = 'Relaciona al menos un tutor con cada estudiante.';
      setErrorRegistro(mensaje);
      enqueueSnackbar(mensaje, { variant: 'warning' });
      setPaso(1);
      return;
    }
    const sinTutor = estudiantes.some((_, estudianteIndex) =>
      !relacionesSeleccionadas.some(([key]) => key.startsWith(`${estudianteIndex}:`))
    );
    if (sinTutor) {
      const mensaje = 'Cada estudiante debe tener al menos un tutor.';
      setErrorRegistro(mensaje);
      enqueueSnackbar(mensaje, { variant: 'warning' });
      setPaso(1);
      return;
    }
    if (documentos.length && !incluirMatricula) {
      enqueueSnackbar('Para adjuntar documentos, incluye la matrícula de cada estudiante.', { variant: 'warning' });
      setPaso(3);
      return;
    }
    const documentoSinMatricula = documentos.some((documento) => {
      const matricula = matriculas[documento.estudiante_index || 0];
      return !matricula?.paralelo_id || !matricula?.periodo_academico_id;
    });
    if (documentoSinMatricula) {
      enqueueSnackbar('Completa la matrícula de cada estudiante que tenga documentos adjuntos.', { variant: 'warning' });
      setPaso(3);
      return;
    }

    try {
      setEnviando(true);
      setErrorRegistro(null);
      const respuesta = await registroCompletoService.registrarFamiliar({
        estudiantes: estudiantes.map((estudiante, index) => ({
          ...estudiante,
          referencia: `estudiante-${index}`,
          fecha_nacimiento: estudiante.fecha_nacimiento?.format('YYYY-MM-DD'),
        })),
        tutores: tutores.map((tutor, index) => ({
          ...tutor,
          referencia: `tutor-${index}`,
          fecha_nacimiento: tutor.fecha_nacimiento?.format('YYYY-MM-DD'),
        })),
        relaciones: relacionesSeleccionadas.map(([key]) => {
          const [estudianteIndex, tutorIndex] = key.split(':');
          return {
            estudiante_referencia: `estudiante-${estudianteIndex}`,
            tutor_referencia: `tutor-${tutorIndex}`,
            es_tutor_principal: principal === key,
          };
        }),
        matriculas: incluirMatricula ? matriculas.map((matricula, index) => ({
          ...matricula,
          estudiante_referencia: `estudiante-${index}`,
        })).filter((matricula) => matricula.paralelo_id > 0 && matricula.periodo_academico_id > 0) : [],
        documentos: documentos.map((documento) => ({
          file: documento.file,
          tipo_documento: documento.tipo_documento,
          observaciones: documento.observaciones,
          estudiante_referencia: `estudiante-${documento.estudiante_index || 0}`,
        })),
        crear_usuarios_estudiantes: crearUsuariosEstudiantes,
        crear_usuarios_tutores: crearUsuariosTutores && hayTutoresNuevos,
      });

      setCredencialesGeneradas([
        ...(respuesta.data?.credenciales_estudiantes || []),
        ...(respuesta.data?.credenciales_tutores || []),
      ]);

      const modalData: RegistroCompletoResponse['data'] = {
        modo: 'multiple',
        estudiantes: respuesta.data?.estudiantes || [],
        tutores: respuesta.data?.tutores || [],
        matriculas: respuesta.data?.matriculas || [],
        credenciales_estudiantes: respuesta.data?.credenciales_estudiantes || [],
        credenciales_tutores: respuesta.data?.credenciales_tutores || [],
      };
      setResultadoModal(modalData);
      setModalExitoOpen(true);
      enqueueSnackbar('Registro familiar completado exitosamente.', { variant: 'success' });
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo completar el registro.';
      setErrorRegistro(mensaje);
      if (mensaje.toLowerCase().includes('usuario')) setPaso(2);
      else if (mensaje.toLowerCase().includes('estudiante')) setPaso(0);
      else if (mensaje.toLowerCase().includes('tutor') || mensaje.toLowerCase().includes('ci')) setPaso(1);
      enqueueSnackbar(mensaje, { variant: 'error' });
    } finally {
      setEnviando(false);
    }
  };

  const contenido = [
    <EstudianteStep key="estudiantes" modo="multiple" estudiantes={estudiantes} fotos={fotos} onEstudiantesChange={setEstudiantes} onFotosChange={setFotos} />,
    <Box key="tutores-relaciones">
      <TutoresStep tutores={tutores} onChange={setTutores} />
      <Divider sx={{ my: 4 }} />
      <RelacionesFamiliaStep estudiantes={estudiantes} tutores={tutores} relaciones={relaciones} principal={principal} onRelacionChange={cambiarRelacion} onPrincipalChange={setPrincipal} />
    </Box>,
    <Box key="usuarios">
      <Typography variant="h5" fontWeight={700} mb={1}>Cuentas de acceso</Typography>
      <Typography color="text.secondary" mb={3}>
        Puedes crear cuentas de acceso ahora. El sistema generará credenciales temporales y las mostrará al finalizar.
      </Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        Las cuentas de tutores se crean únicamente para tutores nuevos; nunca se duplica un usuario de un tutor existente.
      </Alert>
      <FormControlLabel
        control={<Switch checked={crearUsuariosEstudiantes} onChange={(event) => setCrearUsuariosEstudiantes(event.target.checked)} />}
        label="Crear cuentas para los estudiantes nuevos"
      />
      {hayTutoresNuevos ? (
        <FormControlLabel
          control={<Switch checked={crearUsuariosTutores} onChange={(event) => setCrearUsuariosTutores(event.target.checked)} />}
          label="Crear cuentas para los tutores nuevos"
        />
      ) : (
        <Alert severity="success" sx={{ mt: 1 }}>
          Todos los tutores seleccionados ya existen; no se crearán cuentas duplicadas.
        </Alert>
      )}
    </Box>,
    <MatriculaStep key="matriculas" modo="multiple" incluirMatricula={incluirMatricula} matriculas={matriculas} estudiantes={estudiantes} onToggleIncluir={setIncluirMatricula} onMatriculasChange={setMatriculas} />,
    <DocumentosStep key="documentos" documentos={documentos} onChange={setDocumentos} modo="multiple" estudiantes={estudiantes} />,
    <ConfirmacionStep
      key="confirmacion"
      modo="multiple"
      estudiantes={estudiantes}
      fotos={fotos}
      tutores={tutores}
      padreExistente={null}
      crearUsuarioEstudiante={crearUsuariosEstudiantes}
      crearUsuariosTutores={crearUsuariosTutores}
      credencialesEstudiantes={[]}
      credencialesTutores={[]}
      incluirMatricula={incluirMatricula}
      matriculas={matriculas}
      documentos={documentos}
    />,
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight={800} mb={1}>Registro familiar</Typography>
        <Typography color="text.secondary" mb={4}>Registra varios estudiantes, sus tutores y las relaciones familiares en una sola operación.</Typography>
        {errorRegistro && (
          <Alert severity="error" onClose={() => setErrorRegistro(null)} sx={{ mb: 3 }}>
            {errorRegistro}
          </Alert>
        )}
        <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 3 }}>
          <Stepper activeStep={paso} alternativeLabel sx={{ mb: 4 }}>
            {pasos.map((etiqueta) => <Step key={etiqueta}><StepLabel>{etiqueta}</StepLabel></Step>)}
          </Stepper>
          {contenido[paso]}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button startIcon={<ArrowBack />} disabled={paso === 0 || enviando} onClick={() => setPaso((actual) => actual - 1)}>Atrás</Button>
            {paso === pasos.length - 1 ? (
              <Button variant="contained" startIcon={<CheckCircle />} disabled={enviando} onClick={confirmar}>
                {enviando ? 'Registrando...' : 'Confirmar registro'}
              </Button>
            ) : (
              <Button variant="contained" endIcon={<ArrowForward />} onClick={() => setPaso((actual) => actual + 1)}>Siguiente</Button>
            )}
          </Box>
        </Paper>

        {resultadoModal && (
          <CredencialesModal
            open={modalExitoOpen}
            onClose={handleCerrarModal}
            data={resultadoModal}
          />
        )}
      </Container>
    </LocalizationProvider>
  );
}

