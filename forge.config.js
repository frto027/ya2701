const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

let DEBUG = false

let makers = []

let plugins = []

if (!DEBUG) {
  plugins.push({
    name: '@electron-forge/plugin-auto-unpack-natives',
    config: {},
  })
}
// Fuses are used to enable/disable various Electron functionality
// at package time, before code signing the application

plugins.push(new FusesPlugin({
  version: FuseVersion.V1,
  [FuseV1Options.RunAsNode]: false,
  [FuseV1Options.EnableCookieEncryption]: true,
  [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
  [FuseV1Options.EnableNodeCliInspectArguments]: false,
  [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
  [FuseV1Options.OnlyLoadAppFromAsar]: true,
}))

module.exports = {
  packagerConfig: {
    asar: DEBUG ? false : true,
    quiet: DEBUG ? false : true,
    ignore: function (path) {
      //we don't need any ts files
      if (path.startsWith("/node_modules/")) {
        if (path.startsWith("/node_modules/.bin"))
          return true
        return false
      }

      if (path.startsWith("/static/") && !path.endsWith(".ts")) {
        return false
      }
      if (path.endsWith(".ts"))
        return true
      if (path.endsWith(".md"))
        return true
      let ignore_prefixes = [
        "/device",
        "/out",
        "/test",
        "/window",
        "/.git",
        "/docs",
        "/datas.txt",
        "/forge.config.js"
      ]

      for (let i = 0; i < ignore_prefixes.length; i++) {
        if (path.startsWith(ignore_prefixes[i]))
          return true
      }
      return false
    }
  },
  rebuildConfig: {},
  makers: [
    // {
    //   name: '@electron-forge/maker-squirrel',
    //   config: {},
    // },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['win32'],
    },
    // {
    //   name: '@electron-forge/maker-deb',
    //   config: {},
    // },
    // {
    //   name: '@electron-forge/maker-rpm',
    //   config: {},
    // },
  ],
  plugins: plugins,
};
