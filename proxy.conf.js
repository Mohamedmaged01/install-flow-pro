/** @type {import('@angular/build').DevServerProxyConfig} */
const PROXY_CONFIG = {
    '/api/offers': {
        target: 'https://gate.erp-apex.com',
        secure: true,
        changeOrigin: true,
        pathRewrite: { '^/api/offers': '/OfferPricesController/getOfferPrice' },
        rewrite: (path) => path.replace('/api/offers', '/OfferPricesController/getOfferPrice'),
    },
    '/api/invoices': {
        target: 'https://gate.erp-apex.com',
        secure: true,
        changeOrigin: true,
        pathRewrite: { '^/api/invoices': '/InvoiceServices/GetInvoices' },
        rewrite: (path) => path.replace('/api/invoices', '/InvoiceServices/GetInvoices'),
    },
};

module.exports = PROXY_CONFIG;
