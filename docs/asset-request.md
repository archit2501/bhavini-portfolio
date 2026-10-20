# What we need from Bhavini

The site is built so every missing photo falls back to a text tile, and every figure stays out of the live site until she confirms it. This list is everything that would replace a placeholder or unblock launch.

## Message to send

> Hi Bhavini! We're building your portfolio site. It's laid out like a social profile: highlights that open as stories, a post grid, and a few short reels. To finish it we need a few things from you.
>
> **Please confirm or correct (a reply in writing is enough):**
>
> 1. The figures below, exactly as they'll appear on the site.
> 2. For the $100K+ revenue: is that booked contract value or money collected?
> 3. Should your F1Jobs.io sales be described as B2B, D2C, or both?
> 4. The email address you'd like on the Contact button (a personal one, not your work alias).
> 5. The domain you'd like for the site, for example bhavinimalhotra.com.
>
> **Please send, if you have them:**
>
> 6. Your latest resume as a PDF.
> 7. A high-resolution headshot (at least 1080 px wide), plus 2–3 candid photos of you.
> 8. Vastra Kala: product or dispatch photos, and whether we may show the brand name and logo.
> 9. Youth for Parivarthan: photos from the clean-up drives (only ones where everyone is happy to be shown).
> 10. Christ University: a campus or Student Council photo.
> 11. Certificate images and verification links for HubSpot Academy and NPTEL.
> 12. Any reels or posts you made for @f1jobs.io that you'd like to feature (with the company's OK).
> 13. Any LinkedIn recommendations you'd like quoted. We'll show the person's name and role, and only real quotes.
>
> Nothing is needed from the clinical internship. That section stays text-only to protect patient privacy.
>
> If something isn't available, just say so and we'll keep the text version.

## Figures to confirm

| Figure as shown                     | Where                 | Confirmed |
| ----------------------------------- | --------------------- | --------- |
| $100K+ revenue                      | F1Jobs.io             | ☐         |
| 7+ deals                            | F1Jobs.io             | ☐         |
| 65% workflow gain                   | F1Jobs.io             | ☐         |
| 20+ customer tickets resolved       | F1Jobs.io             | ☐         |
| 5+ global regions                   | Vastra Kala           | ☐         |
| 100+ units a month                  | Vastra Kala           | ☐         |
| 5+ clean-up drives                  | Youth for Parivarthan | ☐         |
| 20–30 volunteers per drive          | Youth for Parivarthan | ☐         |
| 50+ community members engaged       | Youth for Parivarthan | ☐         |
| 20+ therapy and assessment sessions | ANR Hospital          | ☐         |
| 4+ case histories                   | ANR Hospital          | ☐         |
| 8–12 intake interviews              | ANR Hospital          | ☐         |
| 8.81 CGPA                           | Christ University     | ☐         |

When she confirms a figure, set `"verified": true` for it in `src/content/figures.json`. The deploy build refuses to publish while any figure is still unverified.

## Where each item goes

| Item               | Replaces                                         | Task         |
| ------------------ | ------------------------------------------------ | ------------ |
| Figures, wording   | `verified` flags, bio, captions                  | 2.3.1        |
| Email, resume PDF  | Contact button and Resume link in the header     | 1.2.2        |
| Domain             | `public/CNAME`, `SITE_URL`                       | 2.3.2        |
| Headshot           | Avatar, intro story                              | 1.2.2, 2.1.3 |
| Candid photos      | "Face of F1Jobs.io" post, F1Jobs highlight       | 2.1.3        |
| Vastra Kala photos | Two Vastra Kala posts and highlight              | 2.1.3        |
| Clean-up photos    | Youth for Parivarthan post and Volunteer stories | 2.1.3        |
| Campus photo       | Christ University and Student Council posts      | 2.1.3        |
| Certificates       | HubSpot and NPTEL posts, Certs highlight         | 2.1.3        |
| F1Jobs reels       | Reels tab, next to the stat reels                | 2.2.1        |
| LinkedIn quotes    | Comments under posts (named, real testimonials)  | 2.1.1        |
