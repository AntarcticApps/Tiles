var filesystem = null;

window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;

function onInitFileSystem(fs, callback) {
	filesystem = fs;

	console.log('Opened file system: ' + fs.name);

	return callback(fs);
}

function errorHandler(e) {
  var msg = '';

  switch (e.code) {
    case FileError.QUOTA_EXCEEDED_ERR:
      msg = 'QUOTA_EXCEEDED_ERR';
      break;
    case FileError.NOT_FOUND_ERR:
      msg = 'NOT_FOUND_ERR';
      break;
    case FileError.SECURITY_ERR:
      msg = 'SECURITY_ERR';
      break;
    case FileError.INVALID_MODIFICATION_ERR:
      msg = 'INVALID_MODIFICATION_ERR';
      break;
    case FileError.INVALID_STATE_ERR:
      msg = 'INVALID_STATE_ERR';
      break;
    default:
      msg = 'Unknown Error';
      break;
  };

  console.log('Error: ' + msg);
}

function initFileSystem(callback) {
	window.webkitStorageInfo.requestQuota(PERSISTENT, 1024*1024, function(grantedBytes) {
		window.requestFileSystem(PERSISTENT, grantedBytes, function(fs) {
			return onInitFileSystem(fs, callback);
		}, errorHandler);
	}, function(e) {
		console.log('Error', e);
	});
}

function getFileSystem(callback) {
	if (filesystem) {
		return callback(filesystem);
	} else {
		return initFileSystem(callback);
	}
}

function writeToFile(fs, file, text) {
	fs.root.getFile(file, { create: true }, function(fileEntry) {
		console.log("Writing to" + fileEntry.toURL());

		fileEntry.createWriter(function(fileWriter) {
			fileWriter.onwriteend = function(e) {
				console.log(e);
				console.log('Write completed');
			};

			fileWriter.onerror = function(e) {
				console.log('Write failed: ' + e.toString());
			};

			if (text == "") { text = " " };
			var blob = new Blob([text], { type: 'text/plain' });
			fileWriter.write(blob);
		}, errorHandler);
	}, errorHandler);
}