# GitHub CI Setup Guide

## Quick Setup (3 steps)

### 1. Add GitHub Secrets
Go to: **Settings → Secrets and variables → Actions → New repository secret**

Add these secrets (one by one):

| Name | Value |
|------|-------|
| `MONGO_URL` | `mongodb+srv://hangzhengyang1010_db_user:p44ooEWAnB76OzX3@cluster0.dra7z8p.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0` |
| `JWT_SECRET` | `a9372d93311b5f5b7955015cd095dfd8a36cd34e5cce9a343447a50488c3758fef3142386fd021a89cdf85aadf5dcd5d5e10a7be09bb903db6d5ae91c1739a08` |
| `GMAIL` | `hang.zhengyang1010@gmail.com` |
| `GMAIL_PASSWORD` | `lhtcfbtpofsnibgh` |

### 2. Update MongoDB Atlas
Go to: https://cloud.mongodb.com/ → Your Cluster → **Network Access** → **Add IP Address** → Enter `0.0.0.0/0`

### 3. Push to GitHub
Make any commit and push. CI will run automatically.

## What the CI Does
- ✅ Runs all backend tests (Jest)
- ✅ Runs all frontend tests (Vitest)  
- ✅ Verifies frontend build

## Troubleshooting

**Tests fail?** Check MongoDB Atlas allows `0.0.0.0/0` in Network Access.

**Wrong secrets?** Verify the secret names are exactly `MONGO_URL` and `JWT_SECRET`.

