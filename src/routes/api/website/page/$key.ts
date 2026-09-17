import { createFileRoute } from '@tanstack/react-router'
import { getPublishedPage } from '@/lib/website-content'
import type { WebsitePageKey } from '@/types'

export const Route = createFileRoute('/api/website/page/$key')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const { key } = params
          const page = await getPublishedPage(key as WebsitePageKey)
          
          if (!page) {
            return Response.json({ error: 'Page not found' }, { status: 404 })
          }
          
          return Response.json({ page })
        } catch (error) {
          console.error('Failed to fetch website page:', error)
          return Response.json({ error: 'Failed to fetch page' }, { status: 500 })
        }
      },
    },
  },
})