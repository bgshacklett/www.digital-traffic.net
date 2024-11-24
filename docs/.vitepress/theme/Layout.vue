<script setup>
import DefaultTheme from 'vitepress/theme'

const { Layout: DefaultLayout } = DefaultTheme
import Posts from './blog/Posts.vue'

import { useData, useRoute } from 'vitepress'
import BlogIndex from './blog/Index.vue'
import PostDetail from './blog/PostDetail.vue'
import './styles/global.css'

const { path } = useRoute()
const { frontmatter } = useData()

</script>


<template>
  <template v-if="path === '/blog/'">
    <BlogIndex/>
  </template>

  <template v-else-if="path.startsWith('/blog/posts/')">
    <DefaultLayout>
      <template #doc-after>
        <PostDetail/>
      </template>
      <template #doc-before>
        <h1 class="title">{{ frontmatter.title }}</h1>
      </template>
    </DefaultLayout>
  </template>

  <template v-else>
    <DefaultLayout/>
  </template>
</template>


<style scoped>
:deep(h2) {
  border: 0;
}

:deep(p) {
  margin: 1rem 0;
}

:deep(.VPHero .container) {
  max-width: 960px;
}

:deep(div.VPHome div.header) {
  max-width: 960px;
}

:deep(div.vp-doc) {
  max-width: calc(960px + 128px);
}
</style>
