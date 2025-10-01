# Cloudflare DNS Setup for blimp.one

## 📋 Quick Setup Guide

### Step 1: Add Domain to Cloudflare

1. Go to **[Cloudflare Dashboard](https://dash.cloudflare.com)**
2. Click **"Add a Site"**
3. Enter: `blimp.one`
4. Choose **Free Plan** (or any plan you prefer)
5. Click **Continue**

---

### Step 2: Configure DNS Records

In **DNS → Records** section, add these A records:

#### Primary Records

| Type | Name | Content       | Proxy | TTL  |
|------|------|---------------|-------|------|
| A    | @    | 137.184.82.40 | ✅    | Auto |
| A    | www  | 137.184.82.40 | ✅    | Auto |

**Note:** The orange cloud (✅ Proxied) enables Cloudflare's CDN, DDoS protection, and SSL

#### Optional Subdomains (if needed later)

| Type | Name | Content       | Proxy | TTL  |
|------|------|---------------|-------|------|
| A    | api  | 137.184.82.40 | ✅    | Auto |
| A    | *    | 137.184.82.40 | ⚪    | Auto |

---

### Step 3: Update Nameservers at Your Domain Registrar

1. Cloudflare will show you 2 nameservers like:
   ```
   anya.ns.cloudflare.com
   brad.ns.cloudflare.com
   ```

2. Go to your domain registrar (where you bought blimp.one)
3. Find **DNS Settings** or **Nameservers**
4. Replace existing nameservers with Cloudflare's nameservers
5. **Save changes**

**Propagation Time:** 2-48 hours (usually < 2 hours)

---

### Step 4: Configure SSL/TLS in Cloudflare

#### SSL/TLS Settings

1. Go to **SSL/TLS → Overview**
2. Select: **"Full"** (or "Full (strict)" if you have valid SSL on server)
3. Click **Edge Certificates**
4. Enable these options:
   - ✅ **Always Use HTTPS** - Redirect HTTP to HTTPS
   - ✅ **Automatic HTTPS Rewrites**
   - ✅ **Minimum TLS Version: TLS 1.2**

#### Create Origin Certificate (Recommended)

1. Go to **SSL/TLS → Origin Server**
2. Click **"Create Certificate"**
3. Settings:
   - **Private key type:** RSA (2048)
   - **Hostnames:** 
     - `blimp.one`
     - `*.blimp.one`
   - **Certificate Validity:** 15 years
4. Click **Create**
5. **Copy and save**:
   - Origin Certificate (cert.pem)
   - Private Key (key.pem)

**Important:** Keep these files secure! You'll need them for the server.

---

### Step 5: Configure Server for Domain

#### Option A: Automatic Setup (Recommended)

Run the setup script:
```bash
chmod +x setup-domain.sh
./setup-domain.sh
```

Then follow the instructions to upload SSL certificates.

#### Option B: Manual Setup

**1. Upload SSL Certificates:**
```bash
# Create directory
ssh root@137.184.82.40 "mkdir -p /etc/ssl/cloudflare"

# Upload certificates (save them locally first)
scp cert.pem root@137.184.82.40:/etc/ssl/cloudflare/cert.pem
scp key.pem root@137.184.82.40:/etc/ssl/cloudflare/key.pem

# Set permissions
ssh root@137.184.82.40 "chmod 600 /etc/ssl/cloudflare/key.pem"
ssh root@137.184.82.40 "chmod 644 /etc/ssl/cloudflare/cert.pem"
```

**2. Update Backend Environment:**
```bash
ssh root@137.184.82.40 "cat > /opt/blimp1/backend/.env << 'EOF'
NODE_ENV=production
HOST=0.0.0.0
PORT=3333
APP_NAME=blimp-backend
APP_URL=https://blimp.one
APP_KEY=YgnOBzI7fZsasQDUSL94JE7ae_dBLv5-
LOG_LEVEL=info
SESSION_DRIVER=cookie
CORS_ORIGIN=*
WS_CORS_ORIGIN=*
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=postgres
PG_DB_NAME=blimp
PG_SSL=false
ADMIN_EMAIL=admin@blimp.com
ADMIN_PASSWORD=SecureAdminPass123!
EOF
"
```

**3. Update Frontend Environment:**
```bash
ssh root@137.184.82.40 "cat > /opt/blimp1/frontend/.env.local << 'EOF'
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://blimp.one
NEXT_PUBLIC_WS_URL=wss://blimp.one
NEXT_PUBLIC_BACKEND_URL=https://blimp.one
EOF
"
```

**4. Update Nginx Configuration:**
```bash
ssh root@137.184.82.40 "cat > /etc/nginx/sites-available/blimp1 << 'NGINXEOF'
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name blimp.one www.blimp.one;
    return 301 https://\$host\$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    server_name blimp.one www.blimp.one;
    
    # SSL Configuration (Cloudflare Origin Certificate)
    ssl_certificate /etc/ssl/cloudflare/cert.pem;
    ssl_certificate_key /etc/ssl/cloudflare/key.pem;
    
    # SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Security Headers
    add_header X-Frame-Options \"DENY\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    add_header Strict-Transport-Security \"max-age=31536000; includeSubDomains\" always;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:3333;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # WebSocket
    location /socket.io {
        proxy_pass http://localhost:3333;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection \"upgrade\";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
NGINXEOF
"
```

**5. Rebuild Frontend:**
```bash
ssh root@137.184.82.40 "cd /opt/blimp1/frontend && npm run build"
```

**6. Restart Services:**
```bash
# Test Nginx configuration
ssh root@137.184.82.40 "nginx -t"

# Restart Nginx
ssh root@137.184.82.40 "systemctl restart nginx"

# Restart PM2 apps
ssh root@137.184.82.40 "pm2 restart all"
```

---

### Step 6: Verify Setup

**Wait for DNS propagation** (check status at [whatsmydns.net](https://www.whatsmydns.net))

**Test the domain:**
```bash
# Check DNS resolution
dig blimp.one

# Test HTTP redirect
curl -I http://blimp.one

# Test HTTPS
curl -I https://blimp.one

# Test API
curl https://blimp.one/api/status
```

**Open in browser:**
- https://blimp.one
- https://blimp.one/auth

---

## 🎯 Cloudflare Optimization Settings

### Performance

Go to **Speed → Optimization**:
- ✅ Auto Minify (CSS, JavaScript, HTML)
- ✅ Brotli compression
- ✅ Early Hints

### Caching

Go to **Caching → Configuration**:
- **Browser Cache TTL:** 4 hours (or as needed)
- **Caching Level:** Standard

### Security

Go to **Security**:
- **Security Level:** Medium
- **Bot Fight Mode:** Enable (Free plan)
- **Challenge Passage:** 30 minutes

### Firewall Rules (Optional)

Create rules to:
- Block specific countries
- Rate limit API endpoints
- Allow only certain IPs for admin pages

---

## 🔧 Troubleshooting

### DNS not resolving
- Wait longer (up to 48 hours)
- Clear DNS cache: `sudo dscacheutil -flushcache` (Mac)
- Check nameservers: `dig blimp.one NS`

### SSL Certificate Error
- Ensure SSL mode is "Full" in Cloudflare
- Verify certificate files are uploaded correctly
- Check Nginx error logs: `journalctl -u nginx -n 50`

### 502 Bad Gateway
- Check if PM2 apps are running: `ssh root@137.184.82.40 "pm2 status"`
- Check backend logs: `ssh root@137.184.82.40 "pm2 logs blimp-backend --lines 50"`
- Verify backend is listening on port 3333

### Mixed Content Warning
- Ensure all assets use HTTPS URLs
- Enable "Automatic HTTPS Rewrites" in Cloudflare
- Check browser console for blocked resources

---

## 📝 Post-Setup Checklist

After domain is configured:

- [ ] Test https://blimp.one loads correctly
- [ ] Test https://www.blimp.one redirects to blimp.one
- [ ] Test login functionality at https://blimp.one/auth
- [ ] Test API endpoints: https://blimp.one/api/status
- [ ] Verify WebSocket connection works
- [ ] Check SSL rating at [SSL Labs](https://www.ssllabs.com/ssltest/)
- [ ] Update any hardcoded URLs in the application
- [ ] Update OAuth/social login redirect URLs (if applicable)
- [ ] Update email templates with new domain
- [ ] Set up monitoring/alerts for domain

---

## 🔐 Security Best Practices

1. **Enable Two-Factor Authentication** on Cloudflare account
2. **Set up API Token** instead of Global API Key for automation
3. **Enable WAF Rules** (available on Pro plan and up)
4. **Monitor Security Events** in Cloudflare dashboard
5. **Regular SSL certificate rotation** (Origin certificates)
6. **Configure Page Rules** for additional security on admin routes
7. **Set up Cloudflare Access** for team/admin portal protection

---

## 📚 Useful Links

- [Cloudflare Dashboard](https://dash.cloudflare.com)
- [Cloudflare DNS Documentation](https://developers.cloudflare.com/dns/)
- [Cloudflare SSL Documentation](https://developers.cloudflare.com/ssl/)
- [Check DNS Propagation](https://www.whatsmydns.net)
- [SSL Test](https://www.ssllabs.com/ssltest/)
- [Cloudflare Status](https://www.cloudflarestatus.com/)

---

**Last Updated:** October 1, 2025  
**Domain:** blimp.one  
**Server IP:** 137.184.82.40




