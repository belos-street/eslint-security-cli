// 测试用例: XSS 跨站脚本攻击漏洞
// 预期错误: no-dangerous-html, security/detect-dangerous-html

function xssVulnerabilities() {
    const userInput = '<script>alert("XSS")</script>';
    const userData = window.location.search;

    // 危险: 直接操作 innerHTML
    document.getElementById('content').innerHTML = userInput;
    document.querySelector('.user-content').innerHTML = userData;

    // 危险: 使用 outerHTML
    document.getElementById('header').outerHTML = userInput;

    // 危险: document.write
    document.write(userInput);
    document.write('<div>' + userData + '</div>');

    // 危险: 动态创建脚本
    const script = document.createElement('script');
    script.innerHTML = 'alert("动态脚本")';
    document.body.appendChild(script);

    // 危险: 使用 insertAdjacentHTML
    document.body.insertAdjacentHTML('beforeend', userInput);

    // 危险: jQuery 的 html() 方法
    if (typeof $ !== 'undefined') {
        $('#content').html(userInput);
        $('.user-input').html(userData);
    }

    return 'XSS 测试完成';
}

// React 中的危险用法
function ReactXSS() {
    const userInput = props.userComment;

    // 危险: dangerouslySetInnerHTML
    return React.createElement('div', {
        dangerouslySetInnerHTML: { __html: userInput }
    });
}

// Vue 中的危险用法
function VueXSS() {
    return {
        template: '<div v-html="userInput"></div>',
        data() {
            return {
                userInput: '<script>alert("Vue XSS")</script>'
            };
        }
    };
}

xssVulnerabilities();
ReactXSS();
VueXSS();