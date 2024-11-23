<script setup lang="ts">
import { computed } from 'vue'
import { useData, useRoute } from 'vitepress'
import { data as posts } from './posts.data'

import Date from './Date.vue'

const { frontmatter } = useData()

const route = useRoute()

function findCurrentIndex() {
  return posts.findIndex((p) => p.url === route.path)
}

// use the customData date which contains pre-resolved date info
const date = computed(() => posts[findCurrentIndex()].date)
const nextPost = computed(() => posts[findCurrentIndex() - 1])
const prevPost = computed(() => posts[findCurrentIndex() + 1])
</script>

<template>
  <div class="post-navigation">
    <a v-if="prevPost" :href="prevPost.url" class=""> Previous Post</a>
    <a v-if="nextPost" :href="nextPost.url" class="">Next Post</a>
  </div>
</template>

<style scoped>
</style>
