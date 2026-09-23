import { createServerFn } from "@tanstack/react-start";
import { latency } from "#/lib/db";
import Parser from "rss-parser";

export interface FacebookPost {
  id: string;
  message: string;
  created_time: string;
  full_picture?: string;
  permalink_url: string;
}

const parser = new Parser({
  customFields: {
    item: [
      ['description', 'message'],
      ['pubDate', 'created_time'],
      ['link', 'permalink_url'],
      ['enclosure', 'full_picture']
    ],
  },
});

export const getFacebookPostsServer = createServerFn({ method: "GET" })
  .validator((data: { page: number; pageSize: number }) => data)
  .handler(async ({ data: { page, pageSize } }) => {
    
    // Configurable via `.env`
    // e.g. VITE_FACEBOOK_RSS_URL="https://rss.app/feeds/v1.1/tYOUR_CODE.xml"
    const FACEBOOK_RSS_FEED_URL = process.env.VITE_FACEBOOK_RSS_URL || "";
    
    let fetchedPosts: FacebookPost[] = [];
  
    if (FACEBOOK_RSS_FEED_URL) {
      try {
        const feed = await parser.parseURL(FACEBOOK_RSS_FEED_URL);
        fetchedPosts = feed.items.map((item, index) => {
          let pic = item.enclosure?.url;
          if (!pic && item.message) {
            const imgMatch = item.message.match(/<img[^>]+src="([^">]+)"/);
            if (imgMatch) pic = imgMatch[1];
          }

          const cleanMessage = item.message ? item.message.replace(/<[^>]*>?/gm, '').trim() : '';

          return {
            id: item.guid || `rss_post_${index}`,
            message: cleanMessage || item.title || "",
            created_time: item.created_time || new Date().toISOString(),
            permalink_url: item.permalink_url || "https://facebook.com/eebssbutwal",
            full_picture: pic
          };
        });
      } catch (error) {
        console.warn("Failed to fetch custom RSS feed, falling back to cached dummy data.", error);
      }
    }

    if (fetchedPosts.length === 0) {
      await latency(600);
      const dummyPosts: FacebookPost[] = [
        {
          id: "post_real_1",
          message: "🎉 Wishing all our amazing students and parents a fantastic start to the new academic year at Everest English Boarding Secondary School! Let's make this year our best one yet. #EEBSS #BackToSchool",
          created_time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
          permalink_url: "https://facebook.com/eebssbutwal",
          full_picture: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80"
        },
        {
          id: "post_real_2",
          message: "Notice: The First Terminal Examinations schedule has been published. Students are requested to collect their admit cards from the administration desk before Friday. Best of luck with your preparations! 📚✏️",
          created_time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
          permalink_url: "https://facebook.com/eebssbutwal",
        },
        {
          id: "post_real_3",
          message: "🏆 Huge congratulations to our school's debate team for securing the 1st runner-up position in the Butwal Inter-School Regional Championships!",
          created_time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(),
          permalink_url: "https://facebook.com/eebssbutwal",
          full_picture: "https://images.unsplash.com/photo-1577896851221-a47738f71f65?w=800&q=80"
        },
        {
          id: "post_real_4",
          message: "Everest EBSS Sports Week 2026 kicks off tomorrow! 🏃♂️🏅 All participating students must report to the ground by 8:00 AM sharp.",
          created_time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
          permalink_url: "https://facebook.com/eebssbutwal",
          full_picture: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80"
        }
      ];

      const paddingPosts = Array.from({ length: 42 }).map((_, i) => ({
        id: `post_generic_${i}`,
        message: `A community update from Everest English Boarding Secondary School (#${i + 5}). Stay tuned for more announcements, events, and community updates!`,
        created_time: new Date(Date.now() - i * 1000 * 60 * 60 * 24 - (1000 * 60 * 60 * 24 * 15)).toISOString(), 
        permalink_url: "https://facebook.com/eebssbutwal",
        ...(i % 3 !== 0 && { full_picture: `https://picsum.photos/seed/${i + 80}/600/400` })
      }));

      fetchedPosts = [...dummyPosts, ...paddingPosts];
    }

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const sliced = fetchedPosts.slice(start, end);
    
    return {
      data: sliced,
      nextCursor: end < fetchedPosts.length ? page + 1 : null,
    };
});
