/** @type {import('@angular/build').DevServerProxyConfig} */
const PROXY_CONFIG = {
    '/api/apex': {
        target: 'https://gate.erp-apex.com',
        secure: true,
        changeOrigin: true,
        pathRewrite: { '^/api/apex': '' },
        rewrite: (path) => path.replace(/^\/api\/apex/, ''),
    },
};

module.exports = PROXY_CONFIG;
