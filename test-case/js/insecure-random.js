// 测试用例: 不安全的随机数生成
// 预期错误: security/detect-insecure-random, security/detect-pseudo-random

function insecureRandomIssues() {
  // 危险: 使用 Math.random() 进行安全相关的操作
  function generatePassword() {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    
    // 危险: Math.random() 不适合生成密码
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    
    return password;
  }
  
  // 危险: 使用 Math.random() 生成验证码
  function generateCaptcha() {
    // 危险: Math.random() 生成的验证码可以被预测
    return Math.floor(Math.random() * 1000000);
  }
  
  // 危险: 使用 Math.random() 生成会话 ID
  function generateSessionId() {
    const timestamp = Date.now();
    const random = Math.random(); // 危险: 可预测的随机数
    
    return `session_${timestamp}_${random}`;
  }
  
  // 危险: 使用 Math.random() 生成令牌
  function generateToken() {
    const token = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    
    // 危险: 不安全的令牌生成
    for (let i = 0; i < 32; i++) {
      token += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    
    return token;
  }
  
  // 危险: 使用 Math.random() 进行加密操作
  function generateEncryptionKey() {
    const key = [];
    
    // 危险: 不安全的密钥生成
    for (let i = 0; i < 16; i++) {
      key.push(Math.floor(Math.random() * 256));
    }
    
    return new Uint8Array(key);
  }
  
  // 危险: 在赌博/游戏逻辑中使用 Math.random()
  function gamble() {
    // 危险: 可预测的随机结果
    const result = Math.random();
    
    if (result > 0.5) {
      return '赢';
    } else {
      return '输';
    }
  }
  
  // 危险: 在抽奖算法中使用 Math.random()
  function lotteryDraw(participants) {
    // 危险: 可能被操纵的抽奖
    const winnerIndex = Math.floor(Math.random() * participants.length);
    return participants[winnerIndex];
  }
  
  // 危险: 在 CSRF 令牌生成中使用 Math.random()
  function generateCSRFToken() {
    // 危险: 不安全的 CSRF 令牌
    return Math.random().toString(36).substring(2, 15);
  }
  
  // 测试函数
  console.log('生成的密码:', generatePassword());
  console.log('生成的验证码:', generateCaptcha());
  console.log('生成的会话ID:', generateSessionId());
  console.log('生成的令牌:', generateToken());
  console.log('生成的加密密钥:', generateEncryptionKey());
  console.log('赌博结果:', gamble());
  console.log('抽奖结果:', lotteryDraw(['Alice', 'Bob', 'Charlie']));
  console.log('CSRF令牌:', generateCSRFToken());
  
  return '不安全的随机数测试完成';
}

// 更多的不安全随机数使用场景
function moreInsecureRandom() {
  // 危险: 在 UUID 生成中使用 Math.random()
  function generateUUID() {
    // 危险: 不安全的 UUID 生成
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  // 危险: 在盐值生成中使用 Math.random()
  function generateSalt() {
    const salt = '';
    
    // 危险: 不安全的盐值生成
    for (let i = 0; i < 16; i++) {
      salt += Math.floor(Math.random() * 16).toString(16);
    }
    
    return salt;
  }
  
  // 危险: 在 nonce 生成中使用 Math.random()
  function generateNonce() {
    const nonce = '';
    const chars = '0123456789abcdef';
    
    // 危险: 不安全的 nonce 生成
    for (let i = 0; i < 32; i++) {
      nonce += chars[Math.floor(Math.random() * chars.length)];
    }
    
    return nonce;
  }
  
  // 危险: 在洗牌算法中使用 Math.random()
  function shuffleArray(array) {
    const shuffled = array.slice();
    
    // 危险: 不安全的洗牌算法
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled;
  }
  
  // 测试
  console.log('生成的UUID:', generateUUID());
  console.log('生成的盐值:', generateSalt());
  console.log('生成的nonce:', generateNonce());
  console.log('洗牌结果:', shuffleArray([1, 2, 3, 4, 5]));
  
  return '更多不安全随机数测试';
}

insecureRandomIssues();
moreInsecureRandom();