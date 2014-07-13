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
 */
GoogleDrive.prototype.auth = function() {
	var _onAuthFail = this.onAuthFail;
	var _onAuthSuccess = this.onAuthSuccess;
	var handleAuthResult = function(authResult) {
		if (authResult && !authResult.error) {
            gapi.client.load('drive', 'v2', _onAuthSuccess);
        } else {
            _onAuthFail();
        }
	}

	gapi.auth.authorize({'client_id': this.clientId, 'scope': this.scopes, 'immediate': true},
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
	var retrievePageOfFiles = function(request, result) {
        request.execute(function(resp) {
            result = result.concat(resp.items);
            if (!result || !$.trim(result)) {  // jquery is initialize??
                return;
            }

            var nextPageToken = resp.nextPageToken;
            if (nextPageToken) {
                request = gapi.client.drive.files.list({
                    'pageToken': nextPageToken,
                    'q': params
                });
                retrieveAllFilesByPage(request, result);  // page recursive
            } else {
                result.forEach(function(item) {
                	callback(item);
                });	
            }
        });
    }
    var initialRequest = gapi.client.drive.files.list({'q': params});  // request with filter('q')
    retrievePageOfFiles(initialRequest, []);
}