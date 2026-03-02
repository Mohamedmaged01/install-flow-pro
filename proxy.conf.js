/** @type {import('@angular/build').DevServerProxyConfig} */
const APEX_PASS_KEY = '#@$DSFW%#@5423asfsa3252534$#%$#&^#@@!#%WEDFsdfsdgfascxvxvxwjsgdnhtecvxzterujhrjn';

const PROXY_CONFIG = {
    '/api/apex': {
        target: 'https://gate.erp-apex.com',
        secure: true,
        changeOrigin: true,
        pathRewrite: { '^/api/apex': '' },
        rewrite: (path) => path.replace(/^\/api\/apex/, ''),
        onProxyReq: (proxyReq) => {
            // Append PassKey to the query string (raw, no double-encoding)
            const separator = proxyReq.path.includes('?') ? '&' : '?';
            proxyReq.path += separator + 'PassKey=' + encodeURIComponent(APEX_PASS_KEY);
        },
    },
};

module.exports = PROXY_CONFIG;
