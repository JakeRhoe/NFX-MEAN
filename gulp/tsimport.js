var through = require('through2');

var replacePath = require("./replace-path.js");

module.exports = function(importOptions, commonPath)
{
	return through.obj(function (file, enc, cb)
	{
		var code = file.contents.toString('utf8');		
		code = replacePath(code, file.history.toString(), importOptions.baseUrl, importOptions.paths, commonPath);		
		file.contents = new Buffer(code);
		this.push(file);
    cb();
	});
};