/**
 * XSS跨站脚本攻击漏洞示例
 * 相关规则：
 * - CWE-79: Cross-site Scripting (XSS)
 * - OWASP Top 10:2017-A7-Cross-Site Scripting (XSS)
 * - OWASP Top 10:2021-A03-Injection (包含XSS)
 * - PCI DSS V3.2.1-Requirement 6.5.7
 * - CWE Top 25:2023-CWE-79
 */

const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 存储用户评论的数组（模拟数据库）
let comments = [];
let userProfiles = {};

// 反射型XSS漏洞 - 直接输出用户输入
app.get('/search', (req, res) => {
    const searchTerm = req.query.q;

    // 危险：直接将用户输入嵌入HTML响应中
    res.send(`
        <html>
        <head><title>搜索结果</title></head>
        <body>
            <h1>搜索 "${searchTerm}" 的结果</h1>
            <p>没有找到关于 "${searchTerm}" 的结果</p>
        </body>
        </html>
    `);
});

// 存储型XSS漏洞 - 用户评论功能
app.post('/comment', (req, res) => {
    const comment = req.body.comment;
    const username = req.body.username || '匿名用户';

    // 危险：未对用户输入进行任何过滤或转义
    const newComment = {
        id: comments.length + 1,
        username: username,
        comment: comment, // 直接存储用户输入的HTML/JS代码
        timestamp: new Date().toISOString()
    };

    comments.push(newComment);

    // 重定向到评论页面
    res.redirect('/comments');
});

// 显示评论 - 存储型XSS
app.get('/comments', (req, res) => {
    let html = `
        <html>
        <head><title>用户评论</title></head>
        <body>
            <h1>用户评论</h1>
            <form action="/comment" method="POST">
                <input type="text" name="username" placeholder="用户名">
                <textarea name="comment" placeholder="发表评论"></textarea>
                <button type="submit">提交评论</button>
            </form>
            <div id="comments">
    `;

    // 危险：直接输出用户评论内容，未进行HTML转义
    comments.forEach(comment => {
        html += `
            <div class="comment">
                <h3>${comment.username}</h3>
                <p>${comment.comment}</p>
                <small>${comment.timestamp}</small>
            </div>
        `;
    });

    html += `
            </div>
        </body>
        </html>
    `;

    res.send(html);
});

// DOM型XSS漏洞 - 使用用户输入操作DOM
app.get('/profile', (req, res) => {
    const username = req.query.username || req.cookies.username || '';
    const theme = req.query.theme || 'light';

    res.send(`
        <html>
        <head><title>用户资料</title></head>
        <body>
            <h1>用户资料</h1>
            <div id="welcome-message"></div>
            <script>
                // 危险：直接将用户输入插入到DOM中
                var username = '${username}';
                var theme = '${theme}';
                
                // DOM型XSS - 使用innerHTML
                document.getElementById('welcome-message').innerHTML = 
                    '<h2>欢迎, ' + username + '!</h2>' +
                    '<p>当前主题: ' + theme + '</p>';
                
                // 另一个DOM型XSS示例 - 使用document.write
                if (window.location.hash) {
                    document.write('<div>哈希参数: ' + window.location.hash.substring(1) + '</div>');
                }
                
                // 危险的eval使用
                var userPrefs = '${req.query.prefs || '{}'}';
                eval('var prefs = ' + userPrefs);
                
                // 使用用户输入设置样式
                document.body.style.backgroundColor = '${req.query.bgcolor || 'white'}';
            </script>
        </body>
        </html>
    `);
});

// 富文本编辑器中的XSS漏洞
app.post('/save-profile', (req, res) => {
    const userId = req.body.userId;
    const bio = req.body.bio;
    const customCSS = req.body.customCSS;

    // 危险：允许用户输入HTML和CSS而不进行充分过滤
    userProfiles[userId] = {
        bio: bio, // 可能包含恶意脚本
        customCSS: customCSS, // 可能包含CSS表达式
        lastUpdated: new Date().toISOString()
    };

    res.json({ success: true });
});

// 显示用户资料 - 输出未过滤的内容
app.get('/user/:id', (req, res) => {
    const userId = req.params.id;
    const profile = userProfiles[userId];

    if (!profile) {
        res.status(404).send('用户不存在');
        return;
    }

    res.send(`
        <html>
        <head>
            <title>用户资料 - ${userId}</title>
            <style>${profile.customCSS}</style> <!-- 危险的CSS注入 -->
        </head>
        <body>
            <h1>用户资料</h1>
            <div class="bio">
                ${profile.bio} <!-- 危险的HTML注入 -->
            </div>
            <script>
                // 在JavaScript中使用用户数据
                var userBio = '${profile.bio.replace(/'/g, "\\'")}';
                console.log('用户简介: ' + userBio);
                
                // 危险：使用用户输入作为JavaScript代码
                var userScript = '${req.query.script || ''}';
                if (userScript) {
                    eval(userScript); // 极度危险！
                }
            </script>
        </body>
        </html>
    `);
});

// JSONP接口中的XSS漏洞
app.get('/api/userdata', (req, res) => {
    const callback = req.query.callback;
    const userId = req.query.userId;

    const userData = {
        id: userId,
        name: '用户' + userId,
        email: 'user' + userId + '@example.com'
    };

    // 危险：未对回调函数名进行验证
    if (callback) {
        // JSONP响应 - 可能导致XSS
        res.type('text/javascript');
        res.send(`${callback}(${JSON.stringify(userData)})`);
    } else {
        res.json(userData);
    }
});

// 文件上传功能中的XSS漏洞
app.post('/upload', (req, res) => {
    const filename = req.body.filename;
    const fileContent = req.body.content;

    // 危险：未验证文件类型和内容
    if (filename.endsWith('.html')) {
        // 允许上传HTML文件
        res.send(`
            <html>
            <body>
                <h1>文件上传成功</h1>
                <div>
                    文件名: ${filename}
                    <br>
                    内容预览:
                    <iframe srcdoc="${fileContent.replace(/"/g, '&quot;')}" width="100%" height="300"></iframe>
                </div>
            </body>
            </html>
        `);
    }
});

// WebSocket消息中的XSS漏洞
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        const data = JSON.parse(message);

        // 危险：广播未过滤的消息到其他客户端
        wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: 'message',
                    content: data.content, // 可能包含恶意脚本
                    sender: data.sender,
                    timestamp: new Date().toISOString()
                }));
            }
        });
    });
});

// 错误页面中的XSS漏洞
app.use((err, req, res, next) => {
    // 危险：在错误页面中显示用户输入
    res.status(500).send(`
        <html>
        <body>
            <h1>服务器错误</h1>
            <p>错误详情: ${err.message}</p>
            <p>请求URL: ${req.url}</p>
            <p>用户代理: ${req.headers['user-agent']}</p>
        </body>
        </html>
    `);
});

app.listen(3000, () => {
    console.log('XSS漏洞演示服务器运行在端口3000');
});