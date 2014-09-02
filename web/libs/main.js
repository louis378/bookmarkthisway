
function MainApp(googleDrive, folderTreeDomId, contentTreeDomId) {
	this.googleDrive = googleDrive;
	this.folderTreeDomId = folderTreeDomId;
	this.contentTreeDomId = contentTreeDomId;

	this.rootFolderId = "";
	this.contentTreeFolderId = "";

	this.folderTree = this.createFolderTree(folderTreeDomId);
	this.contentTree = new ContentTree(contentTreeDomId);
}

 /**
 * [createFolderTree description]
 * @return {FolderTree} [description]
 */
MainApp.prototype.createFolderTree = function(domId) {
    result = new FolderTree(domId, this.createContextMenuCallback());
    var _mainApp = this;

    // rename event
    result.$tree.bind("rename_node.jstree", function(e, data) {
        _mainApp.googleDrive.rename(data.node.id, data.text, function(resp) {
            if (!resp.error) {

            } else {  // drive rename failed
                JqUi.popupMessage("error", "Rename failed!");
                _mainApp.setRootFolder(this.rootFolderId);
            }
        });
    });

    // select event
    result.$tree.on("select_node.jstree", function (e, data) {
    	if (_mainApp.contentTree) {
    		_mainApp.setContentTreeFolderId(data.node.id);
    	}
    });

    // deselect event
    result.$tree.on("deselect_all.jstree", function (e, data) {
        if (_mainApp.contentTree) {
            _mainApp.contentTree.clear();
        }
    });

    return result;
}

/**
 * [createContextMenuCallback description]
 * @return {Object} call back of context menu of tree.
 */
MainApp.prototype.createContextMenuCallback = function() {
	var _mainApp = this;

    return {
        // add link
        "addLink": function(node) {
           JqUi.popupBookmarkData(
            {
                "window": {"title": "Add Link", "commitBtnLabel": "Add", "cancelBtnLabel": "Cancel"}
            },
            function(bookmark) {
                var metadata = {
                    "title": bookmark.title,
                    "mimeType": "text/plain",
                    "parents": [{"id": node.id}],
                    "description": bookmark.description,
                    "fileExtension": "btw",
                };
                _mainApp.googleDrive.insertFile(metadata, JSON.stringify(bookmark), function(resp) {
                    if (!resp.error) {
                        _mainApp.folderTree.jstree.deselect_all();
                        _mainApp.folderTree.jstree.select_node(node);
                    } else {
                        JqUi.popupMessage("error", "Add link failed!");
                        _mainApp.setRootFolder(this.rootFolderId);
                    }
                });

                return true;
           });
        },

        // add folder
        "addFolder": function(node) {
            _mainApp.googleDrive.createFolder(node.id, "New Folder", function(resp) {
                if (!resp.error) {
                    var token = _mainApp.folderTree.token;
                    var newFolder = _mainApp.getTreeNode(node.id, TREE_NODE_TYPE_FOLDER, resp);
                    _mainApp.folderTree.appendNode(node.id, newFolder, token);  // append to folder tree

                    _mainApp.folderTree.jstree.deselect_all();
                    _mainApp.folderTree.jstree.select_node(newFolder);

                    _mainApp.folderTree.jstree.edit(newFolder.id);  // edit(rename)

                } else {  // drive rename failed
                    JqUi.popupMessage("error", "Add new folder failed!");
                    refreshRootFolder(_mainApp.rootFolderId);
                }
            });
        },

        // rename folder
        "renameFolder": function(node) {
            _mainApp.folderTree.jstree.edit(node.id);
        },

        // delete folder
        "deleteFolder": function(node) {
            var trashFile = function() {
                _mainApp.googleDrive.trashFile(node.id, function(resp) {
                    if (!resp.error) {
                        _mainApp.folderTree.jstree.delete_node(node);
                        _mainApp.folderTree.jstree.deselect_all();

                    } else {  // drive rename failed
                        JqUi.popupMessage("error", "Rename failed!");
                        _mainApp.setRootFolder($("#pageSelect").value);
                    }
                });
            }

            var buttons = {
                "Delete": function() {
                    trashFile();
                    return true;
                },
                "Cancel": function() {
                    return true;
                },
            };
            JqUi.popupWithButtons("Delete Folder", "Are you sure delete this folder: " + node.text, buttons);
        }
    };
}

/**
 * If rootId is null or empty will clear folderTree and contentTree and finish.
 * @param  {String} rootId root ID form google drive folder.
 */
MainApp.prototype.setRootFolder = function(rootId) {
	this.rootFolderId = rootId;
	this.folderTree.clear();
    this.contentTree.clear();

	if (!rootId) {
		return;
	} 

     // clear all node
    this.contentTree.generateToken();  // prevrnt old tree UI mainpulate
    var curToken = this.folderTree.generateToken();

    // append root node
    var rootText = $(this).find("option:selected").text();
    var rootNode = {"id": rootId, "parent": "#", "text": rootText, "type": TREE_NODE_TYPE_ROOT_FOLDER};
    this.folderTree.appendNode("#", rootNode, curToken);
    this.folderTree.jstree.select_node(rootNode);

    // append children node
    var _mainApp = this;
    this.googleDrive.getAllFoldersByRoot(rootId, function(item) {
        var parentId = item.parents[0].id;
        var node = _mainApp.getTreeNode(parentId, TREE_NODE_TYPE_FOLDER, item);
        node.li_attr = {"title": item.title};
        _mainApp.folderTree.appendNode(parentId, node, curToken);

        _mainApp.folderTree.jstree.open_all();
    });
}

/**
 * [refreshContentTree description]
 * @param  {[String]} folderId form google drive folder ID.
 */
MainApp.prototype.setContentTreeFolderId = function(folderId) {
	this.contentTreeFolderId = folderId;
    this.contentTree.clear();
    var curToken = this.contentTree.generateToken();

    var _mainApp = this;
    this.googleDrive.getFiles(folderId, function(item) {

        if (item.mimeType == "application/vnd.google-apps.folder") {
            var node = _mainApp.getTreeNode("#", TREE_NODE_TYPE_FOLDER, item);
            _mainApp.contentTree.appendNode("#", node, curToken);
        } else {
            // get file content
            _mainApp.googleDrive.downloadFile(item, function(text) {
                var jsonObj = JSON.parse(text);
                var node = _mainApp.getTreeNode("#", TREE_NODE_TYPE_LINK, item, jsonObj);
                node.text = "<a href='" + jsonObj.url + "' target='_blank'>" + item.title + "</a>";
                _mainApp.contentTree.appendNode("#", node, curToken);

                // set icon sync
                _mainApp.contentTree.setFavicon(node.id, jsonObj.url);
            });
        }
        
    });
}

/**
 * [getTreeNode description]
 * @param  {String} parentId  parent's ID
 * @param  {String} type      tree node type
 * @param  {Object} driveItem google drive item
 * @param  {Object} jsonObj   (optional)link json object.
 * @return {Object}           Tree node object.
 */
MainApp.prototype.getTreeNode = function(parentId, type, driveItem, jsonObj) {
    var nodeData = jsonObj ? jsonObj : {};
    nodeData.iconLink = driveItem.iconLink;

    return {
        "id": driveItem.id,
        "parent": parentId,
        "text": driveItem.title,
        "type": type,
        "data": nodeData
    };
}