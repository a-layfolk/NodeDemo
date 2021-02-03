var fs = require('fs');

/**
 * 成功:
 *     err: null
 * 失败:
 *     err: 错误对象
 */
fs.writeFile('./text.txt', 'All is right', (err) => {
  if(err) {
    console.log('写文件失败');
    console.log(err);
  }
  else {
    console.log('写文件成功')
  }
})