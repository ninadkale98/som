# Dr. Som Shahapurkar | OzzSom AI

The website for Dr. Som Shahapurkar and OzzSom AI. It replaces the old Wix site at shahapurkar.wixsite.com/website.

It is a plain static site: HTML, CSS and a little JavaScript. There is no build step, so GitHub Pages can serve it as is.

```
index.html       the whole site (one page)
styles.css       all styling; colors and fonts are set at the top
main.js          menu, contact form, and the animated wafer map in the hero
404.html         "page not found" page
assets/
  favicon.svg    browser tab icon
  og-image.png   preview image shown when the link is shared (1200×630)
  som.jpg        ← add Som's photo here (see below)
.nojekyll        tells GitHub Pages to serve the files exactly as they are
```

## Publish on GitHub Pages

The code lives in [github.com/ninadkale98/som](https://github.com/ninadkale98/som).

1. In the repository, open **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to *Deploy from a branch*, then choose branch `main` and folder `/ (root)`. Save.
3. After a minute or two the site is live at <https://ninadkale98.github.io/som/>. Every push to `main` updates it.

### Use a custom domain (optional)

1. In **Settings → Pages → Custom domain**, enter the domain (for example `www.ozzsom.ai`) and save. GitHub adds a `CNAME` file to the repo.
2. At your domain registrar, add the DNS records GitHub shows you. A `www` subdomain needs a CNAME record pointing to `<your-username>.github.io`. A bare domain needs the four GitHub A records.
3. When the domain is verified, tick **Enforce HTTPS**.

If you add a custom domain, also update the site address: in `index.html`, change `https://ninadkale98.github.io/som/` (4 places: `canonical`, `og:url`, `og:image` and the JSON-LD `"url"`), and in `404.html` change paths starting with `/som/` to start with `/`.

## Before launch

- [ ] **Add Som's photo.** Save a portrait as `assets/som.jpg`. A 4:5 crop at least 800×1000 px works best. It appears in the hero (small, round) and in the About section. Until the file exists, the site shows his initials instead.
- [ ] **Connect the contact form** (next section).
- [ ] **Confirm the facts** listed at the end of this file with Som.

## Connect the contact form

GitHub Pages only serves files, so the form sends messages through [Formspree](https://formspree.io), which has a free tier.

1. Sign up at formspree.io with the email address Som wants messages sent to.
2. Create a new form. Formspree gives you an endpoint like `https://formspree.io/f/abcdwxyz`.
3. In `index.html`, find `https://formspree.io/f/YOUR_FORM_ID` and replace `YOUR_FORM_ID` with your ID (`abcdwxyz` in this example).
4. Push the change. Submit a test message from the live site and confirm it arrives. Formspree asks you to verify the first submission by email.

Until the ID is filled in, the form shows "This form isn't connected yet" and points visitors to LinkedIn.

The form sends name, email, organization (optional), topic (Advisory, Speaking, Teaching or Something else) and message. It includes a hidden `_gotcha` field that blocks most spam bots.

## Editing content

All the text is in `index.html`, in this order: hero, About, "What sensible means in practice", Advisory ("How Som can help"), Writing, Speaking, Contact. Each section starts with an HTML comment such as `<!-- About -->`.

- **Add an article:** copy one `<li>` inside `<ul class="article-list">` and change the link, title and description.
- **Add a talk:** copy one `<li>` inside `<ol class="timeline">`. Keep the list newest first.
- **Change colors:** edit the variables at the top of `styles.css` (`--accent`, `--brass`, and so on). The wafer map reads the same variables.

Fonts are Spectral (headlines) and Hanken Grotesk (text), loaded from Google Fonts. Both are free under the SIL Open Font License.

## The wafer map

The hero animation is a semiconductor wafer map, a nod to Som's first patent, which applied AI to chip manufacturing. When the page loads, the chips start as random noise and a sweep settles them into a clear pattern, with the flagged chips highlighted in brass. It plays once, then responds only to the pointer. Visitors who have turned on "reduce motion" in their system settings see the settled map straight away.

## Facts to confirm with Som

The old site's content dates from about 2018. The new site combines it with his University of San Diego faculty page and a 2023 podcast. Please check these points:

1. **Current title.** The site calls him "Founder, OzzSom AI". His USD page lists him as Director of AI Products at FICO. Which is current, and should both appear?
2. **"Two decades" of experience.** USD says a 20-year career, and that page was last updated in early 2024.
3. **Boards:** Core Strengths, IBIL Global and the University of San Diego. These came from the old site. Are they still current?
4. **Teaching:** Adjunct Professor of AI at USD (MS in Applied AI) and AI instructor for UCSD's Executive Perspective for Scientists & Engineers program.
5. **Patent claim:** his first patent is cited by 11 of Google's earliest AI/ML patents (from the USD bio).
6. **Advisory services and principles.** These are new copy written from his background and talks, not taken from the old site. Som should check they match how he works.
7. **Missing article link.** The old site's "Facebook: Software or Media Company?" link pointed to the wrong article, so it's left out. Add it back if you can find the right URL.
8. **Recent talks.** The speaking list stops at a 2023 podcast. Add anything newer.
9. **Logo.** The header uses a text wordmark with a small wafer icon. If Som wants the original OzzSom logo, send the file and it can replace the icon.
