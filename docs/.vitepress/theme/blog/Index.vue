<script setup>
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'

const { page, frontmatter } = useData()
const { Layout: DefaultLayout } = DefaultTheme
</script>


<template>
  <DefaultLayout>
    <template #home-hero-after>
      <div class="title" style="">
        <h1>#brain-dump</h1>
      </div>
    </template>
  </DefaultLayout>
</template>


<style scoped>
h1 {
  margin: revert;
  line-height: 4rem;
  font-size: 4rem;
  color: var(--vp-c-brand-1);
  font-weight: 700;
}

div.title {
  max-width: calc(960px + 128px);
  margin: 0 auto;
  margin-top: calc((var(--vp-nav-height) + var(--vp-layout-top-height, 0px)) + 4rem);
  margin-bottom: 6rem;
  padding: 0 24px;
}

@media (min-width: 640px) {
  div.title {
    padding: 0 48px;
  }
}

@media (min-width: 960px) {
  div.title {
    padding: 0 64px;
  }
}
</style>
