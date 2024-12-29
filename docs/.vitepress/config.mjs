import { withMermaid } from "vitepress-plugin-mermaid";
import { figure } from "@mdit/plugin-figure";

// Third Party Plugins
import { abbr } from '@mdit/plugin-abbr'


export default withMermaid({
  // app level config options
  lang: 'en-US',
  title: 'digital-traffic.net',
  description: 'Thoughts of a Technology Consultant',
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    [
      'script', {
        src: "https://cloud.umami.is/script.js",
        "data-website-id": "44881c37-4476-4aa1-bb27-4059f83ad1fe",
        defer: true,
        type: 'text/javascript'
      }
    ],
  ],
  mpa: true,
  lastUpdated: true,

  markdown: {
    config(md) {
      md.use(abbr)
        .use(figure, {
          // your options, optional
        });
    },
    frontmatter: {
      grayMatterOptions: {
        excerpt: true,
        excerpt_separator: '<!-- more -->',
      },
    },
  },

  vite: {
    logLevel: 'info',
    publicDir: 'public',
  },

  // theme level config options
  themeConfig: {
    nav: nav(),
    sidebar: { },
    footer: {
      // message: 'message',
      copyright: 'Copyright © 2024-present Brian G. Shacklett'
    },
    search: {
      provider: 'local',
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/bgshacklett' },
    ],
    // blog: {
    //   title: 'My Blog',
    //   description: 'Some articles for sample Blog',
    // },
  }
})

function nav() {
  return [
    { text: 'Blog', link: '/blog/' },
    { text: 'About Me', link: '/about/' },
  ]
}
