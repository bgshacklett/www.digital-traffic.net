<script setup lang="ts">
import type { Post } from './posts.data.js'

const props = defineProps<{ date: Post['date'] }>()

function getDateTime() {
  return new Date(props.date.time).toISOString()
}
</script>

<template>
  <dl class="publish-date">
    <dt>Published on</dt>
    <dd>
      <time :datetime="getDateTime()">{{ date.string }}</time>
    </dd>
  </dl>
</template>
