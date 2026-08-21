/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_PAGES === "true"
const isElectronBuild = process.env.ELECTRON_BUILD === "true"

const nextConfig = {
  output: "export",
  basePath: isGithubPages ? "/PassGen" : "",
  assetPrefix: isGithubPages ? "/PassGen/" : isElectronBuild ? "./" : "",
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
