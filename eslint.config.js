import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import vuejsAccessibility from 'eslint-plugin-vuejs-accessibility'

export default [
  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  ...vuejsAccessibility.configs['flat/recommended'],
  {
    files: ['src/**/*.{js,vue}'],
    rules: {
      // Vue specific
      'vue/multi-word-component-names': 'off',
      'vue/require-default-prop': 'error',
      'vue/no-unused-vars': 'error',
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/html-self-closing': ['error', {
        html: { void: 'always', normal: 'never', component: 'always' }
      }],

      // General JS
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'prefer-const': 'error',
      'no-var': 'error',
      'eqeqeq': ['error', 'always'],

      // Accessibility — keep recommended defaults, override only as needed
      'vuejs-accessibility/label-has-for': ['error', {
        required: { some: ['nesting', 'id'] }
      }]
    }
  },
  {
    ignores: ['dist/**', 'node_modules/**', '*.config.js']
  }
]
