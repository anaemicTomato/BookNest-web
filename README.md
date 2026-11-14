# BookNest Web

React front end for the BookNest library management system.
React 19, Vite, Material UI (MUI), React Router. JavaScript, with a separate CSS file for each page's layout.

The API lives in the **booknest-api** repository and must be running while you work here.

## Requirements
- Node.js (current LTS) and npm
- The API running at https://localhost:7211 (see the booknest-api README)

## Run it
```bash
npm install
npm run dev
```
Open http://localhost:5173.

`vite.config.js` forwards every `/api/...` request to https://localhost:7211, so the code never uses the full API address and there are no CORS settings to manage. Restart `npm run dev` after editing `vite.config.js`.

## Test accounts (development only)
| Username | Password | Lands on |
|---|---|---|
| maria | maria123 | /member |
| juan | juan123 | /member |
| ana | ana123 | /staff (placeholder until built) |
| carlo | carlo123 | /admin (placeholder until built) |

## Scripts
| Command | What it does |
|---|---|
| `npm run dev` | start the dev server |
| `npm run build` | build for production |
| `npm run lint` | check the code with ESLint |

## Structure
```
src/
  api/         one file per resource (client.js holds the shared api() helper)
  auth/        AuthContext, ProtectedRoute
  components/  shared pieces (BookCard, BookCover, PageHeader, Toast, ConfirmDialog)
  layouts/     one layout per role (MemberLayout)
  pages/       Login, and one folder per role (member/, staff/, admin/)
  utils/       small helpers
  theme.js     colors, fonts and MUI component styles
docs/
  design/      screen designs and the flowchart
  database/    ERD
```

## Working on the project
Read the team guide (`TEAM-GUIDE.md` in the `docs/` folder) before you start.
Branch from `main`, open a pull request, and ask a teammate to review it.
