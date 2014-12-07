
const CLEAR_ALL_EVENT = "clear_all";
const CREATE_ROOT_EVENT = "create_root";
const CREATE_EVENT = "create";
const DELETE_EVENT = "delete";
const UPDATE_EVENT = "update";
const FOLDER_TYPE = "folder";
const LINK_TYPE = "link";

/**
 * Constructor.
 * [TreeData description]
 * @param {[type]} rootName [description]
 */
function TreeData(rootName) {
	this.root = {};
	this.listeners = [];
}

/**
 * 
 * @param  {[type]} folder [description]
 * @return {bool}        [description]
 */
TreeData.validFolder = function(folder) {
	return TreeData.validNode(folder);
}

/**
 * [initFolder description]
 * @param  {[type]} folder [description]
 * @return {[type]}        [description]
 */
TreeData.initFolder = function(folder) {
	folder.nodes = [];
	folder.type = FOLDER_TYPE;
	folder.childrenLoaded = false;
}

/**
 * [validLink description]
 * @param  {[type]} link [description]
 * @return {bool}      [description]
 */
TreeData.validLink = function(link) {
	return TreeData.validNode(link);
}

/**
 * [initLink description]
 * @param  {[type]} link [description]
 * @return {[type]}      [description]
 */
TreeData.initLink = function(link) {
	link.type = LINK_TYPE;
}

/**
 * [validNode description]
 * @param  {[type]} node [description]
 * @return {bool}      [description]
 */
TreeData.validNode = function(node) {
	return node.id &&
		   node.parentId &&
		   node.name;
}

/**
 * [setRoot description]
 * @param {[type]} rootFolder [description]
 */
TreeData.prototype.setRoot = function(rootFolder) {
	// valid folder node and append attributes
	if (!TreeData.validFolder(rootFolder)) {
		return false;
	}
	TreeData.initFolder(rootFolder);

	this.clearAll();

	this.root = rootFolder;
	this.fireEvent(CREATE_ROOT_EVENT, rootFolder);
}

/**
 * [addFolder description]
 * @param {[type]} folder
 * @return {Folder|false} [description]
 */
TreeData.prototype.addFolder = function(folder) {
	// valid folder node and append attributes
	if (!TreeData.validFolder(folder)) {
		return false;
	}
	TreeData.initFolder(folder);

	// add into parent
	return this.addNode(folder);
}

/**
 * [addLink description]
 * @param {[type]} link
 * @return {Link|false} [description]
 */
TreeData.prototype.addLink = function(link) {
	// create link node and append attributes
	if (!TreeData.validLink(link)) {
		return false;
	}
	TreeData.initLink(link);

	// add into parent
	return this.addNode(link);
}

/**
 * If the id has already exists, will not be added.(private)
 * @param {[type]} node [description]
 * @return {Node|false} [description]
 */
TreeData.prototype.addNode = function(node) {
	// parent node
	var parentNode = this.search(node.parentId);
	if (!parentNode) {
		return false;
	}
	if (!TreeData.validNode(node)) {
		return false;
	}

	// already exists
	if (this.search(node.id)) {
		return false;
	}
	
	parentNode.nodes[parentNode.nodes.length] = node;  // add into parent
	this.fireEvent(CREATE_EVENT, node);

	return node;
}

/**
 * [deleteNode description]
 * @param  {[type]} node [description]
 * @return {bool}      [description]
 */
TreeData.prototype.deleteNode = function(node) {
	var _treeData = this;

	return this.searchChild(node.parentId, node.id, function(parentNode, node, nodeIndex) {
		parentNode.nodes.splice(nodeIndex, 1);  // remove node
		_treeData.fireEvent(DELETE_EVENT, node);  // fire event
	});
}

/**
 * [updateLink description]
 * @param  {[type]} link [description]
 * @return {[type]}      [description]
 */
TreeData.prototype.updateLink = function(link) {
	return this.updateNode(link, function(searched) {
		if (!TreeData.validLink(link)) {
			return false;
		}

		searched.url = link.url;
		searched.description = link.description;
		searched.iconUrl = link.iconUrl;
		return true;
	});
}

/**
 * [updateFolder description]
 * @param  {[type]} folder [description]
 * @return {[type]}        [description]
 */
TreeData.prototype.updateFolder = function(folder) {
	return this.updateNode(folder, function(searched) {
		return TreeData.validFolder(folder);
	});
}

/**
 * [updateNode description]
 * @param  {[type]} node [description]
 * @param  {Function} hook return boolran
 * @return {searched Node|false}      [description]
 */
TreeData.prototype.updateNode = function(node, hook) {
	var searched = this.search(node.id);
	if (!searched ||
		(searched.type != node.type)) {
		return false;
	}

	// hook
	if (!hook(searched)) {
		return false;
	}

	// update
	searched.name = node.name;

	// fire event
	this.fireEvent(UPDATE_EVENT, searched);

	return searched;
}

/**
 * [clearAll description]
 * @return {[type]} [description]
 */
TreeData.prototype.clearAll = function() {
	this.root = {};
	this.root.nodes = [];
	this.fireEvent(CLEAR_ALL_EVENT, this.root);  // fire event
}	

/**
 * [fireEvent description]
 * @param  {[type]} event [description]
 * @return {[type]}       [description]
 */
TreeData.prototype.fireEvent = function(type, source) {
	var event = {"type": type, "source": source};

	for (i = 0; i < this.listeners.length; i++) {
		this.listeners[i].receiveEvent(event);
	}
}

/**
 * Don't add same listener instance once more.
 * @param {[type]} listener [description]
 */
TreeData.prototype.addListener = function(listener) {
	this.listeners[this.listeners.length] = listener;
}

/**
 * [removeListener description]
 * @param  {[type]} listener [description]
 * @return {[type]}          [description]
 */
TreeData.prototype.removeListener = function(listener) {
	for (i = 0; i < this.listeners.length; i++) {
		if (this.listeners[i] == listener) {
			this.listeners.splice(i, 1);  // remove item
			break;
		}
	}

}

/**
 * [searchChild description]
 * @param  {[type]}   parentId [description]
 * @param  {[type]}   nodeId   [description]
 * @param  {Function} callback callback(parentNode, node, nodeIndex)
 * @return {[type]}            [description]
 */
TreeData.prototype.searchChild = function(parentId, nodeId, callback) {
	// parent node
	var parentNode = this.search(parentId);
	if (!parentNode || !parentNode.nodes) {  // not found or not folder type
		return false;
	}

	//
	for (var nodeIndex = 0; nodeIndex < parentNode.nodes.length; nodeIndex++) {
		var node = parentNode.nodes[nodeIndex];

		// found
		if (node.id == nodeId) {
			callback(parentNode, node, nodeIndex);
			return true;
		}

	}
	return false;  // not fuund
}

/**
 * [search description] TODO-improve performance
 * @param  {[type]} id [description]
 * @return {Node|false}    [description]
 */
TreeData.prototype.search = function(id) {
	/**
	 * [_search description]
	 * @param  {[type]} folder [description]
	 * @return {Node|false}        [description]
	 */
	var _search = function(folder) {
		for (var index in folder.nodes) {
			var node = folder.nodes[index];

			// check id
			if (node.id == id) {
				return node;
			}

			if (node.type == FOLDER_TYPE) {  // search subnod
				var find = _search(node);
				if (find) {
					return find;
				}
			}
		}

		return false;
	}

	// search
	if (this.root.id == id) {
		return this.root;
	} else {  // do first recursive
		return _search(this.root);
	}
}