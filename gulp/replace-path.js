var fs = require("fs");
var path = require("path");    

module.exports = function(code, filePath, rootPath, targetPaths, commonPath)
{
	var tscpaths = Object.keys(targetPaths);

	var lines = code.split("\n");

	return lines.map((line) => 
	{
		var matches = [];
		var require_matches = line.match(/require\(('|")(.*)('|")\)/g);
//	var import_matches = line.match(/import ('|")(.*)('|")/g);
		
		Array.prototype.push.apply(matches, require_matches);

		if(!matches)
		{
			return line;
		}		

		// Go through each require statement
		for(var match of matches)
		{
			// Find each paths
			for(var tscpath of tscpaths)
			{
				// Find required module & check if its path matching what is described in the paths config.
				var requiredModules = match.match(new RegExp(tscpath, "g"));

				if(requiredModules && requiredModules.length > 0)
				{
					for(var requiredModule of requiredModules)
					{
						// Skip if it resolves to the node_modules folder
						var modulePath = path.resolve('./node_modules/' + tscpath);
						if (fs.existsSync(modulePath))
						{
							continue;
						}

						// Get relative path and replace
            var sourcePath = path.dirname(filePath);
            var targetPath = targetPaths[tscpath].toString().replace("../","");
            targetPath = path.dirname(path.resolve(rootPath + "/" + targetPath));
            
            var relativePath = path.relative(sourcePath, targetPath)
            relativePath = relativePath.replace(/\\/g, '/');
            relativePath = relativePath.substr(3, relativePath.length - 3);
            relativePath = relativePath.replace("nfx-common", commonPath);

						line = line.replace(new RegExp(tscpath, "g"), relativePath + "/");						
					}
				}
			}			
		}		

		return line;
	}).join("\n");
};