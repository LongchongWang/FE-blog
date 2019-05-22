const path = require('path')
// MPA
const pages = {
  'index': {
    entry: './src/pages/Index/main.js',
    template: 'public/index.html',
    title: 'Index',
    filename: 'index.html',
    chunks: [ 'chunk-vendors', 'chunk-common', 'index' ]
  },
  'invite': {
    entry: './src/pages/Invite/main.js',
    template: 'public/index.html',
    title: '邀请好友助力，豪礼免费领',
    filename: 'invite.html',
    chunks: [ 'chunk-vendors', 'chunk-common', 'invite' ]
  }
}
// add dev page when developing
if (process.env.NODE_ENV === 'development') {
  pages.dev = {
    entry: './src/pages/dev/main.js',
    template: 'public/index.html',
    title: '模块开发',
    filename: 'dev.html',
    chunks: [ 'chunk-vendors', 'chunk-common', 'dev' ]
  }
}

module.exports = {
  // use relative path to bundle assets
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
  pages,
  productionSourceMap: process.env.NODE_ENV === 'development',
  // modify webpack configure
  configureWebpack: {
    devServer: {
      compress: true,
      disableHostCheck: true
    },
    externals: {
      'mi-home-lib': 'window.miHomeLib'
    },
    resolve: {
      alias: {
        $components: path.resolve(__dirname, 'src/components'),
        $floors: path.resolve(__dirname, 'src/floors'),
        $services: path.resolve(__dirname, 'src/services'),
        $utils: path.resolve(__dirname, 'src/utils')
      }
    },
    optimization: {
      splitChunks: {
        cacheGroups: {
          vendors: {
            name: 'chunk-vendors',
            test: /[\\\/]node_modules[\\\/]/,
            priority: -10,
            chunks: 'initial'
          },
          common: {
            name: 'chunk-common',
            minChunks: 1,
            test: /[\\\/]utils[\\\/]/,
            priority: -20,
            chunks: 'initial'
          }
        }
      }
    }
  },
  css: {
    loaderOptions: {
      // add global variables
      less: {
        globalVars: {
          red: 'rgb(191, 17, 17)',
          lightRed: 'rgb(213, 72, 65)',
          dark: 'rgb(128, 128, 128)',
          grey: 'rgb(242, 242, 242)',
          white: 'rgb(255, 255, 255)',
          black: 'rgb(0,0,0)'
        }
      }
    }
  },
  // change webpack configure based on chainWebpack: https://github.com/neutrinojs/webpack-chain
  chainWebpack: config => {
    config.module.rules.delete('eslint')
    // For instance, the optimization change can be done here, too.
    // config.optimization
    //   .splitChunks({
    //     cacheGroups: {
    //       vendors: {
    //         name: 'chunk-vendors',
    //         test: /[\\\/]node_modules[\\\/]/,
    //         priority: -10,
    //         chunks: 'initial'
    //       },
    //       common: {
    //         name: 'chunk-common',
    //         test: /[\\\/]utils[\\\/]/,
    //         priority: -20,
    //         chunks: 'initial'
    //       }
    //     }
    // })
  }
}
