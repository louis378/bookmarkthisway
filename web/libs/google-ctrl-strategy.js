const LINK_FILE_EXTENSION = "btw";
const BOUNDARY = "-------314159265358979323846";

/**
 * [createSuccessResult description]
 * @return {[type]} [description]
 */
function createResult(success) {
	return {isSuccess: success};
}

/**
 * Constructor.
 * @param {[type]} treeData TreeData instance. 
 */
function GoogleCtrlStrategy(treeData) {
	this.treeData = treeData;
	this.clientId = "";
	this.scopes = "";
}

/**
 * [auth description]
 * @param  {[type]}   clientId google API client ID.
 * @param  {[type]}   scopes   ex: "https://www.googleapis.com/auth/drive", see: https://developers.google.com/drive/web/scopes.
 * @param  {Function} callback {"onAuthSuccess": function, "onAuthFail": function, showPopup: true|false}
 * @return {void}
 */
GoogleCtrlStrategy.prototype.auth = function(clientId, scopes, callback) {
	this.clientId = clientId;
	this.scopes = scopes;

	var handleAuthResult = function(authResult) {
		if (authResult && !authResult.error) {
            gapi.client.load("drive", "v2", callback.onAuthSuccess);
        } else {
            callback.onAuthFail();
        }
	}

	gapi.auth.authorize({"client_id": this.clientId, "scope": this.scopes, "immediate": !callback.showPopup},
		handleAuthResult);
}

/**
 * [getRootSubfolders description]
 * @param  {Function} callback function(node)
 * @return {void}
 */
GoogleCtrlStrategy.prototype.getRootSubfolders = function(callback) {
	this.retrieveAllFiles(callback,
		"'root' in parents and trashed = false and mimeType = 'application/vnd.google-apps.folder'");
}

/**
 * [setRootFolder description]
 * @param {[type]}   rootId   [description]
 * @param {Function} callback [description]
 */
GoogleCtrlStrategy.prototype.setRootFolder = function(rootFolder, callback) {
	var _gCtrl = this;

	this.retrieveFile(rootFolder.id, function(resp) {
		if (resp.error) {
			callback(createResult(false));
		}

		_gCtrl.treeData.clearAll();
		_gCtrl.generateRootToken();

		_gCtrl.treeData.setRoot(rootFolder);
		_gCtrl.loadChildren(rootFolder.id, function() {});
		callback(createResult(true));
	});
}

/**
 * [generateToken description]
 * @return {[String]} new current tiken
 */
GoogleCtrlStrategy.prototype.generateRootToken = function() {
    rand = function() {
        return Math.random().toString(36).substr(2);
    }
    this.rootToken = rand() + rand();
    return this.rootToken;
}

/**
 * [loadChildren description]
 * @param  {[type]}   folderId [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
GoogleCtrlStrategy.prototype.loadChildren = function(folderId, callback) {
	var node = this.treeData.search(folderId);
	if (node.type != FOLDER_TYPE) {
		callback(createResult(false));
	}
	var _gCtrl = this;

	this.retrieveAllFiles(function(node) {
		if (node.type == FOLDER_TYPE) {
			var success = _gCtrl.treeData.addFolder(node);
		} else if (node.type == LINK_TYPE) {
			success = _gCtrl.treeData.addLink(node);
		}
	}, "'" + folderId + "'" + " in parents and trashed = false");


	// current may load finish
	callback(createResult(true));
}


/**
 * [addLink description]
 * @param {[type]}   link     [description]
 * @param {Function} callback [description]
 */
GoogleCtrlStrategy.prototype.addLink = function(link, callback) {
    var _gCtrl = this;

    this.insertFile(link, function(resp) {
        if (!resp.error) {
            link.id = resp.id;
            var added = _gCtrl.treeData.addLink(link);

            callback(createResult(added != false));
        } else {
            callback(createResult(false));
        }
    });
}

/** XXX
 * [insertFile description]
 * @param  {[type]}   title    [description]
 * @param  {[type]}   content  [description]
 * @param  {Function} callback function(resp)
 */
