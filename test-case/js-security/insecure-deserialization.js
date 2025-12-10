/**
 * 不安全的反序列化漏洞示例
 * 相关规则：
 * - CWE-502: Deserialization of Untrusted Data
 * - CWE-915: Improperly Controlled Modification of Dynamically-Determined Object Attributes
 * - OWASP Top 10:2017-A8-Insecure Deserialization
 * - OWASP Top 10:2021-A08-Software and Data Integrity Failures
 * - PCI DSS V3.2.1-Requirement 6.5.10
 * - CWE Top 25:2023-CWE-502
 */

const express = require('express');
const app = express();
const { exec, spawn } = require('child_process');

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 1. 使用eval()执行用户提供的代码 - 极度危险
app.post('/execute-code', (req, res) => {
    const code = req.body.code;
    const language = req.body.language || 'javascript';
    
    if (!code) {
        res.status(400).send('缺少代码参数');
        return;
    }
    
    try {
        let result;
        
        if (language === 'javascript') {
            // 危险：直接执行用户提供的JavaScript代码
            result = eval(code);
        } else if (language === 'python') {
            // 危险：执行Python代码
            const { execSync } = require('child_process');
            result = execSync(`python3 -c "${code.replace(/"/g, '\\"')}"`, { encoding: 'utf8' });
        }
        
        res.json({
            success: true,
            result: result,
            language: language
        });
    } catch (error) {
        res.status(500).json({
            error: error.message,
            language: language
        });
    }
});

// 2. 不安全的JSON.parse使用
app.post('/process-json', (req, res) => {
    const jsonData = req.body.jsonData;
    const options = req.body.options || {};
    
    if (!jsonData) {
        res.status(400).send('缺少JSON数据');
        return;
    }
    
    try {
        // 危险：直接解析不受信任的JSON数据
        const parsed = JSON.parse(jsonData);
        
        // 危险：使用用户数据调用函数
        if (parsed.action && typeof global[parsed.action] === 'function') {
            const result = global[parsed.action](parsed.args);
            res.json({
                success: true,
                result: result,
                action: parsed.action
            });
            return;
        }
        
        // 危险：动态创建对象属性
        const result = {};
        for (const key in parsed) {
            if (parsed.hasOwnProperty(key)) {
                // 可能导致原型污染
                result[key] = parsed[key];
            }
        }
        
        res.json({
            success: true,
            data: result,
            original: parsed
        });
    } catch (error) {
        res.status(500).json({
            error: error.message,
            jsonData: jsonData
        });
    }
});

// 3. 不安全的JavaScript反序列化
app.post('/deserialize-js', (req, res) => {
    const serializedData = req.body.data;
    const method = req.body.method || 'eval';
    
    if (!serializedData) {
        res.status(400).send('缺少序列化数据');
        return;
    }
    
    try {
        let deserialized;
        
        if (method === 'eval') {
            // 极度危险：使用eval反序列化
            deserialized = eval('(' + serializedData + ')');
        } else if (method === 'function') {
            // 危险：使用Function构造函数
            const func = new Function('return ' + serializedData);
            deserialized = func();
        } else if (method === 'json') {
            // 相对安全但仍然有风险
            deserialized = JSON.parse(serializedData);
        }
        
        // 执行对象中的方法（如果存在）
        if (deserialized && deserialized.execute) {
            const result = deserialized.execute();
            res.json({
                success: true,
                deserialized: deserialized,
                executionResult: result,
                method: method
            });
        } else {
            res.json({
                success: true,
                deserialized: deserialized,
                method: method
            });
        }
    } catch (error) {
        res.status(500).json({
            error: error.message,
            method: method
        });
    }
});

// 4. 不安全的Node.js序列化
const nodeSerialize = require('node-serialize');

app.post('/deserialize-node', (req, res) => {
    const serialized = req.body.serialized;
    const useUnsafe = req.body.unsafe !== false;
    
    if (!serialized) {
        res.status(400).send('缺少序列化数据');
        return;
    }
    
    try {
        let deserialized;
        
        if (useUnsafe) {
            // 危险：使用不安全的反序列化方法
            deserialized = nodeSerialize.unserialize(serialized);
        } else {
            // 相对安全的方法
            deserialized = JSON.parse(serialized);
        }
        
        res.json({
            success: true,
            deserialized: deserialized,
            type: typeof deserialized,
            unsafe: useUnsafe
        });
    } catch (error) {
        res.status(500).json({
            error: error.message,
            unsafe: useUnsafe
        });
    }
});

// 5. 自定义反序列化函数
app.post('/custom-deserialize', (req, res) => {
    const data = req.body.data;
    const deserializer = req.body.deserializer;
    
    if (!data || !deserializer) {
        res.status(400).send('缺少数据或反序列化器');
        return;
    }
    
    try {
        // 危险：使用用户提供的反序列化函数
        const deserializeFunc = new Function('data', deserializer);
        const result = deserializeFunc(data);
        
        res.json({
            success: true,
            result: result,
            deserializer: deserializer
        });
    } catch (error) {
        res.status(500).json({
            error: error.message,
            deserializer: deserializer
        });
    }
});

// 6. YAML反序列化漏洞
const yaml = require('js-yaml');

