/**
 * 弱加密算法漏洞示例
 * 相关规则：
 * - CWE-327: Use of a Broken or Risky Cryptographic Algorithm
 * - CWE-326: Inadequate Encryption Strength
 * - CWE-329: Not Using a Random IV with CBC Mode
 * - CWE-330: Use of Insufficiently Random Values
 * - OWASP Top 10:2017-A3-Sensitive Data Exposure
 * - OWASP Top 10:2021-A02-Cryptographic Failures
 * - PCI DSS V3.2.1-Requirement 3.5, 3.6, 4.1
 * - CWE Top 25:2023-CWE-327
 */

const express = require('express');
const crypto = require('crypto');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1. 使用弱加密算法 - DES
const WEAK_DES_KEY = '12345678'; // 8字节密钥，太弱

function encryptWithDES(plaintext) {
    const cipher = crypto.createCipher('des', WEAK_DES_KEY); // 使用弱DES算法
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

function decryptWithDES(encrypted) {
    const decipher = crypto.createDecipher('des', WEAK_DES_KEY);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

app.post('/encrypt/des', (req, res) => {
    const { plaintext, key } = req.body;
    
    if (!plaintext) {
        res.status(400).send('缺少明文数据');
        return;
    }
    
    try {
        const encryptionKey = key || WEAK_DES_KEY;
        const encrypted = encryptWithDES(plaintext);
        
        res.json({
            algorithm: 'DES',
            key: encryptionKey, // 泄露加密密钥！
            keyLength: encryptionKey.length * 8,
            plaintext: plaintext,
            encrypted: encrypted,
            strength: 'weak',
            warning: 'DES算法已被破解，不应在生产环境中使用'
        });
    } catch (error) {
        res.status(500).json({
            error: error.message,
            algorithm: 'DES'
        });
    }
});

// 2. 使用ECB模式（不安全）
const ECB_KEY = 'this-is-a-16-byte-key'; // 128位密钥

function encryptWithECB(plaintext) {
    const cipher = crypto.createCipheriv('aes-128-ecb', ECB_KEY, null); // ECB模式不安全
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

function decryptWithECB(encrypted) {
    const decipher = crypto.createDecipheriv('aes-128-ecb', ECB_KEY, null);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

app.post('/encrypt/ecb', (req, res) => {
    const { plaintext } = req.body;
    
    if (!plaintext) {
        res.status(400).send('缺少明文数据');
        return;
    }
    
    try {
        const encrypted = encryptWithECB(plaintext);
        
        res.json({
            algorithm: 'AES-128-ECB',
            mode: 'ECB',
            key: ECB_KEY, // 泄露密钥！
            keyLength: 128,
            iv: 'none', // ECB模式不使用IV
            plaintext: plaintext,
            encrypted: encrypted,
            security: 'insecure',
            warning: 'ECB模式不安全，相同的明文块会产生相同的密文块'
        });
    } catch (error) {
        res.status(500).json({
            error: error.message,
            mode: 'ECB'
        });
    }
});

// 3. 使用固定的IV
const STATIC_IV = '1234567890123456'; // 固定的IV，不安全
const CBC_KEY = 'this-is-a-32-byte-key-for-aes256!'; // 256位密钥

function encryptWithStaticIV(plaintext) {
    const cipher = crypto.createCipheriv('aes-256-cbc', CBC_KEY, STATIC_IV);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

app.post('/encrypt/static-iv', (req, res) => {
    const { plaintext } = req.body;
    
    if (!plaintext) {
        res.status(400).send('缺少明文数据');
        return;
    }
    
    try {
        const encrypted = encryptWithStaticIV(plaintext);
        
        res.json({
            algorithm: 'AES-256-CBC',
            key: CBC_KEY, // 泄露密钥！
            keyLength: 256,
            iv: STATIC_IV, // 泄露固定的IV！
            ivLength: STATIC_IV.length * 8,
            plaintext: plaintext,
            encrypted: encrypted,
            security: 'vulnerable',
            warning: '使用固定的IV会降低加密的安全性'
        });
    } catch (error) {
        res.status(500).json({
            error: error.message,
            ivType: 'static'
        });
    }
});

// 4. 使用弱哈希算法 - MD5
app.post('/hash/md5', (req, res) => {
    const { data, salt } = req.body;
    
    if (!data) {
        res.status(400).send('缺少数据');
        return;
    }
    
    try {
        const hash = crypto.createHash('md5'); // MD5已被破解
        hash.update(data + (salt || ''));
        const digest = hash.digest('hex');
        
        res.json({
            algorithm: 'MD5',
            data: data,
            salt: salt || 'none',
            hash: digest,
            hashLength: digest.length,
            security: 'broken',
            collisions: 'vulnerable',
            warning: 'MD5已被证明存在碰撞攻击，不应再使用'
        });
    } catch (error) {
        res.status(500).json({
            error: error.message,
            algorithm: 'MD5'
        });
    }
});

// 5. 使用弱哈希算法 - SHA1
app.post('/hash/sha1', (req, res) => {
    const { data, iterations } = req.body;
    
    if (!data) {
        res.status(400).send('缺少数据');
        return;
    }
    
    try {
        let hash = crypto.createHash('sha1'); // SHA1已被破解
        hash.update(data);
        let result = hash.digest('hex');
        
        // 多次哈希（仍然不安全）
        for (let i = 1; i < (iterations || 1); i++) {
            hash = crypto.createHash('sha1');
            hash.update(result);
            result = hash.digest('hex');
        }
        
        res.json({
            algorithm: 'SHA1',
            data: data,
            iterations: iterations || 1,
            hash: result,
            hashLength: result.length,
            security: 'weak',
            collisions: 'theoretical',
            warning: 'SHA1已被证明存在理论上的碰撞攻击'
        });
    } catch (error) {
        res.status(500).json({
            error: error.message,
            algorithm: 'SHA1'
        });
    }
});

// 6. 可预测的随机数生成器
function getPredictableRandom() {
    // 使用时间作为种子，可预测
    const seed = Date.now();
    const random = (seed * 9301 + 49297) % 233280;
    return random / 233280;
}

app.get('/random/predictable', (req, res) => {
    const count = parseInt(req.query.count) || 10;
    const numbers = [];
    
    for (let i = 0; i < count; i++) {
        numbers.push(getPredictableRandom());
    }
    
    res.json({
        method: 'predictable_linear_congruential',
        seed: 'current_timestamp',
        numbers: numbers,
        security: 'vulnerable',
        warning: '使用可预测的随机数生成器会降低加密安全性'
    });
});

// 7. 弱密码生成器
function generateWeakPassword(length) {
    const charset = 'abcdefghijklmnopqrstuvwxyz0123456789'; // 字符集太小
    let password = '';
    
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    
    return password;
}

app.get('/password/generate-weak', (req, res) => {
    const length = parseInt(req.query.length) || 8;
    
    if (length < 4) {
        res.status(400).send('密码长度太短');
        return;
    }
    
    const password = generateWeakPassword(length);
    
    res.json({
        password: password,
        length: length,
        charset: 'abcdefghijklmnopqrstuvwxyz0123456789',
        charsetSize: 36,
        entropy: length * Math.log2(36), // 计算熵
        strength: 'weak',
        warning: '字符集太小，容易受到暴力破解攻击'
    });
});

// 8. 自定义弱加密算法
function weakCustomEncrypt(text, key) {
    let result = '';
    for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i);
        const keyChar = key.charCodeAt(i % key.length);
        result += String.fromCharCode(charCode ^ keyChar); // 简单的XOR加密
    }
    return Buffer.from(result).toString('base64');
}

function weakCustomDecrypt(encrypted, key) {
    const decoded = Buffer.from(encrypted, 'base64').toString();
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
        const charCode = decoded.charCodeAt(i);
        const keyChar = key.charCodeAt(i % key.length);
        result += String.fromCharCode(charCode ^ keyChar);
    }
    return result;
}

app.post('/encrypt/custom-weak', (req, res) => {
    const { plaintext, key } = req.body;
    
    if (!plaintext) {
        res.status(400).send('缺少明文数据');
        return;
    }
    
    try {
        const encryptionKey = key || 'secret';
        const encrypted = weakCustomEncrypt(plaintext, encryptionKey);
        const decrypted = weakCustomDecrypt(encrypted, encryptionKey);
        
        res.json({
            algorithm: 'custom_xor',
            key: encryptionKey, // 泄露密钥！
            keyLength: encryptionKey.length * 8,
            method: 'XOR + Base64',
            plaintext: plaintext,
            encrypted: encrypted,
            decrypted: decrypted,
            security: 'extremely_weak',
            warning: '自定义XOR加密非常容易被破解'
        });
    } catch (error) {
        res.status(500).json({
            error: error.message,
            algorithm: 'custom_weak'
        });
    }
});

// 9. 不使用盐值的哈希
app.post('/hash/no-salt', (req, res) => {
    const { password } = req.body;
    
    if (!password) {
        res.status(400).send('缺少密码');
        return;
    }
    
    try {
        // 不使用盐值
        const hash = crypto.createHash('sha256').update(password).digest('hex');
        
        res.json({
            algorithm: 'SHA256',
            salt: 'none',
            password: password, // 泄露原始密码！
            hash: hash,
            security: 'vulnerable_to_rainbow_tables',
            warning: '不使用盐值容易受到彩虹表攻击'
        });
    } catch (error) {
        res.status(500).json({
            error: error.message,
            salt: 'none'
        });
    }
});

// 10. 硬编码密钥
const HARDCODED_KEY = 'this-is-my-secret-encryption-key-32-bytes!'; // 硬编码密钥
const HARDCODED_IV = '1234567890123456'; // 硬编码IV

app.post('/encrypt/hardcoded', (req, res) => {
    const { plaintext } = req.body;
    
    if (!plaintext) {
        res.status(400).send('缺少明文数据');
        return;
    }
    
    try {
        const cipher = crypto.createCipheriv('aes-256-cbc', HARDCODED_KEY, HARDCODED_IV);
        let encrypted = cipher.update(plaintext, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        res.json({
            algorithm: 'AES-256-CBC',
            key: HARDCODED_KEY, // 泄露硬编码密钥！
            iv: HARDCODED_IV, // 泄露硬编码IV！
            keySource: 'hardcoded',
            plaintext: plaintext,
            encrypted: encrypted,
            security: 'vulnerable',
            warning: '硬编码密钥容易被逆向工程获取'
        });
    } catch (error) {
        res.status(500).json({
            error: error.message,
            keySource: 'hardcoded'
        });
    }
});

// 11. 不使用HTTPS的加密传输
app.get('/crypto/transfer-insecure', (req, res) => {
    const sensitiveData = {
        creditCard: '4111-1111-1111-1111',
        cvv: '123',
        expiration: '12/25',
        ssn: '123-45-6789',
        apiKey: 'sk-1234567890abcdef'
    };
    
    // 危险：通过HTTP传输敏感数据
    res.json({
        protocol: 'HTTP',
        encryption: 'none',
        data: sensitiveData,
        warning: '敏感数据应该通过HTTPS传输',
        security: 'vulnerable_to_man_in_the_middle'
    });
});

// 12. 密钥管理不当
const KEY_STORAGE = {
    encryptionKey: 'encryption-key-1234567890123456',
    signingKey: 'signing-key-1234567890123456',
    apiKey: 'api-key-1234567890abcdef',
    databaseKey: 'database-key-1234567890abcdef'
};

app.get('/crypto/key-management', (req, res) => {
    // 危险：泄露所有密钥
    res.json({
        keys: KEY_STORAGE,
        storageMethod: 'plain_text_in_code',
        rotationPolicy: 'never',
        accessControl: 'none',
        backup: 'plain_text_backup',
        security: 'extremely_vulnerable',
        warning: '密钥应该使用专门的密钥管理系统'
    });
});

app.listen(3000, () => {
    console.log('弱加密算法漏洞演示服务器运行在端口3000');
});