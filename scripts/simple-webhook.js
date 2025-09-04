#!/usr/bin/env node

const http = require('http');
const { exec } = require('child_process');

const PORT = 9000;

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/deploy') {
    console.log('🚀 Deploy request received');
    
    exec('cd /opt/blimp1 && git pull origin main && chmod +x scripts/prod-build.sh && ./scripts/prod-build.sh && pm2 reload ecosystem.config.cjs --update-env && pm2 save', 
      (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Deploy error:', error);
          res.writeHead(500);
          res.end('Deploy failed: ' + error.message);
          return;
        }
        
        console.log('✅ Deploy successful:', stdout);
        res.writeHead(200);
        res.end('Deploy successful!');
      }
    );
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`🎯 Webhook server running on port ${PORT}`);
  console.log(`📡 Send POST to http://64.23.169.176:${PORT}/deploy to deploy`);
});
