var fs = require('fs');
var head = fs.readFileSync('src/pixiv_helper.head').toString();
var version = JSON.parse(fs.readFileSync('package.json')).version;
var body = fs.readFileSync('dist/pixiv_helper.js').toString();

//process.stdout.write(head + '\n' + body);

head = head.replace('{{version}}', version)
var file = head + '\n\n' + body;

fs.writeFileSync('dist/pixiv_helper.user.js', file);