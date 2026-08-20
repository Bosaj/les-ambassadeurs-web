Deployment Guide

Prerequisites: Node.js 20+, Netlify CLI

Env vars: Copy .env.example to .env

Deploy: npm install && npm run build && netlify deploy --prod --dir=dist

CI/CD: GitHub Actions ci.yml (lint+build+test), release.yml (version tags)

Supabase migrations: supabase db push