// @ts-check

const config = {
  title: 'Goals Service Docs',
  tagline: 'Project and product documentation',

  url: 'http://localhost',
  baseUrl: '/',

  onBrokenLinks: 'throw',
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
