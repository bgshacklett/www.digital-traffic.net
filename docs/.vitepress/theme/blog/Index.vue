<script setup>
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'

const { page, frontmatter } = useData()
const { Layout: DefaultLayout } = DefaultTheme
</script>


<template>
  <DefaultLayout>
    <template #page-top>
      <div style="max-width: 1152px; margin: 0 auto">
        <h1 style="font-size: 2rem; margin-top: 2rem; margin-bottom: 1rem; line-height: 6rem;">The Brain Dump</h1>
      </div>
    </template>
  </DefaultLayout>
</template>
