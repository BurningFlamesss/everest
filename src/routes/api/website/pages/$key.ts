import { createFileRoute } from '@tanstack/react-router'
import { getWebsitePage, updatePageSeo } from '@/lib/website-content'
import { actorFrom, getCurrentUser, requirePermission } from '@/lib/auth'
import type { WebsitePageKey } from '@/types'

export const Route = createFileRoute('/api/website/pages/$key')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const { key } = params
          const page = await getWebsitePage(key as WebsitePageKey)

          if (!page) {
            return Response.json({ error: 'Page not found' }, { status: 404 })
          }

          return Response.json({ page })
        } catch (error) {
          console.error('Failed to fetch website page:', error)
          return Response.json({ error: 'Failed to fetch page' }, { status: 500 })
        }
      },
      PATCH: async ({ params, request }) => {
        try {
          const user = await requirePermission(request, 'website.manage')
          const { key } = params
          const body = await request.json()
          const { seo } = body

          const page = await updatePageSeo(key as WebsitePageKey, seo, actorFrom(user))

          return Response.json({ page })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to update SEO'
          const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500
          if (status === 500) console.error('Failed to update page SEO:', error)
          return Response.json({ error: message }, { status })
        }
      },
    },
  },
})