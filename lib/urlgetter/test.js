var Getter = require('./index.js');

var urls = ['http://google.com/', 'http://google.com/', 'http://google.com/', 'http://google.com/', 'http://google.com/']

var yo = new Getter(urls);

yo.get().then(console.dir, console.error, console.log);
