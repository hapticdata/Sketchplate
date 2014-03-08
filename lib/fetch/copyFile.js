var fs = require('fs');

//pipe the source to the destination
module.exports = function writeFile( source, destination, callback ){
    var writeStream = fs.createWriteStream(destination);
    writeStream.on('error', callback);
    writeStream.on('finish', callback);
    return fs.createReadStream(source).pipe(writeStream);
};
