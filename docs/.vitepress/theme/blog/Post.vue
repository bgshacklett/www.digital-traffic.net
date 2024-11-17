<script setup lang="ts">
import { computed } from 'vue'
import { useData, useRoute } from 'vitepress'

import type { Post } from './posts.data'

import PostIcon from './PostIcon.vue'
import Date from './Date.vue'

const { frontmatter: data } = useData()

const route = useRoute()

const props = defineProps<{ post: Post }>()
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-1 text-gray-500">
      <span class="bg-primary-100 text-sm font-medium inline-flex items-center rounded" >
        <PostIcon :category="post.category" />
      </span>
      <span class="text-sm"><Date :date="post.date"/></span>
    </div>
    <h3 class="mb-2 mt-2 text-2xl font-bold tracking-tight text-[color:var(--vp-c-brand-light)] dark:text-[color:var(--vp-c-brand-dark)]">
      <a :href="post.url">{{ post.title }}</a>
    </h3>
    <div class=post-excerpt v-html="post.excerpt"></div>
  </div>
</template>

<style scoped>
</style>
