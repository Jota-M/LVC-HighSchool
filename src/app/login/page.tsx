'use client';
import React, { useState } from 'react';
import Header from './Header';
import { useRouter } from 'next/navigation';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data?.error || 'Error al iniciar sesión');
      } else {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);

        // Redirigir según rol
        switch (data.role) {
          case 'admin':
            router.push('/dashboard');
            break;
          case 'padre':
            router.push('/dashboard');
            break;
          case 'profesor':
            router.push('/dashboard');
            break;
          case 'estudiante':
            router.push('/dashboard');
            break;
          default:
            router.push('/dashboard');
            break;
        }
      }
    } catch {
      setErrorMsg('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        backgroundImage: "url('./fondo.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Header />
      <div className="mt-36 md:mt-20 lg:mt-0 flex flex-col md:flex-row w-full max-w-4xl rounded-2xl overflow-hidden shadow-xl bg-black/30 backdrop-blur-lg border border-white/10">
        {/* Lado izquierdo */}
        <div className="flex-1 p-8 md:p-12 text-white flex flex-col justify-center text-center">
          <img className="w-40 h-auto mx-auto mb-4" src="logo.png" alt="Logo" />
          <h1 className="text-2xl font-bold">Formando Vidas con Propósito</h1>
          <p className="mt-4 text-sm text-gray-200">
            Bienvenido a nuestra plataforma educativa cristiana. Aquí acompañamos tu crecimiento académico y espiritual con herramientas diseñadas para fortalecer tu fe, tu carácter y tu conocimiento. ¡Gracias por ser parte de esta misión!
          </p>
          <p className="mt-4 text-xs text-gray-400">
            © 2025 Unidad Educativa Particular La Voz de Cristo.
          </p>
        </div>

        <div className="hidden md:flex w-[1px] bg-white/40"></div>

        {/* Lado derecho: Login */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
          <h2 className="text-white text-xl mb-4 font-semibold">Iniciar Sesión</h2>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="rounded-full px-5 py-3 bg-white/10 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur"
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-full px-5 py-3 bg-white/10 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur"
              required
            />

            {errorMsg && <p className="text-red-400 text-sm">{errorMsg}</p>}

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-full mt-2 transition disabled:opacity-50"
            >
              {loading ? 'Cargando...' : '🔐 Iniciar Sesión'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
