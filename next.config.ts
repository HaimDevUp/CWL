import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config, { isServer }) {
    // SVG loader configuration
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    });

    // Fix for react-pdf and pdfjs-dist in Next.js
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false,
      }
    }

    // Ignore canvas and fs modules (not available in browser)
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
      fs: false,
      path: false,
      stream: false,
      crypto: false,
    }

    // Additional fix for pdfjs-dist - prevent it from being bundled incorrectly
    config.externals = config.externals || []
    if (isServer) {
      config.externals.push('canvas')
    }

    // Fix for react-pdf v10 - ensure proper handling of pdfjs-dist
    // Use the pdfjs-dist from react-pdf's node_modules to avoid version conflicts
    try {
      const reactPdfPdfjsDistPath = require.resolve('pdfjs-dist', {
        paths: [require.resolve('react-pdf/package.json')]
      })
      // Get the directory path (remove the filename)
      const pdfjsDistDir = reactPdfPdfjsDistPath.replace(/\/build\/.*$/, '')
      
      config.resolve.alias = {
        ...config.resolve.alias,
        'pdfjs-dist': pdfjsDistDir,
      }
    } catch (error) {
      console.warn('Failed to resolve pdfjs-dist from react-pdf, using default:', error)
    }
    
    // Ensure .mjs files are handled correctly
    if (!isServer) {
      config.module.rules.push({
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
        resolve: {
          fullySpecified: false,
        },
      })
      
      // הוסף BannerPlugin כדי להזריק את הגדרת ה-worker לפני טעינת pdfjs-dist
      const webpack = require('webpack')
      config.plugins.push(
        new webpack.BannerPlugin({
          banner: `
            if (typeof window !== 'undefined' && typeof globalThis !== 'undefined') {
              globalThis.__PDFJS_WORKER_SRC__ = '/pdf.worker.5.4.296.min.mjs';
            }
          `,
          raw: true,
          entryOnly: false,
        })
      )
    }

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.parkswiftssp.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

