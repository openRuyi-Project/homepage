# openRuyi Website

Guten Tag! This is openRuyi's website code & documents repo.

## Getting Started

This project uses [Docusaurus](https://docusaurus.io).

### Installation

1. Clone this repository.
2. Change into the folder you just cloned into.
3. Run `npm ci` to install the project dependencies.
4. Run `npm run start:en` to start an English development server on `localhost:3000`.
5. (Optional) Run `npm run start:zh` to start a zh-Hans development server.
6. Run `npm run build` to generate static content into the `build` directory.
7. (Optional) Run `npm run preview` to preview the production build and test locale switching.
8. (Optional) Run `npm run build -- --locale zh-Hans` to build only zh-Hans.
9. (Optional) Run `npm run build -- --locale en` to build only English.
10. (Optional) Run `npm run write-translations -- --locale zh-Hans` to edit and update zh-Hans translations.

> Note: Docusaurus dev server (`start`) runs one locale at a time. Switching locale in dev mode may return 404 if that locale server is not running. Use `start:en` / `start:zh` for locale-specific development, or `npm run preview` to test cross-locale navigation.

## Run with GHCR Image

This repository publishes a container image to GHCR:

- `ghcr.io/openruyi-project/homepage:latest` (default branch)
- `ghcr.io/openruyi-project/homepage:sha-<commit>`
- `ghcr.io/openruyi-project/homepage:<version>` (for example, `1.2.3`)
- `ghcr.io/openruyi-project/homepage:<major>.<minor>` (for example, `1.2`)

Run directly:

```bash
docker run --rm -p 8080:80 ghcr.io/openruyi-project/homepage:latest
```

Then open <http://localhost:8080>.

## License

This project is licensed under the [Mulan Permissive Software License v2](./LICENSE) (MulanPSL-2.0).
