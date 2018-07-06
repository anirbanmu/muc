module.exports = {
  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        args[0].template = '!!raw-loader!/home/anirbanmu/code/muc/views/index.ejs'
        args[0].filename = 'templates/index.ejs'
        return args
      })
  }
}
