import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api-highschool-1.onrender.com',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});


// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     // Si es 401 y NO es login/me y no hemos reintentado
//     if (
//       error.response?.status === 401 && 
//       !originalRequest._retry &&
//       !originalRequest.url?.includes('/auth/login') &&
//       !originalRequest.url?.includes('/auth/me')
//     ) {
//       originalRequest._retry = true;

//       try {
//         // Intentar refrescar el token
//         await api.post('/auth/refresh');
//         // Reintentar la petición original
//         return api(originalRequest);
//       } catch (refreshError) {
//         // Si falla el refresh, solo rechazar
//         // ProtectedRoute se encargará de redirigir a /login
//         return Promise.reject(refreshError);
//       }
//     }

//     // Para cualquier otro error, simplemente rechazar
//     // NO redirigir manualmente aquí
//     return Promise.reject(error);
//   }
// );

export default api;