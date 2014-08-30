// include jquery first then this library for escape html string

const BTW_EXTENSION = ".btw";

/**
 * Constructor.
 * google drive manager.
 * @param {String} clientId google API client ID.
 * @param {String} scope    ex: "https://www.googleapis.com/auth/drive";
 *                          see: https://developers.google.com/drive/web/scopes.
 */
function GoogleDrive(clientId, scopes) {
	this.clientId = clientId;
	this.scopes = scopes;

	// should to override
	this.onAuthFail = function() {};
	this.onAuthSuccess = function() {};
}


/**
 * [auth description]
 * @param  {[boolean]} showPopup show auth popup ui?
 * @return {[type]}           [description]
 */
GoogleDrive.prototype.auth = function(showPopup) {
	var _onAuthFail = this.onAuthFail;
	var _onAuthSuccess = this.onAuthSuccess;
	var handleAuthResult = function(authResult) {
		if (authResult && !authResult.error) {
            gapi.client.load("drive", "v2", _onAuthSuccess);
        } else {
            _onAuthFail();
        }
	}

	gapi.auth.authorize({"client_id": this.clientId, "scope": this.scopes, "immediate": !showPopup},
		handleAuthResult);
};

/**
 * [getRootFolders description]
 * @param  {Function} callback [description]
 */
GoogleDrive.prototype.getRootFolders = function(callback) {
	this.retrieveAllFiles(callback,
		"'root' in parents and trashed = false and mimeType = 'application/vnd.google-apps.folder'");
}

/**
 * [getFoldersByRoot description]
 * @param  {[type]}   id       [description]
 * @param  {Function} callback [description]
 */
GoogleDrive.prototype.getAllFoldersByRoot = function(id, callback) {
	var _retrieveAllFiles = this.retrieveAllFiles;

    var _retrieveChildren = function(_id) {
        _retrieveAllFiles(function(item) {
        	if (item.mimeType == "application/vnd.google-apps.folder") {
        		callback(item);
                _retrieveChildren(item.id)
            }
        }, "'" + _id + "' in parents and trashed = false and mimeType = 'application/vnd.google-apps.folder'");
    }

    _retrieveChildren(id);
}

/**
 * [getFiles description]
 * @param  {[type]}   id       [description]
 * @param  {Function} callback [description]
 */
GoogleDrive.prototype.getFiles = function(id, callback) {
    this.retrieveAllFiles(callback,
        "'" + id + "'" + " in parents and trashed = false"); // and mimeType = 'application/vnd.google-apps.folder'");
}

/**
 * Retrieve a list of File resources(AJAX).
 * Use retrieveAllFiles instead this function.
 * @param {Function} callback Function to call when the request is complete.
*/
GoogleDrive.prototype.retrieveAllFiles = function(callback, params) {

    // recursion
	var retrievePageOfFiles = function(request, result) {
        request.execute(function(resp) {
            result = result.concat(resp.items);
            if (!result || !$.trim(result)) {  // jquery is initialize??
                return;
            }

            var nextPageToken = resp.nextPageToken;
            if (nextPageToken) {
                request = gapi.client.drive.files.list({
                    "pageToken": nextPageToken,
                    "q": params
                });
                retrieveAllFilesByPage(request, result);  // page recursive

            } else {  // (base case)
                result.forEach(function(item) {
                    // manipulate with BTW_EXTENSION extension
                    if (item.mimeType != "application/vnd.google-apps.folder") {
                        var lastndex = item.title.lastIndexOf(BTW_EXTENSION);
                        if (lastndex == -1) {
                            return;
                        }
                        item.title = item.title.substring(0, lastndex);
                    }

                    // XXX escape html
                    if (item.title) {
                        item.title = $("<div/>").text(item.title).html();
                    }
                	callback(item);
                });	
            }
        });
    }
    var initialRequest = gapi.client.drive.files.list({"q": params});  // request with filter('q')
    retrievePageOfFiles(initialRequest, []);
}

/**
 * [renameFile description]
 * @param  {[type]}   fileId   [description]
 * @param  {String}   newTitle [description]
 * @param  {Function} callback callback(file)
 */
GoogleDrive.prototype.renameLink = function(fileId, newTitle, callback) {
    _newTitle = newTitle ? newTitle + BTW_EXTENSION : BTW_EXTENSION;  // append extension: ".btw"
    this.rename(fileId, _newTitle, callback);
}

/**
 * [renameFile description]
 * @param  {[type]}   fileId   [description]
 * @param  {String}   newTitle [description]
 * @param  {Function} callback callback(file)
 */
GoogleDrive.prototype.rename = function(fileId, newTitle, callback) {
    var data = {'title': newTitle};
    var request = gapi.client.drive.files.patch({
        'fileId': fileId,
        'resource': data
    });

    request.execute(function(resp) {
        callback(resp);
    });
}

/**
 * [createFolder description]
 * @param  {[type]}   parentId [description]
 * @param  {[type]}   title    [description]
 * @param  {Function} callback callback(file)
 */
GoogleDrive.prototype.createFolder = function(parentId, title, callback) {
    var data = {
        "title": title,
        "parents": [{"id": parentId}],
        "mimeType": "application/vnd.google-apps.folder"
    };

    var request = gapi.client.drive.files.insert({
        'resource': data
    });

    request.execute(function(resp) {
        callback(resp);
    });
}

/** XXX
 * [insertFile description]
 * @param  {[type]}   title    [description]
 * @param  {[type]}   content  [description]
 * @param  {Function} callback [description]
 */
GoogleDrive.prototype.insertFile = function(metadata, content, callback) {
    // manipulate with BTW_EXTENSION
    metadata.title = metadata.title ? metadata.title + BTW_EXTENSION : BTW_EXTENSION;

    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    var multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: ' + metadata.mimeType + '\r\n' +
        '\r\n' +
        content +
        close_delim;

    var request = gapi.client.request({
        'path': '/upload/drive/v2/files',
        'method': 'POST',
        'params': {'uploadType': 'multipart'},
        'headers': {
          'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
        },
        'body': multipartRequestBody});
    if (!callback) {
      callback = function(file) {
        console.log(file)
      };
    }
    request.execute(callback);
}

/**
 * Download a file's content.
 *
 * @param {File} file Drive File instance.
 * @param {Function} callback Function to call when the request is complete.
 *                            Format: callback(text); text is remote file content, if null means not  file or some error occur.
 */
GoogleDrive.prototype.downloadFile = function(file, callback) {
    if (file.downloadUrl) {
        var accessToken = gapi.auth.getToken().access_token;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', file.downloadUrl);
        xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
        xhr.onload = function() {
            callback(xhr.responseText);
        };
        xhr.onerror = function() {
            callback(null);
        };
        xhr.send();
    } else {
        callback(null);
    }
}

/**
 * [trashFile description]
 * @param  {[type]}   id       [description]
 * @param  {Function} callback callback(file)
 */
GoogleDrive.prototype.trashFile = function(fileId, callback) {
  var request = gapi.client.drive.files.trash({
    'fileId': fileId
  });

  request.execute(function(resp) {
    callback(resp);
  });
}