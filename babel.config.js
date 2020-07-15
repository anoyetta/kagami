module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          chrome: '75',
          node: 'current',
        },
      },
    ],
  ],
  // env: {
  //   test: {
  //     plugins: [
  //       'transform-es2015-modules-commonjs'
  //     ],
  //   },
  // },
};
