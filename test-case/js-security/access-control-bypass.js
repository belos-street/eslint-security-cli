/**
 * 访问控制缺陷示例
 * 相关规则：
 * - CWE-284: Improper Access Control
 * - CWE-285: Improper Authorization
 * - CWE-287: Improper Authentication
 * - CWE-434: Unrestricted Upload of File with Dangerous Type
 * - CWE-639: Authorization Bypass Through User-Controlled Key
 * - CWE-22: Improper Limitation of a Pathname to a Restricted Directory
 * - OWASP Top 10:2017-A5-Broken Access Control
 * - OWASP Top 10:2021-A01-Broken Access Control
 * - PCI DSS V3.2.1-Requirement 7, 8
 * - CWE Top 25:2023-CWE-284
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1. 缺少身份验证检查
const users = [
    { id: 1, username: 'admin', password: 'admin123', role: 'admin', email: 'admin@example.com' },
    { id: 2, username: 'user1', password: 'user123', role: 'user', email: 'user1@example.com' },
    { id: 3, username: 'user2', password: 'user456', role: 'user', email: 'user2@example.com' }
];

// 危险：无需身份验证即可获取所有用户信息
app.get('/users/all', (req, res) => {
    // 缺少身份验证检查
    res.json({
        users: users,
        count: users.length,
        warning: '此接口缺少身份验证，任何人都可以访问用户数据'
    });
});

// 危险：直接通过ID获取用户信息，无需身份验证
app.get('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    
    // 缺少身份验证和授权检查
    const user = users.find(u => u.id === userId);
    
    if (user) {
        res.json({
            user: user,
            sensitiveData: {
                password: user.password, // 泄露密码！
                email: user.email,
                role: user.role
            },
            warning: '缺少身份验证和授权检查'
        });
    } else {
        res.status(404).json({ error: '用户未找到' });
    }
});

// 2. 用户控制的密钥绕过授权
app.get('/users/profile/:username', (req, res) => {
    const username = req.params.username;
    
    // 危险：用户可以通过修改URL参数访问其他用户的资料
    const user = users.find(u => u.username === username);
    
    if (user) {
        res.json({
            profile: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                password: user.password // 泄露敏感信息！
            },
            bypassMethod: 'user_controlled_key',
            warning: '通过修改URL参数可以访问其他用户的敏感信息'
        });
    } else {
        res.status(404).json({ error: '用户未找到' });
    }
});

// 3. 缺少角色权限检查
app.delete('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    
    // 危险：缺少管理员权限检查
    // 任何用户都可以删除其他用户
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
        const deletedUser = users.splice(userIndex, 1)[0];
        
        res.json({
            message: '用户删除成功',
            deletedUser: deletedUser,
            remainingUsers: users.length,
            warning: '缺少角色权限检查，普通用户也可以删除其他用户'
        });
    } else {
        res.status(404).json({ error: '用户未找到' });
    }
});

// 4. 不安全的直接对象引用（IDOR）
const documents = [
    { id: 1, title: 'Public Document', content: 'This is public content', owner: 'user1', isPublic: true },
    { id: 2, title: 'Private Document 1', content: 'This is private content for user1', owner: 'user1', isPublic: false },
    { id: 3, title: 'Private Document 2', content: 'This is private content for user2', owner: 'user2', isPublic: false },
    { id: 4, title: 'Admin Document', content: 'This is admin only content', owner: 'admin', isPublic: false, adminOnly: true }
];

app.get('/documents/:id', (req, res) => {
    const docId = parseInt(req.params.id);
    
    // 危险：缺少所有权检查
    const document = documents.find(d => d.id === docId);
    
    if (document) {
        res.json({
            document: document,
            access: 'granted_without_ownership_check',
            vulnerability: 'IDOR',
            warning: '通过修改文档ID可以访问其他用户的私有文档'
        });
    } else {
        res.status(404).json({ error: '文档未找到' });
    }
});

// 5. 文件上传缺少类型检查
const upload = multer({ dest: 'uploads/' });

app.post('/upload/file', upload.single('file'), (req, res) => {
    // 危险：缺少文件类型验证
    if (!req.file) {
        return res.status(400).json({ error: '没有上传文件' });
    }
    
    const file = req.file;
    const originalName = file.originalname;
    
    // 危险：允许上传任何类型的文件
    const allowedExtensions = ['.txt', '.pdf', '.doc', '.jpg', '.png'];
    const fileExtension = path.extname(originalName).toLowerCase();
    
    // 这里虽然有检查，但是很容易被绕过
    if (!allowedExtensions.includes(fileExtension)) {
        // 但仍然保存文件，只是给出警告
        console.warn(`上传了潜在危险的文件类型: ${fileExtension}`);
    }
    
    res.json({
        message: '文件上传成功',
        filename: originalName,
        size: file.size,
        path: file.path,
        mimetype: file.mimetype,
        extension: fileExtension,
        security: 'vulnerable',
        warning: '缺少严格的文件类型验证，可能上传恶意文件'
    });
});

// 6. 路径遍历结合访问控制缺陷
app.get('/files/:filename', (req, res) => {
    const filename = req.params.filename;
    
    // 危险：缺少路径验证和访问控制
    const filePath = path.join(__dirname, 'files', filename);
    
    try {
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            
            res.json({
                filename: filename,
                content: content,
                path: filePath,
                access: 'unrestricted',
                vulnerability: 'path_traversal + missing_access_control',
                warning: '可以访问任意文件，包括敏感系统文件'
            });
        } else {
            res.status(404).json({ error: '文件未找到' });
        }
    } catch (error) {
        res.status(500).json({ error: '读取文件失败' });
    }
});

// 7. 管理员功能缺少权限验证
app.get('/admin/users', (req, res) => {
    // 危险：缺少管理员权限验证
    const adminUsers = users.filter(u => u.role === 'admin');
    
    res.json({
        adminUsers: adminUsers,
        totalAdmins: adminUsers.length,
        accessLevel: 'assumed_admin',
        warning: '管理员功能缺少权限验证'
    });
});

app.post('/admin/reset-password/:username', (req, res) => {
    const username = req.params.username;
    const { newPassword } = req.body;
    
    // 危险：缺少管理员身份验证
    const user = users.find(u => u.username === username);
    
    if (user) {
        user.password = newPassword; // 明文存储密码！
        
        res.json({
            message: '密码重置成功',
            username: username,
            newPassword: newPassword, // 泄露新密码！
            resetBy: 'unauthorized_user',
            warning: '管理员功能缺少身份验证和授权检查'
        });
    } else {
        res.status(404).json({ error: '用户未找到' });
    }
});

// 8. JWT令牌验证不当
const JWT_SECRET = 'my-super-secret-jwt-key'; // 硬编码密钥

function generateToken(user) {
    return jwt.sign({
        username: user.username,
        role: user.role
    }, JWT_SECRET, { expiresIn: '24h' });
}

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        const token = generateToken(user);
        
        res.json({
            message: '登录成功',
            token: token,
            user: {
                username: user.username,
                role: user.role
            },
            warning: 'JWT使用硬编码密钥，且缺少适当的验证'
        });
    } else {
        res.status(401).json({ error: '用户名或密码错误' });
    }
});

// 危险：缺少令牌验证中间件
app.get('/protected/data', (req, res) => {
    // 缺少JWT令牌验证
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        // 即使没有令牌也返回数据
        res.json({
            data: '敏感数据',
            access: 'unauthorized',
            warning: '缺少身份验证检查'
        });
        return;
    }
    
    // 即使有令牌也不验证
    res.json({
        data: '受保护的敏感数据',
        token: authHeader,
        validation: 'none',
        warning: '令牌未经验证'
    });
});

// 9. 功能级访问控制缺失
const features = {
    exportData: true,
    importData: true,
    deleteAll: true,
    modifyConfig: true,
    viewLogs: true
};

app.get('/features', (req, res) => {
    // 危险：缺少功能级权限检查
    res.json({
        availableFeatures: features,
        access: 'unrestricted',
        warning: '缺少功能级访问控制'
    });
});

app.post('/features/export', (req, res) => {
    // 危险：缺少功能级权限验证
    const sensitiveData = {
        users: users,
        documents: documents,
        systemConfig: {
            databaseUrl: 'mongodb://localhost:27017/myapp',
            apiKey: 'sk-1234567890abcdef',
            jwtSecret: JWT_SECRET // 泄露JWT密钥！
        }
    };
    
    res.json({
        message: '数据导出成功',
        data: sensitiveData,
        permission: 'not_checked',
        warning: '敏感数据导出功能缺少权限验证'
    });
});

// 10. 基于URL的访问控制绕过
app.get('/api/v1/users', (req, res) => {
    // 版本1：需要身份验证（假设有中间件）
    res.json({
        version: 'v1',
        users: users,
        authentication: 'required'
    });
});

app.get('/api/v2/users', (req, res) => {
    // 版本2：缺少身份验证（API版本绕过）
    res.json({
        version: 'v2',
        users: users,
        authentication: 'bypassed',
        warning: '通过使用不同的API版本绕过访问控制'
    });
});

// 11. HTTP方法绕过
app.get('/users/:id/delete', (req, res) => {
    // 危险：使用GET方法执行删除操作
    const userId = parseInt(req.params.id);
    
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
        const deletedUser = users.splice(userIndex, 1)[0];
        
        res.json({
            message: '用户删除成功（通过GET方法）',
            deletedUser: deletedUser,
            method: 'GET',
            warning: '使用GET方法执行敏感操作，容易被CSRF攻击'
        });
    } else {
        res.status(404).json({ error: '用户未找到' });
    }
});

// 12. 参数污染攻击
app.get('/users/search', (req, res) => {
    const { id, username, role } = req.query;
    
    let filteredUsers = users;
    
    // 危险：参数污染可能导致访问控制绕过
    if (id) {
        // 如果id参数被重复提交，只使用第一个值
        const userId = Array.isArray(id) ? parseInt(id[0]) : parseInt(id);
        filteredUsers = filteredUsers.filter(u => u.id === userId);
    }
    
    if (username) {
        const searchUsername = Array.isArray(username) ? username[0] : username;
        filteredUsers = filteredUsers.filter(u => u.username.includes(searchUsername));
    }
    
    if (role) {
        const searchRole = Array.isArray(role) ? role[0] : role;
        filteredUsers = filteredUsers.filter(u => u.role === searchRole);
    }
    
    res.json({
        users: filteredUsers,
        queryParams: req.query,
        vulnerability: 'parameter_pollution',
        warning: '参数污染可能导致访问控制绕过'
    });
});

app.listen(3000, () => {
    console.log('访问控制缺陷演示服务器运行在端口3000');
});