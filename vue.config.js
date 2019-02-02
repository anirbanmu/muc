module.exports = {
  chainWebpack: config => {
    config.plugin('html').tap(args => {
      args[0].template = '!!raw-loader!./views/index.ejs';
      args[0].filename = 'templates/index.ejs';
      if (process.env.GOOGLE_SITE_VERIFICATION_CODE) {
        args[0].meta = {
          'google-site-verification': process.env.GOOGLE_SITE_VERIFICATION_CODE
        };
      }
      return args;
    });
  }
};
