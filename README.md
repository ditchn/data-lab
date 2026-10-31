# Bill Ditchman · Data Lab

A static portfolio for `ditchn.com`. Visitors read project summaries and follow self-contained interactive reports, sources, approved downloads, and optional GitHub code links. Node builds HTML pages; there is no server-side Python, database, NAS container, or public editor endpoint.

**Status:** The site has no real projects yet. The example under `examples/` is a template and is never published by the build.

## Preview in VS Code

Install Node.js 22 or newer, open this folder, and run:

```bash
npm run check
npm run smoke
npm run dev
```

Open <http://127.0.0.1:4173>. The `dev` command builds once and serves the generated `dist/` folder; rerun it after editing content. `npm run build` writes deployable files to `dist/` without installing dependencies. Do not commit `dist/`.

## Publish your first project

1. Copy `examples/project.template.json` to `content/projects/<slug>.json`. Replace every placeholder with real, approved content. The `slug` value must match the filename. The `findings` field supports paragraphs separated by blank lines.
2. Put a self-contained HTML report at `public/reports/<slug>/index.html`. Put only approved public datasets and report resources under `public/reports/<slug>/`. The example's report and download URLs must match files there. You may instead use an HTTPS URL for a report hosted elsewhere.
3. Document **original data sources** in `sources`. `codeUrl` is the optional GitHub repository for readers who want the implementation; it does not replace source documentation.
4. Run `npm run build` and `npm run smoke`, preview locally, and inspect every linked report and download. The build stops on broken local report paths and invalid URL schemes. Files anywhere under `public/` are copied into the public site; never put private data, tokens, or unreviewed exports there.
5. Publish by merging the change to `main`. The GitHub Actions workflow builds the site and deploys it to GitHub Pages. Keep drafts on a branch or pull request; every push to `main` starts a public deployment.

The current workflow builds the portfolio from already-rendered static reports. When you have a real Quarto/Python/R project, add its install and render commands to `.github/workflows/pages.yml` **before** the `Validate and build site` step, writing the approved output into `public/reports/<slug>/`. GitHub Actions will do that compute on its runner, not on your NAS. The exact render command depends on your first project; no hypothetical analysis pipeline is enabled here.

## Layout

- `content/projects/*.json`: published project pages, one file per project.
- `public/reports/`: approved self-contained HTML and downloads, copied as-is.
- `public/styles.css`: site design; `public/site.js`: project search.
- `scripts/build.mjs`: validates content and creates HTML in `dist/`.
- `.github/workflows/pages.yml`: build and publish after a push to `main`.

There is no visitor account or browser editing studio. Invite editors to the GitHub repository and use pull requests for review. The NAS can continue holding original datasets and backups without hosting the public website.

See [GITHUB_PAGES_DEPLOY.md](GITHUB_PAGES_DEPLOY.md) for repository and domain setup. The earlier NAS 3.0 app is a separate prototype and is not part of this deployment.
