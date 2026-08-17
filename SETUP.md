# Mantra Taxbooks — Setup & Deployment

## Local Development

### 1. Install dependencies
```bash
npm install
```

### 2. Copy and fill environment variables
```bash
cp .env.example .env
```
Edit `.env` with your values (database, AWS, SMTP, NextAuth secret).

Generate NextAuth secret:
```bash
openssl rand -base64 32
```

### 3. Set up MySQL database
Create database in MySQL:
```sql
CREATE DATABASE mantrabooks CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Update `DATABASE_URL` in `.env`:
```
DATABASE_URL="mysql://user:password@localhost:3306/mantrabooks"
```

### 4. Run Prisma migrations
```bash
npm run db:generate
npm run db:migrate
```

### 5. Seed demo data
```bash
npm run db:seed
```

Default credentials after seed:
- **Admin:** admin@mantrataxbooks.com / Admin@123
- **Client:** demo@client.com / Client@123
- **Support:** support@mantrataxbooks.com / Support@123

### 6. Start dev server
```bash
npm run dev
```
Open http://localhost:3000

---

## AWS S3 Setup (Document Storage)

1. Create S3 bucket: `mantrabooks-docs`
2. Block all public access (ACL off)
3. Enable server-side encryption: AES-256
4. Create IAM user with policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::mantrabooks-docs/*"
    }
  ]
}
```

5. Add IAM Access Key ID + Secret to `.env`

Recommended region for India: `ap-south-1` (Mumbai)

---

## Plesk Deployment

### 1. Install Node.js extension in Plesk
Plesk Panel → Extensions → Node.js

### 2. Create application
- Document root: `/mantrabooks` (your app subfolder)
- Node.js version: 20 LTS
- Application startup file: `server.js` (or use npm start)

### 3. Add environment variables in Plesk
Plesk → Domains → Your Domain → Node.js → Environment Variables
Add all vars from `.env`

### 4. Create MySQL database
Plesk → Databases → Add Database
- Name: `mantrabooks`
- User: create with strong password
- Update `DATABASE_URL` in Plesk env vars

### 5. SSH into server and deploy
```bash
cd /var/www/vhosts/yourdomain.com/mantrabooks
npm install --production
npm run db:generate
npm run build
npm run db:migrate
npm run db:seed
```

### 6. Set startup command in Plesk
Application startup file: `node_modules/.bin/next`
Or add a `server.js`:
```js
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const app = next({ dev: false })
const handle = app.getRequestHandler()
app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res, parse(req.url, true))
  }).listen(3000)
})
```

### 7. Set Plesk reverse proxy
Plesk handles incoming port 80/443 → proxies to Node.js port 3000.
SSL: Enable Let's Encrypt in Plesk.

---

## Security Checklist

- [ ] NEXTAUTH_SECRET is a random 32+ byte string
- [ ] Database user has minimum permissions (SELECT, INSERT, UPDATE, DELETE only)
- [ ] S3 bucket has NO public access
- [ ] S3 IAM user has minimal policy (only this bucket)
- [ ] SMTP credentials are secure
- [ ] All env vars set in server, NOT in code
- [ ] SSL/HTTPS enabled on domain
- [ ] Prisma runs migrations via SSH, not exposed publicly

---

## Routes Reference

| Path | Access | Description |
|------|--------|-------------|
| `/` | Public | Landing page |
| `/login` | Public | Login |
| `/forgot-password` | Public | Forgot password |
| `/reset-password` | Public | Reset via token |
| `/dashboard` | Client | Client dashboard |
| `/invoices` | Client | View/download invoices |
| `/documents` | Client | Upload/view documents |
| `/tickets` | Client | Support tickets |
| `/change-password` | Client | Change password |
| `/admin/dashboard` | Admin | Admin overview |
| `/admin/clients` | Admin | Manage clients |
| `/admin/invoices` | Admin | Raise/manage invoices |
| `/admin/documents` | Admin | Review documents |
| `/admin/tickets` | Admin | Manage tickets |
| `/admin/roles` | Admin | Create custom roles |
| `/admin/employees` | Admin | Manage employees |
| `/employee/tickets` | Support | Handle tickets |
| `/employee/payments` | Payments | View payment records |
