<script setup lang="ts">
import { useData } from 'vitepress'
import { data as posts } from './posts.data'

import PostSummary from './PostSummary.vue'

import './Posts.css'

const props = defineProps({
  level: {
    type: Number,
    default: 2 // Default heading level if not specified
  }
})
</script>

<template>
  <div class="posts-container">
    <ol class="posts-list">
      <li v-for="post of posts">
        <PostSummary :post="post" :level="level"/>
      </li>
    </ol>
  </div>
</template>


<style scoped>
@media (min-width: 640px) {
  div.posts-header p {
    font-size: 1.25rem;
    line-height: 1.75rem;
  }
}


@media (min-width: 1024px) {
  div.posts-container {
    padding-bottom: 4rem;
  }

  div.posts-header {
    max-width: 640px;
    margin-bottom: 4rem;
    text-align: center;
  }
}

:deep(h3) {
  color: var(--vp-c-text-1);
  font-size: 1.5rem;
  margin-top: 1.5rem;
  line-height: 2rem;
}

:deep(h3 a) {
  color: inherit;
  text-decoration: inherit;
}

ol.posts-list {
  padding-left: 0;
}

ol.posts-list li {
  list-style-type: none;
}

div.posts-container {
  margin-left: auto;
  margin-right: auto;
  max-width: 960px;
}

div.posts-header {
  margin-left: auto;
  margin-right: auto;
}

div.posts-header p {
  font-weight: 300;
  /* text-[color:var(--vp-c-text-light-1)] dark:text-[color:var(--vp-c-text-dark-1)] */
}

ol.posts-list li {
  margin-top: 4rem;
  border-top: 1px solid;
}

ol.posts-list li:first-child {
  margin-top: 2rem;
  border-top: none;
}

ol.posts-list div.post-excerpt-main {
  margin-bottom: auto;
}
</style>
