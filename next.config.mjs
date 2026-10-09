/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  basePath: process.env.GITHUB_ACTIONS ? "/MGL-RPG-Creator" : "",
  outputFileTracingRoot: process.cwd(),
  images: { unoptimized: true }
};
export default nextConfig;

