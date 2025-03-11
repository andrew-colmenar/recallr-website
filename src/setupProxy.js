const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://auth.recallrai.com',
      changeOrigin: true,
      secure: false,
      pathRewrite: {
        '^/api': '', // remove /api prefix when forwarding to target
      },
      logLevel: 'debug',
      onProxyReq: function(proxyReq, req, res) {
        // Log full URL for debugging
        console.log('Proxying request:',  req.method, req.url, 'to', 
          proxyReq.protocol + '//' + proxyReq.host + proxyReq.path);
        
        // Log request body if present
        if (req.body) {
          console.log('Request body:', req.body);
        }
      },
      onProxyRes: function(proxyRes, req, res) {
        console.log('Received response:', proxyRes.statusCode, proxyRes.statusMessage);
        
        // Add more details about the response
        console.log('Response headers:', proxyRes.headers);
      },
      onError: function(err, req, res) {
        console.error('Proxy error:', err);
        res.writeHead(500, {
          'Content-Type': 'text/plain',
        });
        res.end('Proxy error: ' + err.message);
      }
    })
  );
};