const { defineConfig } = require('eslint/config');
const expo = require('eslint-config-expo/flat');
module.exports = defineConfig([
  expo,
  { ignores: ['.toolchain/**', '.cache/**', 'android/**', 'artifacts/**', 'diagnostics/**', 'local-data/**'] },
]);
