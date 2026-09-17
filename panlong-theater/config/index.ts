const path = require('path');

const config = {
  projectName: 'panlong-theater',
  date: '2025-5-31',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2,
    375: 2 / 1,
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: ['@tarojs/plugin-framework-react'],
  defineConstants: {},
  copy: {
    patterns: [],
    options: {},
  },
  framework: 'react',
  compiler: 'webpack5',
  cache: {
    enable: false,
  },
  mini: {
    postcss: {
      pxtransform: {
        enable: true,
        config: {},
      },
      url: {
        enable: true,
        config: {
          limit: 1024,
        },
      },
      cssModules: {
        enable: true,
        config: {
          namingPattern: 'module',
          generateScopedName: '[name]__[local]___[hash:base64:5]',
        },
      },
    },
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    postcss: {
      autoprefixer: {
        enable: true,
        config: {},
      },
      cssModules: {
        enable: true,
        config: {
          namingPattern: 'module',
          generateScopedName: '[name]__[local]___[hash:base64:5]',
        },
      },
    },
  },
  alias: {
    '@': path.resolve(__dirname, '..', 'src'),
    '@/types': path.resolve(__dirname, '..', 'src/types'),
    '@/components': path.resolve(__dirname, '..', 'src/components'),
    '@/pages': path.resolve(__dirname, '..', 'src/pages'),
    '@/stores': path.resolve(__dirname, '..', 'src/stores'),
    '@/services': path.resolve(__dirname, '..', 'src/services'),
    '@/utils': path.resolve(__dirname, '..', 'src/utils'),
    '@/mock': path.resolve(__dirname, '..', 'src/mock'),
    '@/assets': path.resolve(__dirname, '..', 'src/assets'),
  },
};

module.exports = config;
