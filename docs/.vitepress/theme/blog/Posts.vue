<script setup lang="ts">
import { useData } from 'vitepress'
import { data as posts } from './posts.data'

import PostSummary from './PostSummary.vue'

import './Posts.css'

const { theme: themeConfig } = useData()
</script>

<template>
  <div class="posts-container">
    <div class="posts-list">
      <PostSummary :post="post" v-for="post of posts"/>
    </div>
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
  font-size: 1.5rem;
  margin-top: 1.5rem;
  line-height: 2rem;
}

div.posts-container {
  margin-left: auto;
  margin-right: auto;
  max-width: 1152px;
}

div.posts-header {
  margin-left: auto;
  margin-right: auto;
}

div.posts-header p {
  font-weight: 300;
  /* text-[color:var(--vp-c-text-light-1)] dark:text-[color:var(--vp-c-text-dark-1)] */
}

div.posts-list > div {
  background-color: var(--bg-color-posts);
  border-radius: 0.3rem;
  border: 1px solid var(--border-color-posts);
  box-shadow: 0px 0px 4px var(--border-color-posts);
  box-sizing: border-box;
  display: block;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  text-rendering: optimizelegibility;
}

div.posts-list article {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

div.posts-list div.post-excerpt-main {
  margin-bottom: auto;
}

:deep(dl.publish-date) {
  margin: 0;
}

:deep(dl.publish-date dt),
:deep(dl.publish-date dd) {
  display: inline-block;
  vertical-align: top;
}

:deep(dl.publish-date dt) {
  margin-right: .25em;
  text-align: right;
}

:deep(dl.publish-date dd) {
  margin: 0;
}
</style>
