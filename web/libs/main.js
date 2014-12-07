
/**
 * [MainApp description]
 * @param {[type]} treeController      [description]
 * @param {[type]} folderTreeDomId  [description]
 * @param {[type]} contentTreeDomId [description]
 */
function MainApp(treeController, folderTreeDomId, contentTreeDomId) {
	this.treeController = treeController;
    this.treeManipulation = new TreeManipulation(treeController);

    this.folderTreeDomId = folderTreeDomId;
    this.contentTreeDomId = contentTreeDomId;

    this.folderTree = this.createFolderTree();
    this.contentTree = this.createContentTree();
    this.initListeners();
}

/**
 * [initListener description]
 * @return {[type]} [description]
 */
MainApp.prototype.initListeners = function() {
	this.treeController.addTreeDataListener(this);

	var _mainApp = this;
	// select event in folder tree
    this.folderTree.tree.$tree.on("select_node.jstree", function (e, data) {
    	if (data.node.type == FOLDER_TYPE) {
    		// content tree
    		var rootNode = data.node.data;
    		_mainApp.reloadContentTree(rootNode);
    		
    		// load children of folder
            _mainApp.treeManipulation.loadChildren(rootNode.id);
    	}
    });

    // delete event in folder tree
    this.folderTree.tree.$tree.on("delete_node.jstree", function (e, data) {
        _mainApp.contentTree.clearAll();
    });

    // XXX trick-rename_node.jstree in content tree
    this.contentTree.tree.$tree.on("rename_node.jstree", function (e, data) {
        _mainApp.reloadContentTree(_mainApp.contentTree.tree.rootFolder);
    });
}

/**
 * [reloadContentTree description]
 * @param  {[type]} rootNode [description]
 * @return {[type]}          [description]
 */
MainApp.prototype.reloadContentTree = function(rootNode) {
    this.contentTree.tree.setRoot(rootNode);
    for (var childIndex = 0; childIndex < rootNode.nodes.length; childIndex++) {
        this.contentTree.tree.createNode(rootNode.nodes[childIndex]);
    }
}

/**
 * [createFolderTree description]
 * @param  {[type]} domId [description]
 * @return {[type]}       [description]
 */
MainApp.prototype.createFolderTree = function() {
	var result = new FolderTree(this.folderTreeDomId, this.treeManipulation);

	return result;
}

/**
 * [createContentTree description]
 * @param  {[type]} domId [description]
 * @return {[type]}       [description]
 */
MainApp.prototype.createContentTree = function(domId) {
	var result = new ContentTree(this.contentTreeDomId, this.treeManipulation);

	return result;
}

/**
 * [receiveEvent description]
 * @param  {[type]} event [description]
 * @return {[type]}       [description]
 */
MainApp.prototype.receiveEvent = function(event) {
	this.folderTree.receiveEvent(event);
	this.contentTree.receiveEvent(event);
}