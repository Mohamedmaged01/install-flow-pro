/** @type {import('@angular/build').DevServerProxyConfig} */
const PROXY_CONFIG = {
    '/apex-api': {
        target: 'https://gate.erp-apex.com',
        secure: true,
        changeOrigin: true,
        pathRewrite: { '^/apex-api': '' },
        rewrite: (path) => path.replace(/^\/apex-api/, ''),
        logLevel: 'debug',
    },
};

module.exports = PROXY_CONFIG;