GoogleCtrlStrategy.prototype.insertFile = function(link, callback) {
	var multipartRequestBody = this.getLinkMultipartRequestBody(link);

    var request = gapi.client.request({
        "path": "/upload/drive/v2/files",
        "method": "POST",
        "params": {"uploadType": "multipart"},
        "headers": {
          "Content-Type": "multipart/mixed; boundary=\"" + BOUNDARY + "\""
        },
        "body": multipartRequestBody
    });

    request.execute(callback);
}

/**
 * [addFolder description]
 * @param {[type]}   folder   [description]
 * @param {Function} callback [description]
 */
GoogleCtrlStrategy.prototype.addFolder = function(folder, callback) {
	var data = {
        "title": folder.name,
        "parents": [{"id": folder.parentId}],
        "mimeType": "application/vnd.google-apps.folder"
    };

    var request = gapi.client.drive.files.insert({
        "resource": data
    });

    var _gCtrl = this;

    request.execute(function(resp) {
        if (!resp.error) {
            folder.id = resp.id;
            var added = _gCtrl.treeData.addFolder(folder);

            callback(createResult(added != false));
        } else {
            callback(createResult(false));
        }
    });
}

/**
 * [deleteNode description]
 * @param  {[type]}   id       [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
GoogleCtrlStrategy.prototype.deleteNode = function(node, callback) {
	var request = gapi.client.drive.files.trash({
		"fileId": node.id
	});
	var _gCtrl = this;

	request.execute(function(resp) {
		if (!resp.error) {
            deleted = _gCtrl.treeData.deleteNode(node);

            callback(createResult(deleted != false));
        } else {
            callback(createResult(false));
        }
	});
}

/**
 * [updateLink description]
 * @param  {[type]}   link     [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
GoogleCtrlStrategy.prototype.updateLink = function(link, callback) {
	var multipartRequestBody = this.getLinkMultipartRequestBody(link);
	var request = gapi.client.request({
        "path": "/upload/drive/v2/files/" + link.id,
        "method": "PUT",
        "params": {"uploadType": "multipart", "alt": "json"},
        "headers": {
          "Content-Type": "multipart/mixed; boundary=\"" + BOUNDARY + "\""
        },
        "body": multipartRequestBody
    });
    var _gCtrl = this;

    request.execute(function(resp) {
		if (!resp.error) {
			var updated = _gCtrl.treeData.updateLink(link);
			callback(updated != false);
		} else {
			callback(createResult(false));
		}
	});
}

/**
 * [getLinkMultipartRequestBody description]
 * @param  {[type]} link [description]
 * @return {[type]}      [description]
 */
GoogleCtrlStrategy.prototype.getLinkMultipartRequestBody = function(link) {
	var metadata = this.getLinkFileMetadata(link);
    const delimiter = "\r\n--" + BOUNDARY + "\r\n";
    const close_delim = "\r\n--" + BOUNDARY + "--";

    var multipartRequestBody =
        delimiter +
        "Content-Type: application/json\r\n\r\n" +
        JSON.stringify(metadata) +
        delimiter +
        "Content-Type: " + metadata.mimeType + "\r\n" +
        "\r\n" +
        JSON.stringify(link) +
        close_delim;
    return multipartRequestBody;
}

/**
 * [description]
 * @param  {[type]} link [description]
 * @return {[type]}      [description]
 */
GoogleCtrlStrategy.prototype.getLinkFileMetadata = function(link) {
	var metadata = {
        "title": link.name,
        "mimeType": "text/plain",
        "parents": [{"id": link.parentId}],
        "description": link.description,
        "fileExtension": LINK_FILE_EXTENSION,
    };
    // manipulate with BTW_EXTENSION
    metadata.title = metadata.title ? metadata.title + BTW_EXTENSION : BTW_EXTENSION;

    return metadata;
}

/**
 * [updateFolder description]
 * @param  {[type]}   folder   [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
GoogleCtrlStrategy.prototype.updateFolder = function(folder, callback) {
	var body = {"title": folder.name};
	var request = gapi.client.drive.files.patch({
		"fileId": folder.id,
		"resource": body
	});
	var _gCtrl = this;

	request.execute(function(resp) {
		if (!resp.error) {
			var updated = _gCtrl.treeData.updateFolder(folder);
			callback(updated != false);
		} else {
			callback(createResult(false));
		}
	});
}

/**
 * [retrieveFile description]
 * @param  {[type]}   id       [description]
 * @param  {Function} callback fonction(resp)
 * @return {[type]}            [description]
 */
