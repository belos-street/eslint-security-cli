/**
 * 路径遍历漏洞示例
 * 相关规则：
 * - CWE-22: Path Traversal
 * - CWE-23: Relative Path Traversal
 * - CWE-36: Absolute Path Traversal
 * - CWE-73: External Control of File Name or Path
 * - OWASP Top 10:2017-A5-Broken Access Control
 * - OWASP Top 10:2021-A01-Broken Access Control
 * - PCI DSS V3.2.1-Requirement 6.5.3
 * - CWE Top 25:2023-CWE-22
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 基础路径遍历漏洞 - 文件读取
app.get('/read-file', (req, res) => {
    const filename = req.query.filename;

    if (!filename) {
        res.status(400).send('缺少文件名参数');
        return;
    }

    // 危险：直接使用用户输入的文件名，未进行路径验证
    const filePath = './uploads/' + filename;

    console.log(`尝试读取文件: ${filePath}`);

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).json({
                error: err.message,
                attemptedPath: filePath
            });
            return;
        }

        res.json({
            content: data,
            filename: filename,
            path: filePath
        });
    });
});

// 路径遍历漏洞 - 文件下载
app.get('/download', (req, res) => {
    const file = req.query.file;

    if (!file) {
        res.status(400).send('缺少文件参数');
        return;
    }

    // 危险：使用path.join但没有验证最终路径
    const filePath = path.join('./documents/', file);

    console.log(`下载文件路径: ${filePath}`);

    // 检查文件是否存在
    if (fs.existsSync(filePath)) {
        // 泄露文件真实路径
        res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filePath)}"`);
        res.setHeader('X-File-Path', filePath); // 泄露服务器路径信息

        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    } else {
        res.status(404).json({
            error: '文件不存在',
            searchedPath: filePath,
            availableFiles: fs.readdirSync('./documents/')
        });
    }
});

// 路径遍历 - 文件删除功能
app.delete('/delete', (req, res) => {
    const filepath = req.body.filepath;
    const userId = req.body.userId;

    if (!filepath) {
        res.status(400).send('缺少文件路径');
        return;
    }

    // 危险：用户可以直接指定要删除的文件路径
    const fullPath = path.resolve('./user_files/' + userId, filepath);

    console.log(`删除文件: ${fullPath}`);

    fs.unlink(fullPath, (err) => {
        if (err) {
            res.status(500).json({
                error: err.message,
                path: fullPath,
                code: err.code
            });
            return;
        }

        res.json({
            success: true,
            deletedFile: fullPath
        });
    });
});

// 路径遍历 - 文件上传
app.post('/upload', (req, res) => {
    const filename = req.body.filename;
    const content = req.body.content;
    const uploadDir = req.body.uploadDir || 'uploads';

    if (!filename || !content) {
        res.status(400).send('缺少文件名或内容');
        return;
    }

    // 危险：用户可以控制上传目录和文件名
    const uploadPath = path.join('./', uploadDir, filename);

    console.log(`上传文件到: ${uploadPath}`);

    // 确保目录存在
    const dir = path.dirname(uploadPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFile(uploadPath, content, (err) => {
        if (err) {
            res.status(500).json({
                error: err.message,
                path: uploadPath
            });
            return;
        }

        res.json({
            success: true,
            filename: filename,
            path: uploadPath,
            size: content.length
        });
    });
});

// 路径遍历 - 文件重命名
app.put('/rename', (req, res) => {
    const oldPath = req.body.oldPath;
    const newPath = req.body.newPath;
    const baseDir = req.body.baseDir || './files';

    if (!oldPath || !newPath) {
        res.status(400).send('缺少路径参数');
        return;
    }

    // 危险：用户可以控制相对路径
    const oldFullPath = path.join(baseDir, oldPath);
    const newFullPath = path.join(baseDir, newPath);

    console.log(`重命名: ${oldFullPath} -> ${newFullPath}`);

    fs.rename(oldFullPath, newFullPath, (err) => {
        if (err) {
            res.status(500).json({
                error: err.message,
                oldPath: oldFullPath,
                newPath: newFullPath
            });
            return;
        }

        res.json({
            success: true,
            oldPath: oldFullPath,
            newPath: newFullPath
        });
    });
});

// 路径遍历 - 文件列表
app.get('/list-files', (req, res) => {
    const directory = req.query.dir;
    const recursive = req.query.recursive === 'true';
    const pattern = req.query.pattern || '*';

    if (!directory) {
        res.status(400).send('缺少目录参数');
        return;
    }

    // 危险：用户可以访问任何目录
    const targetDir = path.join('./public/', directory);

    console.log(`列出目录: ${targetDir}`);

    function listFiles(dir, isRecursive) {
        let results = [];
        const items = fs.readdirSync(dir);

        items.forEach(item => {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory() && isRecursive) {
                results = results.concat(listFiles(fullPath, true));
            } else {
                // 泄露完整路径信息
                results.push({
                    name: item,
                    path: fullPath,
                    size: stat.size,
                    modified: stat.mtime,
                    permissions: stat.mode
                });
            }
        });

        return results;
    }

    try {
        const files = listFiles(targetDir, recursive);

        res.json({
            directory: targetDir,
            files: files,
            totalFiles: files.length,
            pattern: pattern
        });
    } catch (err) {
        res.status(500).json({
            error: err.message,
            directory: targetDir
        });
    }
});

// 路径遍历 - 文件内容预览
app.get('/preview', (req, res) => {
    const file = req.query.file;
    const maxLines = parseInt(req.query.lines) || 50;
    const encoding = req.query.encoding || 'utf8';

    if (!file) {
        res.status(400).send('缺少文件参数');
        return;
    }

    // 危险：用户可以访问任意文件
    const filePath = path.resolve('./files/', file);

    console.log(`预览文件: ${filePath}`);

    // 检查文件类型
    const ext = path.extname(filePath).toLowerCase();
    const allowedExtensions = ['.txt', '.md', '.json', '.xml', '.csv', '.log'];

    if (!allowedExtensions.includes(ext)) {
        res.status(400).json({
            error: '不允许的文件类型',
            extension: ext,
            allowedTypes: allowedExtensions
        });
        return;
    }

    const readStream = fs.createReadStream(filePath, {
        encoding: encoding,
        highWaterMark: 1024 * maxLines
    });

    let content = '';
    let lineCount = 0;

    readStream.on('data', (chunk) => {
        const lines = chunk.split('\n');
        for (let line of lines) {
            if (lineCount >= maxLines) break;
            content += line + '\n';
            lineCount++;
        }
    });

    readStream.on('end', () => {
        res.json({
            content: content,
            file: filePath,
            linesShown: lineCount,
            encoding: encoding
        });
    });

    readStream.on('error', (err) => {
        res.status(500).json({
            error: err.message,
            file: filePath
        });
    });
});

// 路径遍历 - 文件压缩
app.get('/compress', (req, res) => {
    const files = req.query.files ? req.query.files.split(',') : [];
    const outputFile = req.query.output || 'archive.zip';
    const compressionLevel = req.query.level || '6';

    if (files.length === 0) {
        res.status(400).send('缺少文件列表');
        return;
    }

    // 危险：用户可以指定任意文件进行压缩
    const filePaths = files.map(file => path.join('./documents/', file.trim()));
    const outputPath = path.join('./archives/', outputFile);

    console.log(`压缩文件: ${filePaths.join(', ')} -> ${outputPath}`);

    // 使用系统命令进行压缩
    const { exec } = require('child_process');
    const command = `zip -${compressionLevel} "${outputPath}" ${filePaths.map(p => `"${p}"`).join(' ')}`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            res.status(500).json({
                error: error.message,
                command: command,
                stderr: stderr
            });
            return;
        }

        // 提供下载
        res.download(outputPath, outputFile, (err) => {
            if (err) {
                console.error('下载错误:', err);
            }
            // 清理临时文件
            fs.unlink(outputPath, () => { });
        });
    });
});

// 路径遍历 - 配置文件读取
app.get('/config', (req, res) => {
    const configName = req.query.name;
    const format = req.query.format || 'json';

    if (!configName) {
        res.status(400).send('缺少配置名称');
        return;
    }

    // 危险：用户可以读取任意配置文件
    const configPath = path.join('./config/', configName + '.conf');

    console.log(`读取配置: ${configPath}`);

    fs.readFile(configPath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).json({
                error: err.message,
                configPath: configPath,
                availableConfigs: fs.readdirSync('./config/')
            });
            return;
        }

        let response;
        if (format === 'json') {
            try {
                response = JSON.parse(data);
            } catch (e) {
                response = { raw: data };
            }
        } else {
            response = { content: data };
        }

        // 泄露配置文件的完整路径
        res.json({
            config: response,
            path: configPath,
            lastModified: fs.statSync(configPath).mtime
        });
    });
});

// 路径遍历 - 日志文件查看
app.get('/logs', (req, res) => {
    const logFile = req.query.file;
    const level = req.query.level || 'info';
    const date = req.query.date;

    if (!logFile && !date) {
        res.status(400).send('缺少日志文件或日期参数');
        return;
    }

    let logPath;
    if (logFile) {
        // 危险：用户可以指定任意日志文件
        logPath = path.join('./logs/', logFile);
    } else {
        // 根据日期构建日志文件名
        logPath = path.join('./logs/', `${level}-${date}.log`);
    }

    console.log(`查看日志: ${logPath}`);

    // 检查文件大小
    const stats = fs.statSync(logPath);
    if (stats.size > 10 * 1024 * 1024) { // 10MB限制
        res.status(400).json({
            error: '日志文件过大',
            size: stats.size,
            maxSize: 10 * 1024 * 1024
        });
        return;
    }

    fs.readFile(logPath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).json({
                error: err.message,
                logPath: logPath
            });
            return;
        }

        // 泄露日志文件路径和内容
        res.json({
            logs: data.split('\n'),
            logPath: logPath,
            size: stats.size,
            lastModified: stats.mtime
        });
    });
});

app.listen(3000, () => {
    console.log('路径遍历漏洞演示服务器运行在端口3000');
});