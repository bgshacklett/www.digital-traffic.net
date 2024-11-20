// posts.data.ts
import { createContentLoader } from 'vitepress'

interface Post {
  title: string
  category: string | null
  url: string
  date: {
    time: number
    string: string
  }
  excerpt: string | undefined
  featureImageUrl: string | undefined
}

declare const data: Post[]
export { Post, data }

export default createContentLoader('blog/posts/*.md', {
  excerpt: '<!-- more -->',
  transform(raw): Post[] {
    return raw
      .map(({ url, frontmatter, excerpt }) => ({
        title: frontmatter.title,
        category: frontmatter.category ?? 'Article',
        url,
        excerpt,
        featureImageUrl: frontmatter.featureImageUrl ?? undefined,
        date: formatDate(frontmatter.date)
      }))
      .sort((a, b) => b.date.time - a.date.time)
  }
})

function formatDate(raw: string): Post['date'] {
  const date = new Date(raw)
  date.setUTCHours(12)
  return {
    time: +date,
    string: date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
}
