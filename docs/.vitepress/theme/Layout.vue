<script setup>
import DefaultTheme from 'vitepress/theme'

const { Layout: DefaultLayout } = DefaultTheme
import Posts from './blog/Posts.vue'

import { useRoute } from 'vitepress'
import BlogPost from './blog/Post.vue'
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
