# CASA ROCCA — Website Starter + Zoho Books integration

A responsive multi-page static website starter using shared HTML templates, CSS, JavaScript, and a Google Apps Script connector for a Zoho Books product catalogue.

## Pages
- `index.html` — Home
- `products.html` — Product catalogue, search and filters
- `product-detail.html` — Product detail template
- `about.html` — About Us and Services
- `projects.html` / `project-detail.html` — Project references and detail template
- `catalog.html` — Catalog library
- `articles.html` / `article-detail.html` — Articles and detail template
- `contact.html` — Contact information, separate from About Us, with Showroom and Warehouse map embeds

## Start locally
Read `เริ่มต้นใช้งาน-อ่านก่อน.md`. Open the folder in VS Code and run `index.html` with Live Server. Keep `assets/` and `zoho-books-gas/` alongside the HTML files.

## Shared front-end files
- `assets/styles.css` — visual styling and responsive layout
- `assets/app.js` — page content, navigation, search/filter behaviour and optional Zoho product loader

## Zoho Books connector
The `zoho-books-gas/` folder contains Google Apps Script source and Thai setup instructions. The live integration is not active until OAuth Script Properties are configured, a first sync succeeds, and the Web App URL is added to `ZOHO_PRODUCTS_API` in `assets/app.js`. OAuth secrets must remain server-side.

## Before production
- Confirm public pricing and tax/display policy before showing Zoho Books `rate` to customers.
- Verify product image URLs and only publish approved product photography.
- Replace illustrative product/project/article images and confirm all claims against official source material.
- The contact form is currently demo-only and does not send or store submissions.
- Confirm business contact details, opening hours, Google Maps locations, and the data-centre URLs used by Zoho OAuth/API.
- The EN/TH switch is a placeholder; full translation and locale routing are not implemented.
