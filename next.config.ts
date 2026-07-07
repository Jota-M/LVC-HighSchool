const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

// const nextConfig = {
//   eslint: {
//     ignoreDuringBuilds: true,
//   },
//   typescript: {
//     ignoreBuildErrors: true,
//   },
//   async rewrites() {
//     return [
//       {
//         source: '/api-proxy/:path*',
//         destination: 'http://45.55.51.161:3000/:path*',
//       },
//     ];
//   },
// };

// export default nextConfig;