import DefaultTheme from 'vitepress/theme'
import CustomLayout from './Layout.vue'

import Posts from './blog/Posts.vue'

export default {
  extends: DefaultTheme,
  Layout: CustomLayout,
  enhanceApp({ app }) {
    // register your custom global components
    app.component('Posts', Posts)
  }
}
