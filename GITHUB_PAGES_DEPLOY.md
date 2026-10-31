# Publish the Data Lab at ditchn.com

These steps prepare a new public website. The files in this package do not change GitHub, Cloudflare DNS, or the NAS on their own. Do not change existing `ditchn.com` web DNS records until you have reviewed the GitHub Pages preview and any current use of the domain. Email DNS records are separate and should be left intact.

## 1. Preview the source

Open the package folder in VS Code. With Node.js 22 or newer, run `npm run check`, `npm run smoke`, and `npm run dev`; visit <http://127.0.0.1:4173>. The site currently contains an intentional empty state because there is no real project to publish. Add one using the README and preview it before public launch.

## 2. Create a repository

In your `ditchn` GitHub account, create a repository such as `ditchn-data-lab`. A public repository works with GitHub Pages on GitHub Free; plan support differs for private repositories. Start it empty (no auto-generated README), then push this source folder from VS Code or a terminal:

```bash
git init
git branch -M main
git add .
git commit -m "Initial Data Lab site"
git remote add origin https://github.com/ditchn/ditchn-data-lab.git
git push -u origin main
```

If you choose a different repository name, use it in the remote URL and preview URL below. Review `git status` before committing to confirm no original datasets or secrets were added.

## 3. Enable the preview URL

In the GitHub repository, open **Settings → Pages → Build and deployment** and set **Source** to **GitHub Actions**. The committed workflow `.github/workflows/pages.yml` builds the static pages and deploys them after a push to `main`. Check the **Actions** tab for a successful run. Before switching the domain, open the default project URL, typically `https://ditchn.github.io/ditchn-data-lab/`, and inspect the home page, project links, report, sources, and downloads. GitHub's default URL uses the repository path; this source uses relative site links so the preview also works there.

## 4. Point ditchn.com to the approved site

First confirm whether `ditchn.com` or `www.ditchn.com` currently serves a site. In **Settings → Pages**, configure `ditchn.com` as the custom domain and follow GitHub's domain verification instructions. GitHub recommends setting the custom domain in repository settings before changing DNS. Then, wherever you manage DNS (possibly Cloudflare), update only the relevant web records to GitHub Pages' documented targets and verify that Pages enables HTTPS. You may also configure `www` and the redirect you prefer. DNS changes may take time to propagate. Do not change MX or other email records.

Official guide: <https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site>

## Day-to-day workflow

1. Run analysis on your laptop, or set up a project-specific GitHub Actions render step when its dependencies are known.
2. Review the generated report and approved data. Add or update its project JSON and files in a branch.
3. Review the preview locally and merge to `main`. GitHub Actions deploys the portfolio. Visitors use `ditchn.com`; the GitHub repository remains an optional code link for advanced readers.
4. Keep source data and backups on the NAS. A project report in this static site is public even when the repository is private under plans that allow Pages from private repositories; publish only approved content.

To preserve invite-only publishing, invite specific GitHub collaborators and protect `main` with your preferred review rules. The public site has no editor login, Docker container, Cloudflare Tunnel, Access AUD, or NAS port forwarding.