app.post('/deserialize-yaml', (req, res) => {
    const yamlData = req.body.yaml;
    const unsafeLoad = req.body.unsafe !== false;
    
    if (!yamlData) {
        res.status(400).send('缺少YAML数据');
        return;
    }
    
    try {
        let result;
        
        if (unsafeLoad) {
            // 危险：使用不安全的YAML加载
            result = yaml.load(yamlData);
        } else {
            // 相对安全的方法
            result = yaml.safeLoad(yamlData);
        }
        
        // 执行结果中的函数（如果存在）
        if (result && typeof result === 'object' && result.run) {
            const executionResult = result.run();
            res.json({
                success: true,
                yaml: result,
                executionResult: executionResult,
                unsafe: unsafeLoad
            });
        } else {
            res.json({
                success: true,
                yaml: result,
                unsafe: unsafeLoad
            });
        }
    } catch (error) {
        res.status(500).json({
            error: error.message,
            unsafe: unsafeLoad
        });
    }
});

// 7. XML反序列化漏洞
const xml2js = require('xml2js');

app.post('/deserialize-xml', (req, res) => {
    const xmlData = req.body.xml;
    const options = req.body.options || {};
    
    if (!xmlData) {
        res.status(400).send('缺少XML数据');
        return;
    }
    
    const parser = new xml2js.Parser({
        explicitArray: false,
        ...options
    });
    
    parser.parseString(xmlData, (err, result) => {
        if (err) {
            res.status(500).json({
                error: err.message,
                xml: xmlData
            });
            return;
        }
        
        // 危险：处理XML中的实体
        if (result && result.entity) {
            // 可能导致XXE攻击
            res.json({
                success: true,
                xml: result,
                entityProcessed: true
            });
        } else {
            res.json({
                success: true,
                xml: result
            });
        }
    });
});

// 8. 使用构造函数的反序列化
app.post('/constructor-deserialize', (req, res) => {
    const constructorData = req.body.constructorData;
    const constructorName = req.body.constructorName;
    
    if (!constructorData || !constructorName) {
        res.status(400).send('缺少构造函数数据');
        return;
    }
    
    try {
        // 危险：使用用户提供的构造函数名
        const Constructor = global[constructorName] || eval(constructorName);
        const instance = new Constructor(constructorData);
        
        res.json({
            success: true,
            instance: instance,
            constructorName: constructorName,
            type: typeof instance
        });
    } catch (error) {
        res.status(500).json({
            error: error.message,
            constructorName: constructorName
        });
    }
});

// 9. 原型污染攻击
app.post('/prototype-pollution', (req, res) => {
    const target = req.body.target;
    const property = req.body.property;
    const value = req.body.value;
    
    if (!target || !property) {
        res.status(400).send('缺少目标或属性参数');
        return;
    }
    
    try {
        // 危险：可能导致原型污染
        const obj = JSON.parse(target);
        
        // 设置属性可能导致原型污染
        if (property.includes('__proto__') || property.includes('constructor')) {
            // 故意允许原型污染
            obj[property] = value;
        } else {
            obj[property] = value;
        }
        
        res.json({
            success: true,
            modifiedObject: obj,
            property: property,
            value: value
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

// 10. 远程代码执行载荷
app.post('/rce-payload', (req, res) => {
    const payload = req.body.payload;
    const executionMethod = req.body.method || 'eval';
    
    if (!payload) {
        res.status(400).send('缺少载荷数据');
        return;
    }
    
    try {
        let result;
        
        switch (executionMethod) {
            case 'eval':
                result = eval(payload);
                break;
            case 'function':
                const func = new Function('return ' + payload);
                result = func();
                break;
            case 'exec':
                const { execSync } = require('child_process');
                result = execSync(payload, { encoding: 'utf8' });
                break;
            case 'vm':
                const vm = require('vm');
                const script = new vm.Script(payload);
                result = script.runInThisContext();
                break;
            default:
                throw new Error('未知的执行方法');
        }
        
        res.json({
            success: true,
            result: result,
            method: executionMethod
        });
    } catch (error) {
        res.status(500).json({
            error: error.message,
            method: executionMethod
        });
    }
});

// 11. 不安全的pickle反序列化（Python对象）
app.post('/pickle-deserialize', (req, res) => {
    const pickleData = req.body.pickle;
    const pythonScript = req.body.pythonScript;
    
    if (!pickleData) {
        res.status(400).send('缺少pickle数据');
        return;
    }
    
    try {
        // 危险：使用Python处理pickle数据
        const script = `
import pickle
import base64

data = base64.b64decode('${pickleData}')
obj = pickle.loads(data)
print(obj)
`;
        
        const { execSync } = require('child_process');
        const result = execSync(`python3 -c "${script.replace(/"/g, '\\"')}"`, { encoding: 'utf8' });
        
        res.json({
            success: true,
            result: result,
            pickleProcessed: true
        });
    } catch (error) {
        res.status(500).json({
            error: error.message,
            pickleData: pickleData
        });
    }
});

// 12. 使用模板引擎的反序列化
app.post('/template-deserialize', (req, res) => {
    const template = req.body.template;
    const context = req.body.context || {};
    
    if (!template) {
        res.status(400).send('缺少模板数据');
        return;
    }
    
    try {
        // 危险：使用用户提供的模板
        const templateFunction = new Function('context', `
            with(context) {
                return \`${template}\`;
            }
        `);
        
        const result = templateFunction(context);
        
        res.json({
            success: true,
            result: result,
            template: template
        });
    } catch (error) {
        res.status(500).json({
            error: error.message,
            template: template
        });
    }
});

app.listen(3000, () => {
    console.log('不安全反序列化漏洞演示服务器运行在端口3000');
});