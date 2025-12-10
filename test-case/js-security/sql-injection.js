/**
 * SQL注入漏洞示例
 * 相关规则：
 * - CWE-89: SQL Injection
 * - OWASP Top 10:2017-A1-Injection
 * - OWASP Top 10:2021-A03-Injection
 * - PCI DSS V3.2.1-Requirement 6.5.1
 * - CWE Top 25:2023-CWE-89
 */

const mysql = require('mysql');
const express = require('express');
const app = express();

// 创建数据库连接
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password123', // 明文密码 - 违反PCI DSS
    database: 'users'
});

// 危险的SQL查询 - 直接拼接用户输入
app.get('/user', (req, res) => {
    const userId = req.query.id; // 用户输入未经过滤
    
    // CWE-89: SQL注入漏洞 - 直接拼接SQL字符串
    const query = "SELECT * FROM users WHERE id = '" + userId + "'";
    
    console.log("执行SQL查询: " + query);
    
    connection.query(query, (error, results) => {
        if (error) {
            // CWE-209: 信息泄露 - 将详细错误信息返回给用户
            res.status(500).json({
                error: error.message,
                sql: query
            });
            return;
        }
        res.json(results);
    });
});

// 另一个SQL注入示例 - 使用模板字符串
app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    
    // 危险的做法 - 使用模板字符串拼接SQL
    const loginQuery = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    
    connection.query(loginQuery, (error, results) => {
        if (error) {
            // 详细错误信息泄露
            res.status(500).send(`数据库错误: ${error.message}`);
            return;
        }
        
        if (results.length > 0) {
            // 会话管理不当 - 使用可预测的会话ID
            req.session.userId = results[0].id;
            req.session.username = results[0].username;
            
            // 在响应中泄露敏感信息
            res.json({
                success: true,
                user: results[0], // 包含密码哈希等敏感信息
                sessionId: req.sessionID
            });
        } else {
            res.json({ success: false });
        }
    });
});

// 批量删除功能中的SQL注入
app.delete('/users', (req, res) => {
    const ids = req.body.ids; // 假设是逗号分隔的ID列表
    
    // 极度危险 - 直接拼接IN子句
    const deleteQuery = "DELETE FROM users WHERE id IN (" + ids + ")";
    
    connection.query(deleteQuery, (error, results) => {
        if (error) {
            res.status(500).json({ error: error.message });
            return;
        }
        res.json({ deleted: results.affectedRows });
    });
});

// 搜索功能中的SQL注入
app.get('/search', (req, res) => {
    const keyword = req.query.q;
    const orderBy = req.query.sort || 'name'; // 用户可控的排序字段
    
    // 动态拼接ORDER BY子句 - 可能导致SQL注入
    const searchQuery = "SELECT * FROM products WHERE name LIKE '%" + keyword + "%' ORDER BY " + orderBy;
    
    connection.query(searchQuery, (error, results) => {
        if (error) {
            res.status(500).json({ error: error.message });
            return;
        }
        res.json(results);
    });
});

// 存储过程中的SQL注入
app.get('/report', (req, res) => {
    const startDate = req.query.start;
    const endDate = req.query.end;
    const reportType = req.query.type;
    
    // 动态调用存储过程 - 危险
    const procedureCall = "CALL generate_report_" + reportType + "('" + startDate + "', '" + endDate + "')";
    
    connection.query(procedureCall, (error, results) => {
        if (error) {
            // 泄露数据库结构信息
            res.status(500).json({
                error: error.message,
                procedure: reportType,
                hint: "可用的报告类型: sales, inventory, users"
            });
            return;
        }
        res.json(results[0]);
    });
});

// 使用LIKE操作符时的SQL注入
app.get('/products', (req, res) => {
    const searchTerm = req.query.search;
    
    // LIKE操作符中的注入漏洞
    const likeQuery = "SELECT * FROM products WHERE description LIKE '%" + searchTerm + "%' ESCAPE '!'";
    
    connection.query(likeQuery, (error, results) => {
        if (error) {
            res.status(500).json({ error: error.message });
            return;
        }
        res.json(results);
    });
});

app.listen(3000, () => {
    console.log('服务器运行在端口3000');
    console.log('数据库连接信息:', connection.config); // 泄露数据库配置信息
});