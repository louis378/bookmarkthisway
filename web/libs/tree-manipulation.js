

/**
 * Constructor.
 * @param {[type]} treeController [description]
 */
function TreeManipulation(treeController) {
	this.treeController = treeController;
}

/**
 * [getRootSubfolders description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
TreeManipulation.prototype.getRootSubfolders = function(callback) {
	this.treeController.getRootSubfolders(callback);
}

/**
 * [setRootFolder description]
 * @param {[type]}   rootFolder [description]
 */
TreeManipulation.prototype.setRootFolder = function(rootFolder) {
	this.treeController.setRootFolder(rootFolder, function(result) {
		// result.isSuccess
	});
}

/**
 * [loadChildren description]
 * @param  {[type]}   folderId [description]
 * @return {[type]}            [description]
 */
TreeManipulation.prototype.loadChildren = function(folderId) {
	this.treeController.loadChildren(folderId);
}

/**
 * [addFolder description]
 * @param {[type]}   parentNode   [description]
 */
TreeManipulation.prototype.addFolder = function(parentNode) {
	var _treeMani = this;

	JqUi.popupFolderData(
        {
            "window": {"title": "Add Folder in &#34;" + parentNode.name + "&#34;", "commitBtnLabel": "Add", "cancelBtnLabel": "Cancel"}
        },
        function(input) {
        	var folder = {
        		"parentId": parentNode.id,
        		"name": input.name,
        	};
            
        	_treeMani.treeController.addFolder(folder, function(result) {
        		if (!result.isSuccess) {
					JqUi.popupMessage("error", "Add folder: '" + input.name + "' failed!");
				}
        	});
            return true;
    });

}

/**
 * [addLink description]
 * @param {[type]}   parentNode     [description]
 */
TreeManipulation.prototype.addLink = function(parentNode) {
	var _treeMani = this;

	JqUi.popupBookmarkData(
        {
            "window": {"title": "Add Link in &#34;" + parentNode.name + "&#34;", "commitBtnLabel": "Add", "cancelBtnLabel": "Cancel"}
        },
        function(input) {
        	var link = {
        		"parentId": parentNode.id,
        		"name": input.name,
        		"url": input.url,
        		"description": input.description
        	};
            
        	_treeMani.treeController.addLink(link, function(result) {
        		if (!result.isSuccess) {
					JqUi.popupMessage("error", "Add link: '" + input.name + "' failed!");
				}
        	});
            return true;
    });
}

/**
 * [deleteNode description]
 * @param  {[type]}   node     [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
TreeManipulation.prototype.deleteNode = function(node) {
	var _treeMani = this;

    var buttons = {
        "Delete": function() {
            _treeMani.treeController.deleteNode(node, function(result) {
				if (!result.isSuccess) {
					JqUi.popupMessage("error", "'" + node.name + "'delete failed!");
				}
			});
            return true;
        },
        "Cancel": function() {
            return true;
        },
    };
    JqUi.popupWithButtons("Delete", "Are you sure delete: " + node.name, buttons);
}

/**
 * [updateFolder description]
 * @param  {[type]}   folder   [description]
 */
TreeManipulation.prototype.updateFolder = function(folder) {
	var _treeMani = this;

	JqUi.popupFolderData(
        {
            "window": {"title": "Update Folder", "commitBtnLabel": "Update", "cancelBtnLabel": "Cancel"},
            "folder": {"name": folder.name}
        },
        function(input) {
        	var updatedFolder = folder;
        	updatedFolder.name = input.name;
            
        	_treeMani.treeController.updateFolder(updatedFolder, function(result) {
        		if (!result.isSuccess) {
					JqUi.popupMessage("error", "Update folder: '" + input.name + "' failed!");
				}
        	});
            return true;
    });

}

/**
 * [updateLink description]
 * @param  {[type]}   link     [description]
 */
TreeManipulation.prototype.updateLink = function(link) {
	var _treeMani = this;

	JqUi.popupBookmarkData(
        {
            "window": {"title": "Update Link", "commitBtnLabel": "Update", "cancelBtnLabel": "Cancel"},
            "link": {"name": link.name, "url": link.url, "description": link.description}
        },
        function(input) {
        	var updatedLink = link;
        	updatedLink.name = input.name;
        	updatedLink.url = input.url;
        	updatedLink.description = input.description;
            
        	_treeMani.treeController.updateLink(updatedLink, function(result) {
        		if (!result.isSuccess) {
					JqUi.popupMessage("error", "Update link: '" + input.name + "' failed!");
				}
        	});
            return true;
    });

}