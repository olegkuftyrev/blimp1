#!/usr/bin/env node

const http = require('http');
const { exec } = require('child_process');
const crypto = require('crypto');

const PORT = 9000;
const SECRET = 'your-webhook-secret-here'; // Замени на свой секрет

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/deploy') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const signature = req.headers['x-hub-signature-256'];
        
        // Проверка подписи (опционально)
        if (signature) {
          const expectedSignature = 'sha256=' + crypto
            .createHmac('sha256', SECRET)
            .update(body)
            .digest('hex');
          
          if (signature !== expectedSignature) {
            console.log('Invalid signature');
            res.writeHead(401);
            res.end('Unauthorized');
            return;
          }
        }
        
        // Проверяем что это push в main ветку
        if (payload.ref === 'refs/heads/main') {
          console.log('Deploying...');
          
          exec('cd /opt/blimp1 && git pull origin main && chmod +x scripts/prod-build.sh && ./scripts/prod-build.sh && pm2 reload ecosystem.config.cjs --update-env && pm2 save', 
            (error, stdout, stderr) => {
              if (error) {
                console.error('Deploy error:', error);
                res.writeHead(500);
                res.end('Deploy failed');
                return;
              }
              
              console.log('Deploy successful:', stdout);
              res.writeHead(200);
              res.end('Deploy successful');
            }
          );
        } else {
          console.log('Ignoring push to', payload.ref);
          res.writeHead(200);
          res.end('Ignored');
        }
      } catch (error) {
        console.error('Parse error:', error);
        res.writeHead(400);
        res.end('Bad request');
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Webhook server running on port ${PORT}`);
});
