var fs = require('graceful-fs');

/**
 * pipe the source file to the destination
 * @param {String} source the location of the source file
 * @param {String} destination the location of the destination file
 * @param {Function} callback(err, destinations)
 * @returns {stream.WritableStream}
 */
module.exports = function writeFile( source, destination, callback ){
    var writeStream = fs.createWriteStream(destination);
    writeStream.on('error', callback);
    writeStream.on('finish', function(){
        callback(null, destination);
    });
    return fs.createReadStream(source).pipe(writeStream);
};
