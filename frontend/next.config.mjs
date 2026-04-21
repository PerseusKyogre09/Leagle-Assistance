const nextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: '/api/v1/neural/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/v1/neural/:path*`,
      },
    ];
  },
};

export default nextConfig;
