<script setup lang="ts">
import { computed } from 'vue'
import { useData, useRoute } from 'vitepress'

import type { Post } from './posts.data'

import Date from './Date.vue'

const { frontmatter: data } = useData()

const props = defineProps({
  post: Object,
  level: {
    type: Number,
    default: 2 // Default heading level if not specified
  }
})
</script>


<template>
  <article class="post-summary" :data-level="level">
    <div class="content">
      <component :is="'h' + level">
        <a :href="post.url">{{ post.title }}</a>
      </component>
      <div
        v-if="post.excerpt"
        class="prose dark:prose-invert"
        v-html="post.excerpt"
      >
      </div>
      <div>
        <a aria-label="read more" :href="post.url">Read more →</a>
      </div>
    </div>
    <div :data-heading-level="level" class="meta">
      <Date :date="post.date"/>
    </div>
  </article>
</template>


<style scoped>
[data-heading-level] {
  --line-height: 1rem;
}

[data-heading-level="2"] {
  --publish-date-margin-top: calc(
    var(--heading-margin-top-2)
  );
}

[data-heading-level="3"] {
  --publish-date-margin-top: calc(
    var(--heading-margin-top-3)
  );
}

article div.content {
  max-width: 35em;
}

div.meta {
  display: flex;
  margin: 0;
  margin-top: 1em;
}

:deep(dl.publish-date dt),
:deep(dl.publish-date dd) {
  display: inline-block;
  vertical-align: top;
}

:deep(dl.publish-date dt) {
  text-align: right;
}

:deep(dl.publish-date dd) {
  margin-left: .5em;
}


@media(min-width: 960px) {
  article {
    display: flex;
    justify-content: space-between;
  }

  div.meta {
    margin-top: var(--publish-date-margin-top);
  }
}
</style>
