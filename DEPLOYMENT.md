# Deployment Guide for Touhou 6.7

This guide will help you put your game online so others can play it. Since this game is a static web application (HTML, CSS, and JavaScript), it is very easy to host for free.

## Option 1: GitHub Pages (Recommended)

This is the easiest option if you plan to save your code on GitHub.

1.  **Initialize Git (if you haven't already)**

    - Open your terminal in this folder.
    - Run: `git init`
    - Run: `git add .`
    - Run: `git commit -m "Initial commit"`

2.  **Create a Repository on GitHub**

    - Go to [github.com/new](https://github.com/new).
    - Name it something like `touhou-web` or `touhou67`.
    - Make it **Public** (required for free GitHub Pages).
    - Do **not** check "Add a README", ".gitignore", or "license" (we already have local files).
    - Click **Create repository**.

3.  **Push your code**

    - Copy the commands under "…or push an existing repository from the command line". They will look like this:
      ```bash
      git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
      git branch -M main
      git push -u origin main
      ```
    - Run those commands in your terminal.

4.  **Enable GitHub Pages**

    - Go to your repository page on GitHub.
    - Click **Settings** (top right tab).
    - On the left sidebar, click **Pages**.
    - Under **Build and deployment** -> **Source**, select **Deploy from a branch**.
    - Under **Branch**, select `main` and `/ (root)`.
    - Click **Save**.

5.  **Play!**
    - Wait about 1-2 minutes.
    - Refresh the page. You will see a link like `https://your-username.github.io/touhou-web/`.
    - Click it to play!

---

## Option 2: Cloudflare Pages

This is also an excellent free option and often faster.

1.  **Push to GitHub** (Follow steps 1-3 above).
2.  **Log in to Cloudflare**
    - Go to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
    - Go to **Workers & Pages** -> **Pages**.
    - Click **Connect to Git**.
3.  **Deploy**
    - Select your GitHub repository (`touhou-web`).
    - Click **Begin setup**.
    - **Project Name**: Keep default or change it.
    - **Framework Preset**: Select `None` (since this is vanilla JS).
    - **Build command**: Leave blank.
    - **Build output directory**: Leave blank (or put `.` if it asks).
    - Click **Save and Deploy**.

Cloudflare will build it instantly and give you a URL like `https://touhou-web.pages.dev`.

---

## Option 3: Manual Upload (Netlify)

If you don't want to use Git commands:

1.  Go to [app.netlify.com/drop](https://app.netlify.com/drop).
2.  Drag and drop your entire `touhou67` folder onto the page.
3.  It will upload and give you a live link immediately.

## Important Note on Paths

This project uses relative paths (e.g., `src="js/game_main.js"`), so it should work automatically on any of these services, even if hosted in a subdirectory.
