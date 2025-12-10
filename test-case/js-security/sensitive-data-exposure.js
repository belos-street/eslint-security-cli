/**
 * 敏感数据泄露漏洞示例
 * 相关规则：
 * - CWE-200: Information Exposure
 * - CWE-209: Information Exposure Through Error Messages
 * - CWE-213: Exposure of Sensitive Information Due to Incompatible Policies
 * - CWE-532: Information Exposure Through Log Files
 * - CWE-534: Information Exposure Through Debug Log Files
 * - OWASP Top 10:2017-A3-Sensitive Data Exposure
 * - OWASP Top 10:2021-A02-Cryptographic Failures
 * - PCI DSS V3.2.1-Requirement 3.4, 6.5.5
 * - CWE Top 25:2023-CWE-200
 */

const express = require('express');
const fs = require('fs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1. 数据库连接信息泄露
const databaseConfig = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'SuperSecretPassword123!', // 明文密码
    database: 'user_data',
    ssl: false, // 未使用SSL
    connectionLimit: 10
};

app.get('/api/config', (req, res) => {
    // 危险：泄露完整的数据库配置信息
    res.json({
        database: databaseConfig,
        server: {
            port: 3000,
            environment: 'production',
            debug: true, // 在生产环境中启用调试
            version: '1.0.0'
        },
        features: {
            logging: true,
            monitoring: true,
            analytics: true
        }
    });
});

// 2. 详细的错误信息泄露
app.get('/api/users/:id', (req, res) => {
    const userId = req.params.id;

    try {
        // 模拟数据库查询
        const query = `SELECT * FROM users WHERE id = ${userId}`;

        // 模拟数据库错误
        if (userId === '999') {
            throw new Error(`Database query failed: ${query}. Connection timeout after 30000ms. Host: ${databaseConfig.host}:${databaseConfig.port}, User: ${databaseConfig.user}`);
        }

        // 模拟用户不存在
        if (userId === '888') {
            return res.status(404).json({
                error: 'User not found',
                query: query,
                database: databaseConfig.database,
                table: 'users',
                searchedId: userId
            });
        }

        // 模拟成功响应
        res.json({
            id: userId,
            username: 'john_doe',
            email: 'john@example.com',
            password_hash: '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', // 泄露密码哈希
            api_key: 'sk-1234567890abcdef1234567890abcdef', // 泄露API密钥
            created_at: '2023-01-01T00:00:00Z',
            last_login: '2023-12-01T12:00:00Z'
        });

    } catch (error) {
        // 危险：泄露详细的错误信息
        res.status(500).json({
            error: error.message,
            stack: error.stack, // 泄露堆栈信息
            query: query,
            databaseConfig: databaseConfig,
            serverInfo: {
                nodeVersion: process.version,
                platform: process.platform,
                arch: process.arch,
                uptime: process.uptime()
            }
        });
    }
});

