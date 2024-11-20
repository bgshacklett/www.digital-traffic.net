<script setup>
import DefaultTheme from 'vitepress/theme'

const { Layout: DefaultLayout } = DefaultTheme
import Posts from './blog/Posts.vue'

import { useRoute } from 'vitepress'
import BlogIndex from './blog/Index.vue'
import PostDetail from './blog/PostDetail.vue'
import './styles/global.css'

const { path } = useRoute()

</script>


<template>
  <template v-if="path === '/blog/'">
    <BlogIndex/>
  </template>

  <template v-else-if="path.startsWith('/blog/posts/')">
    <DefaultLayout>
      <template #doc-top>
        <PostDetail/>
      </template>
    </DefaultLayout>
  </template>

  <template v-else>
    <DefaultLayout/>
  </template>
</template>

<style scoped>
:deep(h2) {
  font-size: 2rem;
  margin-top: 1.5rem;
  padding-bottom: 0.5rem;
  border: 0;
}

:deep(p) {
  margin: 1rem 0;
}
</style>
