<script setup lang="ts">
import { computed } from 'vue'
import { useData, useRoute } from 'vitepress'

import type { Post } from './posts.data'

import Date from './Date.vue'

const { frontmatter: data } = useData()

const route = useRoute()

const props = defineProps<{ post: Post }>()
</script>

<template>
  <div class="post-summary" style="position:relative; align-items: flex-start; overflow:hidden; display:flex; justify-content: space-between; margin-bottom: 4rem;">
    <div style="max-width:40em; padding: 2rem; flex:1">
      <div class="post-header" style="align:left;">
        <h3>
          <a :href="post.url">{{ post.title }}</a>
        </h3>
      </div>
      <div class=post-excerpt v-html="post.excerpt"></div>
      <Date :date="post.date" style="font-weight: 300; color: #999"/>
    </div>
    <img class="post-image" style="position:absolute; right:0; border-radius:3px; object-fit: cover; top: 50%; transform: translateY(-50%); height: 400px;width: 400px; border:0" :src="post.featureImageUrl" />
  </div>
</template>

<style scoped>
h3 {
  margin-top: 0;
}
</style>
