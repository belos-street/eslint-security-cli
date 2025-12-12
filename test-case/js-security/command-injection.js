/**
 * 命令注入漏洞示例
 * 相关规则：
 * - CWE-78: OS Command Injection
 * - CWE-77: Command Injection
 * - OWASP Top 10:2017-A1-Injection
 * - OWASP Top 10:2021-A03-Injection
 * - PCI DSS V3.2.1-Requirement 6.5.1
 * - CWE Top 25:2023-CWE-78
 */

const express = require('express');
const { exec, spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1. 直接执行用户输入的系统命令
app.get('/ping', (req, res) => {
    const host = req.query.host;

    if (!host) {
        res.status(400).send('缺少主机参数');
        return;
    }

    // 危险：直接拼接用户输入到命令中
    const command = `ping -c 4 ${host}`;

    console.log(`执行命令: ${command}`);

    exec(command, (error, stdout, stderr) => {
        if (error) {
            // 泄露系统信息
            res.status(500).json({
                error: error.message,
                command: command,
                stderr: stderr
            });
            return;
        }

        res.json({
            output: stdout,
            command: command
        });
    });
});

// 2. 使用spawn执行命令 - 同样存在注入风险
app.get('/nslookup', (req, res) => {
    const domain = req.query.domain;
    const type = req.query.type || 'A';

    // 危险：用户输入直接作为命令参数
    const nslookup = spawn('nslookup', ['-type=' + type, domain]);

    let output = '';
    let errorOutput = '';

    nslookup.stdout.on('data', (data) => {
        output += data.toString();
    });

    nslookup.stderr.on('data', (data) => {
        errorOutput += data.toString();
    });

    nslookup.on('close', (code) => {
        if (code !== 0) {
            res.status(500).json({
                error: '命令执行失败',
                code: code,
                stderr: errorOutput,
                command: `nslookup -type=${type} ${domain}`
            });
        } else {
            res.json({
                output: output,
                code: code
            });
        }
    });
});

// 3. 文件处理中的命令注入
app.post('/convert', (req, res) => {
    const inputFile = req.body.inputFile;
    const outputFormat = req.body.format;
    const options = req.body.options || '';

    // 危险：文件转换命令注入
    const convertCommand = `convert ${inputFile} ${options} output.${outputFormat}`;

    exec(convertCommand, (error, stdout, stderr) => {
        if (error) {
            res.status(500).json({
                error: error.message,
                command: convertCommand,
                workingDirectory: process.cwd()
            });
            return;
        }

        // 读取输出文件并返回
        fs.readFile(`output.${outputFormat}`, (err, data) => {
            if (err) {
                res.status(500).json({ error: '读取输出文件失败' });
                return;
            }

            res.json({
                success: true,
                fileSize: data.length,
                command: convertCommand
            });

            // 清理临时文件
            fs.unlink(`output.${outputFormat}`, () => { });
        });
    });
});

// 4. 备份功能中的命令注入
app.get('/backup', (req, res) => {
    const database = req.query.db;
    const backupType = req.query.type || 'full';
    const compression = req.query.compress || 'gzip';

    // 危险：数据库备份命令注入
    let backupCommand;
    if (backupType === 'full') {
        backupCommand = `mysqldump -u root -ppassword ${database} | ${compression} > backup_${database}_$(date +%Y%m%d).sql.gz`;
    } else {
        backupCommand = `mysqldump -u root -ppassword --no-data ${database} > backup_${database}_schema.sql`;
    }

    console.log(`执行备份命令: ${backupCommand}`);

    exec(backupCommand, (error, stdout, stderr) => {
        if (error) {
            res.status(500).json({
                error: error.message,
                command: backupCommand,
                database: database
            });
            return;
        }

        res.json({
            success: true,
            message: `数据库 ${database} 备份完成`,
            command: backupCommand
        });
    });
});

// 5. 网络工具中的命令注入
app.get('/traceroute', (req, res) => {
    const target = req.query.target;
    const options = req.query.options || '';
    const maxHops = req.query.maxHops || 30;

    // 危险：traceroute命令注入
    const tracerouteCommand = `traceroute ${options} -m ${maxHops} ${target}`;

    exec(tracerouteCommand, (error, stdout, stderr) => {
        if (error) {
            res.status(500).json({
                error: error.message,
                command: tracerouteCommand,
                stderr: stderr
            });
            return;
        }

        res.json({
            output: stdout,
            target: target,
            command: tracerouteCommand
        });
    });
});

// 6. 文件搜索功能中的命令注入
app.get('/search-files', (req, res) => {
    const directory = req.query.dir;
    const pattern = req.query.pattern;
    const fileType = req.query.type || '*';

    // 危险：find命令注入
    const searchCommand = `find ${directory} -name "${pattern}" -type ${fileType === 'dir' ? 'd' : 'f'}`;

    exec(searchCommand, (error, stdout, stderr) => {
        if (error) {
            res.status(500).json({
                error: error.message,
                command: searchCommand,
                directory: directory
            });
            return;
        }

        const files = stdout.split('\n').filter(line => line.trim() !== '');
        res.json({
            files: files,
            count: files.length,
            command: searchCommand
        });
    });
});

// 7. 系统信息收集中的命令注入
app.get('/system-info', (req, res) => {
    const infoType = req.query.type || 'basic';
    const format = req.query.format || 'json';

    let command;
    switch (infoType) {
        case 'cpu':
            command = `lscpu ${req.query.options || ''}`;
            break;
        case 'memory':
            command = `free -h ${req.query.options || ''}`;
            break;
        case 'disk':
            command = `df -h ${req.query.options || ''}`;
            break;
        case 'network':
            command = `ip addr show ${req.query.interface || ''}`;
            break;
        default:
            command = `uname -a ${req.query.options || ''}`;
    }

    exec(command, (error, stdout, stderr) => {
        if (error) {
            res.status(500).json({
                error: error.message,
                command: command,
                infoType: infoType
            });
            return;
        }

        if (format === 'json') {
            res.json({
                infoType: infoType,
                output: stdout,
                command: command
            });
        } else {
            res.type('text/plain').send(stdout);
        }
    });
});

// 8. 使用execSync同步执行命令
app.get('/sync-command', (req, res) => {
    const command = req.query.cmd;
    const timeout = parseInt(req.query.timeout) || 5000;

    try {
        // 危险：同步执行用户提供的命令
        const output = execSync(command, {
            timeout: timeout,
            encoding: 'utf8',
            shell: '/bin/bash'
        });

        res.json({
            output: output,
            command: command,
            timeout: timeout
        });
    } catch (error) {
        res.status(500).json({
            error: error.message,
            command: command,
            stderr: error.stderr ? error.stderr.toString() : '',
            stdout: error.stdout ? error.stdout.toString() : ''
        });
    }
});

// 9. 批量处理中的命令注入
app.post('/batch-process', (req, res) => {
    const commands = req.body.commands; // 数组形式的命令列表
    const parallel = req.body.parallel || false;

    const results = [];
    let completed = 0;

    if (parallel) {
        // 并行执行多个命令
        commands.forEach((cmd, index) => {
            exec(cmd, (error, stdout, stderr) => {
                results[index] = {
                    command: cmd,
                    output: stdout,
                    error: error ? error.message : null,
                    stderr: stderr
                };

                completed++;
                if (completed === commands.length) {
                    res.json({
                        results: results,
                        totalCommands: commands.length,
                        parallel: true
                    });
                }
            });
        });
    } else {
        // 串行执行命令
        function executeNext(index) {
            if (index >= commands.length) {
                res.json({
                    results: results,
                    totalCommands: commands.length,
                    parallel: false
                });
                return;
            }

            const cmd = commands[index];
            exec(cmd, (error, stdout, stderr) => {
                results.push({
                    command: cmd,
                    output: stdout,
                    error: error ? error.message : null,
                    stderr: stderr
                });

                executeNext(index + 1);
            });
        }

        executeNext(0);
    }
});

// 10. 管道命令中的注入
app.get('/pipe-command', (req, res) => {
    const input = req.query.input;
    const filters = req.query.filters || ''; // 逗号分隔的过滤器
    const outputFile = req.query.output;

    // 构建管道命令
    let pipeline = `echo "${input}"`;

    if (filters) {
        const filterList = filters.split(',');
        filterList.forEach(filter => {
            pipeline += ` | ${filter.trim()}`;
        });
    }

    if (outputFile) {
        pipeline += ` > ${outputFile}`;
    }

    // 危险：复杂的管道命令注入
    exec(pipeline, (error, stdout, stderr) => {
        if (error) {
            res.status(500).json({
                error: error.message,
                pipeline: pipeline,
                stderr: stderr
            });
            return;
        }

        res.json({
            output: stdout,
            pipeline: pipeline,
            filters: filters.split(',')
        });
    });
});

// 11. 环境变量操作中的命令注入
app.post('/set-env', (req, res) => {
    const envVars = req.body.envVars; // 对象形式的环境变量
    const command = req.body.command;

    // 设置环境变量
    for (const [key, value] of Object.entries(envVars)) {
        process.env[key] = value;
    }

    // 危险：在修改后的环境中执行命令
    exec(command, {
        env: { ...process.env, ...envVars },
        shell: '/bin/bash'
    }, (error, stdout, stderr) => {
        if (error) {
            res.status(500).json({
                error: error.message,
                command: command,
                envVars: envVars
            });
            return;
        }

        res.json({
            output: stdout,
            command: command,
            environment: envVars
        });
    });
});

// 12. 使用shell元字符的命令注入
app.get('/advanced-command', (req, res) => {
    const baseCommand = req.query.base;
    const arguments = req.query.args || '';
    const redirect = req.query.redirect || '';
    const background = req.query.background === 'true';

    // 构建复杂的shell命令
    let command = baseCommand;

    if (arguments) {
        command += ' ' + arguments;
    }

    if (redirect) {
        command += ' ' + redirect;
    }

    if (background) {
        command += ' &';
    }

    // 极度危险：允许使用shell元字符
    exec(command, {
        shell: '/bin/bash',
        timeout: 30000
    }, (error, stdout, stderr) => {
        if (error) {
            res.status(500).json({
                error: error.message,
                command: command,
                signal: error.signal
            });
            return;
        }

        res.json({
            output: stdout,
            command: command,
            background: background
        });
    });
});

app.listen(3000, () => {
    console.log('命令注入漏洞演示服务器运行在端口3000');
});