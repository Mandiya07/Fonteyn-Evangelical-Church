# Fonteyn Evangelical Church System Architecture (V2 Expansion)

This document outlines the system architecture for the future expansion of the Fonteyn Evangelical Church digital platform.

## Proposed Ecosystem

The platform is designed to scale dynamically from a single branch monolithic SPA to a multi-tenant, loosely-coupled microservice ecosystem supporting educational institutions, media stations, and community services.

### 1. Core Church Operations
- **System**: Web-based Headless CMS and API Backend
- **Features**: Memberships, Tithes/Donations, Analytics, Events, Multi-branch reporting
- **Hosting Strategy**:
  - **Option A (Next.js / React)**: Highly-scalable edge-rendered frontend (Vercel/Cloud Run) with PostgreSQL (Cloud SQL/Supabase).
  - **Option B (PHP / Laravel)**: Robust Monolith with Livewire for dynamic parts, easily deployed to AWS EC2 or DigitalOcean.
  - **Option C (WordPress)**: Rapid deployment and high extensibility for non-technical administrators (using WP Rest API + React Frontend).

### 2. Educational Networks (Schools & Bible College)
- **Infrastructure**: E-Learning Management System (LMS) Integration.
- **Data Flow**: Moodle/Canvas REST API bridged to the main church portal.
- **Capabilities**: Course enrollment, Grade tracking, Digital credentialing.

### 3. Media & Broadcasting
- **Infrastructure**: CDN and Streaming Server Architecture.
- **TV Network**: WebRTC / HLS streaming integrations via Mux or AWS MediaLive.
- **Radio Station**: Icecast / SHOUTcast stream connected through HTML5 Web Audio API.

### 4. Christian Bookstore (E-Commerce)
- **Infrastructure**: Headless commerce integration (Shopify API or Stripe Billing).
- **Offerings**: Physical books, digital downloads, courses, and church merchandise.

## Schema Highlights

The fundamental types built into `/src/types.ts` outline the relational database schema required:
- \`ChurchBranch\`: (1:N relationship with Members and Events)
- \`EducationalInstitution\`: (1:N relationship with Courses and Students)
- \`BroadcastStation\`: Program schedulers and stream health.
- \`StoreProduct\`: Inventory and digital goods schema.

## SEO & Accessibility Profile

- **Structured Data**: Uses \`application/ld+json\` for Google Rich Snippets mapping (LocalBusiness / Church / Education).
- **Optimization**: Images are deferred (\`loading="lazy"\`) and properly down-sampled.
- **Sitemap**: Dynamic generated sitemap configured and exposed over \`/sitemap.xml\`. 

## Deployment Guide (Cloud Run / Node.js)
1. **Build Environment**: Run \`npm run build\` to construct the VITE client assets and bundle the server API (\`esbuild\`).
2. **Launch Node Image**: Containerize using Docker and Google Cloud Run. Ensure internal routing binds port \`3000\`.
3. **Database Configuration**: Migrate staging/production schemas using \`drizzle-kit\` prior to switching DNS.

*To adapt this to a Laravel or WP backend, separate the frontend \`.tsx\` artifacts using a Next.js rewrite configuration.*
