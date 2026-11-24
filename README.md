# LabelPilot

Product Barcode & Price Label Manager for a single business workspace.

## Start

```powershell
npm install
Copy-Item .env.example .env
# In pgAdmin, create a database named labelpilot.
# Edit .env: set the PostgreSQL password, generate a session secret, and choose admin email/password.
npm run db:generate
npm run db:migrate
npm run db:seed
npm run server
```

In a second terminal, run `npm run dev` and open `http://localhost:5174`. The UI sends authenticated workspace saves to the Express API; Vite proxies `/api` to port 3001. On first login, an existing `labelpilot_v1` browser workspace is imported if the database snapshot is empty. Afterward, PostgreSQL is the saved copy.

## Free hosting and CI/CD (Render + Neon)

The repository includes `render.yaml` for a single Render Node web service. Express serves both the built React app and `/api` from the same origin so the secure login cookie works. The hosted database is external PostgreSQL from Neon. Render's free web service can sleep after inactivity and has an ephemeral filesystem; workspace data belongs in PostgreSQL, not local files.

1. Export `barcodes.csv` from your local app before moving. The hosted site has a separate browser origin and cannot automatically read the local PostgreSQL database. Import the CSV after deployment; re-enter your business profile and settings.
2. Create a GitHub repository and upload this project. Never upload `.env`; it is ignored by Git.
3. Create a Neon PostgreSQL project and copy its PostgreSQL connection string with SSL enabled.
4. In Render, choose **New → Blueprint**, connect the GitHub repository, and let Render read `render.yaml`. Provide the Neon connection string for `DATABASE_URL`. Render generates `SESSION_SECRET` and the one-time `ADMIN_SETUP_TOKEN`.
5. GitHub Actions runs `npm ci`, Prisma generation, the production build, and the project tests on pushes and pull requests to `main`. Render is configured to deploy only after those CI checks pass.
6. After the first deployment, create the single admin once from PowerShell, replacing the site URL, email and password. Copy `ADMIN_SETUP_TOKEN` from Render's service environment, then run:

   ```powershell
   $setupToken = 'PASTE_ONE_TIME_TOKEN_HERE'
   $body = @{ email = 'you@example.com'; password = 'USE_A_UNIQUE_PASSWORD_OF_12_OR_MORE_CHARACTERS'; setupToken = $setupToken } | ConvertTo-Json
   Invoke-RestMethod -Uri 'https://YOUR-SITE.onrender.com/api/auth/setup' -Method Post -ContentType 'application/json' -Body $body
   ```

7. Remove `ADMIN_SETUP_TOKEN` from Render's environment after setup, save and redeploy, then sign in. Keep the database and session secrets private. Future commits run CI and deploy automatically after checks pass.

Render's free web service may take about a minute to wake after 15 minutes idle. Free hosting tiers and limits can change; check Render and Neon pricing before relying on them for daily business operations. For production use, choose an always-on app service and confirm automated database backups.

## Features in this build

- Responsive workspace dashboard with real counts from the current catalog.
- Product creation, editing, duplication, search, category filtering, status, and soft user-facing delete confirmation.
- Permanent sequential internal Code 128 barcode assignment; SVG barcode preview and print output.
- Independent LKR and CHF cost/retail price fields. New retail CHF can be calculated from the LKR price using the saved CHF→LKR reference rate, or entered manually. The saved CHF price is never recalculated when the reference rate changes.
- Product and price management, categories, brands, barcode generation, label printing, and currency controls.
- Thermal label preview and browser printing with a permanent Code 128 barcode plus a phone-camera QR code carrying product and price details. Label dimensions and portrait/landscape settings affect the browser print output.
- Product CSV and XLSX import/export. Imports generate unique SKUs and permanent sequential barcodes whenever either field is blank.

## Database foundation

`prisma/schema.prisma` defines the PostgreSQL entities, relationships, indexes, soft-delete fields, decimal price storage, product/batch constraints, and audit/print history tables. Copy `.env.example` to `.env`, set your PostgreSQL URL and secrets, then run `npm run db:generate`, `npm run db:migrate`, and `npm run db:seed`. The seed requires a unique administrator email and password from environment variables and refuses to create a second administrator.

The Express API includes health, single-admin login/logout/session/password-change endpoints, protected product CRUD and workspace snapshot load/save, server-allocated Code 128 barcodes, request validation, and audit events. The workspace snapshot is stored in PostgreSQL's `SystemSetting` JSON column. The seed reads `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env`, hashes the password with Argon2id, and refuses to create a second administrator. It prints no credentials.

PostgreSQL credentials are not included in this project. Set the `DATABASE_URL` password to the password already configured for your local PostgreSQL server. Keep `.env` private and do not commit it. If PostgreSQL is on another machine, use its reachable host and a dedicated database account in `DATABASE_URL`.

## Imports

CSV and XLSX imports accept a `Product` or `Name` column; SKU and Barcode are optional and are generated automatically when blank. Optional columns include `Category`, `Brand`, `Weight`, `Unit`, `Retail price (LKR)`, and `Retail price (CHF)`. Duplicate SKUs and barcodes, blank rows, and rows missing product names are skipped. CSV export includes product, barcode, category, and both retail price columns.

## Barcode and exchange-rate notes

Generated identifiers use the `200000000001` sequence pattern. This browser-local sequence is not safe for concurrent or cross-device allocation; production barcode generation must move to a database transaction/sequence. Rate data is indicative and for reference only; it is not a guaranteed settlement rate.
