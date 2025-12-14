/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'notso-chat-widgets.netlify.app',
      },
    ],
  },
};
export default nextConfig;
