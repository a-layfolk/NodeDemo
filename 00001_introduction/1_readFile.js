var fs = require('fs');

/**
 * 成功:
 *     error: null
 *     data: 数据
 *     
 * 失败:
 *     error: 错误对象
 *     data: null
 */
fs.readFile('./text.txt', (err, data) => {
  if(err) {
    console.log('文件读取失败');
    console.log(err);
  }
  else {
    console.log(data.toString());   // 读出的 data 是二进制串, 用 toString() 转换为正常字符
  }
})