// 3. JWT密钥泄露
const JWT_SECRET = 'my-super-secret-jwt-key-that-should-be-hidden'; // 硬编码的JWT密钥
const JWT_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuGbXWiK3dQTyCbX5xdE4
yCuYp0ySiTxoUbkv8wxm8fYK/5nnOmSmJAGWiMOH9QBfJJjnKLcm7pO6YkYTAqH2
eGG0nPHOhBp4bVj7RHf3JXBAe5AX6cXbCCM9Hx0xTG1vV7KtOY1QXo1QsNGSGrRT
8CIBsj5B/2YxH+LxJ6J6lx6N9fqL8qE1EEkF+zL0+AOg6WQ/QYmR9nCJ7IzE8lZ1
tWs6Xnz0YWo7hkJf+sEZ0q6M7/TfA1RU6Vz8+qz3GJK4BLhd7CQr0lZZlQH2kjU6
I4JCf1JrUZmLGKQgqwR9L0Sg1p4vYn1FQeLxrjhGHwSJZBB8yL7K6A8k8FgQSgQI
FQIDAQAB
-----END PUBLIC KEY-----`;

app.get('/api/auth/keys', (req, res) => {
    // 危险：泄露JWT密钥和公钥
    res.json({
        jwtSecret: JWT_SECRET,
        jwtPublicKey: JWT_PUBLIC_KEY,
        jwtAlgorithm: 'HS256',
        jwtExpiration: '24h',
        refreshTokenSecret: 'another-secret-key-for-refresh-tokens'
    });
});

// 4. 环境变量泄露
app.get('/api/system/env', (req, res) => {
    // 危险：泄露所有环境变量
    res.json({
        environment: process.env,
        nodeEnv: process.env.NODE_ENV,
        databaseUrl: process.env.DATABASE_URL,
        apiKeys: {
            stripe: process.env.STRIPE_SECRET_KEY,
            sendgrid: process.env.SENDGRID_API_KEY,
            aws: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                region: process.env.AWS_REGION
            }
        },
        secrets: process.env.SECRETS ? JSON.parse(process.env.SECRETS) : null
    });
});

// 5. 日志文件中的敏感信息泄露
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    // 危险：在日志中记录明文密码
    console.log(`[LOGIN ATTEMPT] Username: ${username}, Password: ${password}, IP: ${req.ip}, User-Agent: ${req.headers['user-agent']}`);

    // 写入详细的日志文件
    const logEntry = {
        timestamp: new Date().toISOString(),
        action: 'login_attempt',
        username: username,
        password: password, // 明文密码！
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        headers: req.headers, // 包含敏感头信息
        body: req.body // 完整的请求体
    };

    fs.appendFileSync('./logs/auth.log', JSON.stringify(logEntry) + '\n');

    // 模拟认证
    if (username === 'admin' && password === 'admin123') {
        const token = jwt.sign({
            userId: 1,
            username: username,
            role: 'admin',
            permissions: ['read', 'write', 'delete', 'admin']
        }, JWT_SECRET, { expiresIn: '24h' });

        res.json({
            success: true,
            token: token,
            user: {
                id: 1,
                username: username,
                email: 'admin@example.com',
                role: 'admin',
                apiKey: 'admin-secret-key-12345', // 泄露管理员API密钥
                databasePassword: 'admin-db-password' // 泄露数据库密码
            }
        });
    } else {
        res.status(401).json({
            error: 'Invalid credentials',
            username: username,
            attemptedPassword: password, // 泄露尝试的密码
            hint: 'Default credentials are admin/admin123'
        });
    }
});

// 6. 堆栈跟踪信息泄露
app.get('/api/debug/error', (req, res) => {
    // 故意制造错误来展示堆栈信息
    const obj = null;

    try {
        obj.someProperty; // 这将抛出TypeError
    } catch (error) {
        // 危险：泄露完整的错误堆栈和系统信息
        res.status(500).json({
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack,
                code: error.code || 'UNKNOWN_ERROR'
            },
            system: {
                version: process.version,
                platform: process.platform,
                arch: process.arch,
                memoryUsage: process.memoryUsage(),
                uptime: process.uptime(),
                cwd: process.cwd(),
                execPath: process.execPath,
                argv: process.argv
            },
            environment: {
                NODE_ENV: process.env.NODE_ENV,
                PORT: process.env.PORT,
                DEBUG: process.env.DEBUG
            },
            request: {
                method: req.method,
                url: req.url,
                headers: req.headers,
                query: req.query,
                body: req.body,
                ip: req.ip,
                ips: req.ips
            }
        });
    }
});

// 7. 源代码泄露
app.get('/api/debug/source', (req, res) => {
    const filename = req.query.file || 'app.js';

    // 危险：允许用户读取源代码文件
    const filePath = `./${filename}`;

    try {
        const sourceCode = fs.readFileSync(filePath, 'utf8');

        res.json({
            filename: filename,
            path: filePath,
            size: sourceCode.length,
            content: sourceCode, // 泄露源代码
            lines: sourceCode.split('\n').length,
            lastModified: fs.statSync(filePath).mtime
        });
    } catch (error) {
        res.status(500).json({
            error: error.message,
            attemptedFile: filePath,
            availableFiles: fs.readdirSync('./'),
            hint: 'Try app.js, package.json, or .env'
        });
    }
});

// 8. 配置文件泄露
app.get('/api/config/files', (req, res) => {
    const configFiles = [
        'config.json',
        'database.json',
        'secrets.json',
        'api-keys.json',
        '.env',
        '.env.local',
        '.env.production'
    ];

    const configs = {};

    configFiles.forEach(file => {
        try {
            if (fs.existsSync(file)) {
                const content = fs.readFileSync(file, 'utf8');
                configs[file] = {
                    exists: true,
                    content: file.includes('.env') ? content : JSON.parse(content),
                    size: content.length,
                    lastModified: fs.statSync(file).mtime
                };
            } else {
                configs[file] = { exists: false };
            }
        } catch (error) {
            configs[file] = {
                exists: true,
                error: error.message,
                rawContent: fs.readFileSync(file, 'utf8')
            };
        }
    });

    res.json(configs);
});

// 9. 会话信息泄露
const sessions = new Map();

app.get('/api/sessions', (req, res) => {
    // 危险：泄露所有活跃的会话信息
    const allSessions = Array.from(sessions.entries()).map(([sessionId, sessionData]) => ({
        sessionId: sessionId,
        userId: sessionData.userId,
        username: sessionData.username,
        email: sessionData.email,
        role: sessionData.role,
        permissions: sessionData.permissions,
        ip: sessionData.ip,
        userAgent: sessionData.userAgent,
        createdAt: sessionData.createdAt,
        lastActivity: sessionData.lastActivity,
        token: sessionData.token, // 泄露会话令牌！
        refreshToken: sessionData.refreshToken // 泄露刷新令牌！
    }));

    res.json({
        totalSessions: allSessions.length,
        sessions: allSessions,
        sessionStore: {
            type: 'In-Memory',
            size: sessions.size,
            keys: Array.from(sessions.keys())
        }
    });
});

// 10. 加密密钥泄露
const encryptionKey = 'my-encryption-key-1234567890123456'; // 硬编码加密密钥
const encryptionIV = 'my-iv-vector-123'; // 硬编码IV

app.get('/api/crypto/keys', (req, res) => {
    // 危险：泄露加密密钥
    res.json({
        encryptionKey: encryptionKey,
        encryptionIV: encryptionIV,
        algorithm: 'aes-256-cbc',
        keySize: 256,
        availableKeys: {
            'payment-key': 'payment-encryption-key-2023',
            'user-data-key': 'user-data-encryption-key',
            'api-key-encryption': 'api-key-encryption-secret',
            'backup-encryption': 'backup-encryption-key-secure'
        },
        keyGeneration: {
            method: 'static',
            lastRotated: 'never',
            rotationPolicy: 'manual'
        }
    });
});

// 11. 用户数据泄露
const users = [
    {
        id: 1,
        username: 'john_doe',
        email: 'john@example.com',
        password: 'hashed_password_123',
        ssn: '123-45-6789', // 社会安全号码
        creditCard: '4111-1111-1111-1111', // 信用卡号
        cvv: '123', // CVV码
        expiration: '12/25',
        address: '123 Main St, Anytown, ST 12345',
        phone: '+1-555-123-4567',
        dateOfBirth: '1990-01-01',
        motherMaidenName: 'Smith', // 母亲婚前姓名
        firstPet: 'Fluffy', // 第一只宠物名字
        securityQuestions: {
            'firstSchool': 'Lincoln Elementary',
            'favoriteTeacher': 'Mrs. Johnson',
            'childhoodFriend': 'Tommy'
        }
    }
];

app.get('/api/users/all', (req, res) => {
    // 危险：泄露所有用户的敏感信息
    res.json({
        totalUsers: users.length,
        users: users,
        sensitiveFields: ['ssn', 'creditCard', 'cvv', 'securityQuestions'],
        dataRetention: 'forever',
        encryptionStatus: 'none'
    });
});

// 12. 网络配置泄露
app.get('/api/network/config', (req, res) => {
    res.json({
        server: {
            hostname: require('os').hostname(),
            networkInterfaces: require('os').networkInterfaces(),
            listeningPorts: [3000, 3306, 6379, 8080, 22, 21],
            firewallRules: 'disabled',
            sslConfiguration: 'default'
        },
        database: {
            connectionString: 'mysql://root:SuperSecretPassword123!@localhost:3306/user_data',
            maxConnections: 100,
            timeout: 30000,
            charset: 'utf8mb4'
        },
        cache: {
            redis: {
                host: 'localhost',
                port: 6379,
                password: 'redis-password-123',
                db: 0
            }
        }
    });
});

app.listen(3000, () => {
    console.log('敏感数据泄露漏洞演示服务器运行在端口3000');
});