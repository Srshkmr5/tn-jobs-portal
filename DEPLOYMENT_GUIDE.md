# Deployment Guide for srshkmr.co.in

This guide explains how to connect and deploy the **TN Career Compass (Tamil Nadu Public Job Portal)** to your domain **`srshkmr.co.in`**.

Because the portal is built as a lightweight, lightning-fast static web app (`index.html`, `style.css`, `app.js`, `data/jobs.json`), you can host it **100% free with unlimited bandwidth and automatic SSL (HTTPS)**.

---

## Option 1: Deploy with Cloudflare Pages (Recommended - Free, Global CDN)

Cloudflare Pages provides world-class DDOS protection, zero egress costs, and fast DNS resolution.

1. **Push to GitHub**:
   - Create a GitHub repository (e.g. `tn-jobs-portal`) and push the contents of the `portal/` folder.
2. **Connect to Cloudflare**:
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com) and click **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**.
   - Select your repository.
   - Build settings:
     - Framework preset: `None`
     - Build output directory: `.` (or `portal` if in a subfolder).
   - Click **Save and Deploy**.
3. **Link `srshkmr.co.in`**:
   - In Cloudflare Pages, go to **Custom Domains** -> **Set up a custom domain**.
   - Enter `srshkmr.co.in` (or `jobs.srshkmr.co.in`).
   - Cloudflare will give you the exact CNAME or A-records to paste into your **Hostinger DNS zone**.

---

## Option 2: Deploy Directly onto Hostinger Web Hosting

If you already have a Web Hosting plan active on your Hostinger account along with the domain:

1. Log in to [Hostinger hPanel](https://hpanel.hostinger.com).
2. Go to **Websites** -> select `srshkmr.co.in` -> click **File Manager**.
3. Open the `public_html` folder.
4. Upload all files from the `portal/` directory:
   - `index.html`
   - `style.css`
   - `app.js`
   - `data/jobs.json`
5. Visit `https://srshkmr.co.in` — your live portal will be running immediately!

---

## Option 3: Deploy with Vercel (Free & Instant)

1. Run in terminal:
   ```bash
   cd portal
   npx vercel
   ```
2. Follow the 3 prompts to deploy.
3. In your Vercel Project Settings -> **Domains**:
   - Add `srshkmr.co.in`.
   - Vercel will give you the DNS A-record to add in your Hostinger DNS management page.

---

## Keeping Job Postings Fresh Automatically

Run the maintenance script anytime:
```bash
# Check deadline health
node portal/update-jobs.mjs

# Automatically archive expired jobs
node portal/update-jobs.mjs --archive

# View live sector metrics
node portal/update-jobs.mjs --stats
```
