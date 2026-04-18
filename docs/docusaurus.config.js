const config = {
  title: 'Goals Service Docs',
  tagline: 'Project and product documentation',

  url: 'http://localhost',
  baseUrl: '/',

  onBrokenLinks: 'ignore',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'ru',
    locales: ['ru'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          routeBasePath: '/',
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],

  plugins: [
    function removeIncompatibleWebpackProgressPlugin() {
      const isWebpackBarPlugin = (plugin) => {
        const constructorName = plugin?.constructor?.name;
        const options = plugin?.options;

        return (
          constructorName === 'WebpackBarPlugin' ||
          Boolean(
            options &&
            typeof options === 'object' &&
            'name' in options &&
            'color' in options &&
            'reporter' in options &&
            'reporters' in options,
          )
        );
      };

      return {
        name: 'remove-incompatible-webpack-progress-plugin',
        configureWebpack(webpackConfig) {
          const initialPlugins = webpackConfig.plugins ?? [];
          const plugins = initialPlugins.filter(
            (plugin) => !isWebpackBarPlugin(plugin),
          );

          if (plugins.length === initialPlugins.length) {
            return {};
          }

          return {
            plugins,
            mergeStrategy: { plugins: 'replace' },
          };
        },
      };
    },
  ],

  themeConfig: {
    navbar: {
      title: 'Goals Service Docs',
      items: [{ to: '/', label: 'Документация', position: 'left' }],
    },
  },

  themes: ['@docusaurus/theme-mermaid'],
  markdown: {
    mermaid: true,
  },
};

module.exports = config;
