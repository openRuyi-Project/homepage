import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'openRuyi',
  tagline: 'Only for RISC-V.',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://openruyi.cn',
  baseUrl: '/',

  organizationName: 'openRuyi-Project',
  projectName: 'website',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['zh-Hans', 'en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl:
            'https://github.com/openRuyi-Project/website',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl:
            'https://github.com/openRuyi-Project/website',
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],
    plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'governance',
        path: 'governance',
        routeBasePath: 'governance',
        sidebarPath: './sidebarsGovernance.js',
      },
    ],
  ],

  themeConfig: {
    image: 'img/openRuyi-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: '',
      logo: {
        alt: 'openRuyi Logo',
        src: 'img/openRuyi.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docSidebar',
          position: 'left',
          label: 'openRuyi',
        },
        {
            to: '/governance',
            label: 'Governance',
            position: 'left',
          activeBaseRegex: `/governance(/|$)/`,
        },
        {to: '/blog', label: 'Blog', position: 'left'},
        {
          type: 'localeDropdown',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Quick Links',
          items: [
            {
              label: 'Docs Portal',
              to: '/docs/intro',
            },
            {
              label: 'openRuyi Build',
              href: 'https://build.openruyi.cn',
            },
            {
              label: 'openRuyi Releases',
              href: 'https://releases.openruyi.cn',
            },
            {
              label: 'openRuyi Archive',
              href: 'https://archive.openruyi.cn',
            },
          ],
        },
        {
          title: 'Legal',
          items: [
            {
              label: 'Privacy Policy',
              to: '/governance/legal/privacy-policy',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'System Status',
              href: 'https://status.openruyi.cn',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/openRuyi-Project',
            },
            {
              label: 'Discord',
              href: 'https://discord.gg/ycDafzwsud',
            },
          ],
        },
      ],
      logo: {
          alt: 'ISCAS Logo',
          src: '/img/iscas.svg',
          href: 'https://www.iscas.ac.cn',
      },
      copyright: `Copyright © ${new Date().getFullYear()} openRuyi Project Contributors. | <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">京ICP备05046678号-71</a>`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
