const Koa = require('koa');
const { createProxyMiddleware } = require('http-proxy-middleware');
const https = require('https');
const fs = require('fs');

// 读取证书和私钥文件
const options = {
    key: fs.readFileSync('.ssh/private.key'),
    cert: fs.readFileSync('.ssh/selfsigned.crt')
};

// 创建KOA应用实例
const app = new Koa();

// 创建代理中间件，这里以将请求代理到目标服务器的/api路径为例
const proxy = createProxyMiddleware({
    target: 'https://wwww.baidu.com',
    changeOrigin: true,
    pathRewrite: {
        '^/api': ''
    }
});

// 在KOA应用中使用代理中间件
app.use(async (ctx, next) => {
    if (ctx.path.startsWith('/api')) {
        await proxy(ctx.req, ctx.res, next);
    } else {
        await next();
    }
});

app.use((ctx) => {
    if (ctx.path === '/') {
        ctx.set('Content-Type', 'text/html')
        const html = fs.readFileSync('index.html')
        ctx.body = html
    }
})

// 创建基于HTTPS的服务器实例并监听端口
const server = https.createServer(options, app.callback());
server.listen(443, () => {
    console.log('HTTPS reverse proxy server is listening on port 443');
});