GoogleCtrlStrategy.prototype.retrieveFile = function(id, callback) {
	var request = gapi.client.drive.files.get({
	    "fileId": id
	});
	request.execute(callback);
}

/**
 * Retrieve a list of File resources(AJAX).
 * Use retrieveAllFiles instead this function.
 * @param {Function} callback Function to call when the request is complete.
*/
GoogleCtrlStrategy.prototype.retrieveAllFiles = function(callback, params) {
    var initialRequest = gapi.client.drive.files.list({"q": params});  // request with filter('q')
    this.retrievePageOfFiles(initialRequest, [], callback);
}

/**
 * [retrievePageOfFiles description]
 * @param  {[type]} request [description]
 * @param  {[type]} result  [description]
 * @return {[type]}         [description]
 */
GoogleCtrlStrategy.prototype.retrievePageOfFiles = function(request, result, callback) {
	var _gCtrl = this;
	var beforeRootToken = this.rootToken;

 	request.execute(function(resp) {

	    result = result.concat(resp.items);
	    if (!result || !$.trim(result)) {  // jquery is initialize??
	        return;
	    }

	    // changed root
	    if (beforeRootToken != _gCtrl.rootToken) {
	    	return;
	    }

	    // page token?
	    var nextPageToken = resp.nextPageToken;
	    if (nextPageToken) {
	        request = gapi.client.drive.files.list({
	            "pageToken": nextPageToken,
	            "q": params
	        });
	        _gCtrl.retrievePageOfFiles(request, result, callback);  // page recursive

	    } else {  // (base case)
	        result.forEach(function(item) {
	        	_gCtrl.retrieveItem(item, beforeRootToken, callback);
	        });	
	    }
	});
}

/**
 * [retrieveItem description]
 * @param  {[type]}   item            [description]
 * @param  {[type]}   beforeRootToken [description]
 * @param  {Function} callback        [description]
 * @return {[type]}                   [description]
 */
GoogleCtrlStrategy.prototype.retrieveItem = function(item, beforeRootToken, callback) {
	var node = new Object();

    // attrs
    node.id = item.id;
    node.parentId = item.parents[0].id;  // parentId

    // name
    // manipulate with BTW_EXTENSION extension
    if (item.mimeType == "application/vnd.google-apps.folder") {
        node.name = item.title;
    } else {
    	var lastndex = item.title.lastIndexOf(BTW_EXTENSION);
        if (lastndex == -1) {
            return;
        }
        node.name = item.title.substring(0, lastndex);
    }

    // XXX escape html
    if (node.name) {
        node.name = $("<div/>").text(node.name).html();
    }

    // link
    if (item.mimeType == "application/vnd.google-apps.folder") {
    	node.type = FOLDER_TYPE;

    	// changed root
	    if (beforeRootToken != this.rootToken) {
	    	return;
	    }
    	callback(node);  // callback

    // folder
    } else {
    	var _gCtrl = this;

    	this.downloadFile(item, function(text) {
    		node.type = LINK_TYPE;
            var jsonObj = JSON.parse(text);
            if (jsonObj) {
            	node.url = jsonObj.url;  // url
		        node.description = jsonObj.description;  // description
		        node.iconUrl = jsonObj.iconUrl;  // iconUrl
	    	}

	    	// changed root
		    if (beforeRootToken != _gCtrl.rootToken) {
		    	return;
		    }
	    	callback(node);  // callback
    	});
    }
}

/**
 * Download a file's content.
 *
 * @param {File} file Drive File instance.
 * @param {Function} callback Function to call when the request is complete.
 *                            Format: callback(text); text is remote file content, if null means not  file or some error occur.
 */
GoogleCtrlStrategy.prototype.downloadFile = function(file, callback) {
    if (file.downloadUrl) {
        var accessToken = gapi.auth.getToken().access_token;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", file.downloadUrl);
        xhr.setRequestHeader("Authorization", "Bearer " + accessToken);
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