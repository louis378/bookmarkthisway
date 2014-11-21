
const CLEAR_ALL_EVENT = "clear_all";
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

	this.root = createFolder("#", "#", rootName);
	this.listeners = [];
}

/**
 * [addFolder description]
 * @param {[type]} folder
 * @return {Folder|false} [description]
 */
TreeData.prototype.addFolder = function(folder) {
	// create folder node
	var _folder = createFolder(folder);
	if (!_folder) {
		return false;
	}

	// add into parent
	return this.addNode(_folder);
}

/**
 * [addLink description]
 * @param {[type]} link
 * @return {Link|false} [description]
 */
TreeData.prototype.addLink = function(link) {
	// create link node
	var _link = createLink(link);
	if (!_link) {
		return false;
	}

	// add into parent
	return this.addNode(_link);
}

/**
 * [addNode description]
 * @param {[type]} node [description]
 * @return {Node|false} [description]
 */
TreeData.prototype.addNode = function(node) {
	// parent node
	var parentNode = this.search(node.parentId);
	if (!parentNode) {
		return false;
	}
	
	parentNode.nodes[parentNode.nodes.length] = node;  // add into parent
	this.fireEvent(CREATE_EVENT, node);

	return node;
}

/**
 * [removeNode description]
 * @param  {[type]} node [description]
 * @return {bool}      [description]
 */
TreeData.prototype.removeNode = function(node) {
	return this.searchChild(node.parentId, node.id, function(parentNode, node, nodeIndex) {
		parentNode.nodes.splice(nodeIndex, 1);  // remove node
		this.fireEvent(DELETE_EVENT, node);  // fire event
	});
}

/**
 * [updateNode description]
 * @param  {[type]} node [description]
 * @return {bool}      [description]
 */
TreeData.prototype.updateNode = function(node) {
	return this.searchChild(node.parentId, node.id, function(parentNode, node, nodeIndex) {
		parentNode.nodes[nodeIndex] = node;
		this.fireEvent(UPDATE_EVENT, node);  // fire event
	});
}

/**
 * [deleteAll description]
 * @return {[type]} [description]
 */
TreeData.prototype.deleteAll = function() {
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
	for (nodeIndex = 0; nodeIndex < parentNode.nodes.length; nodeIndex++) {
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
	function _search(folder) {
		for (i = 0; i < folder.nodes.length; i++) {
			var node = folder.nodes[i];

			// check id
			if (node.id == id) {
				return node;
			}

			// search subnode
			if (node.type == FOLDER_TYPE) {
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

/**
 * [createFolder description]
 * @param  {[type]} folder
 * @return {Object|false}        {id: "", parentId: "", name: "", nodes: []}.
 *                                return false means validate fail.
 */
function createFolder(folder) {
	var _folder = createNode(folder.id, folder.parentId, folder.name);
	if (!validFolder(_folder)) {
		return false;
	}

	_folder.nodes = [];
	_folder.type = FOLDER_TYPE;
	return _folder;
}

/**
 * [validFolder description]
 * @param  {[type]} folder [description]
 * @return {bool}        [description]
 */
function validFolder(folder) {
	return validNode(folder);
}

/**
 * [createLink description]
 * @param  {[type]} link
 * @return {Object|false}      {id: "", parentId: "", name: "", url: ""}.
 *                             return false means validate fail.
 */
function createLink(link) {
	var _link = createNode(link.id, link.parentId, link.name);
	_link.url = link.url;
	if (!validLink(_link)) {
		return false;
	}

	_link.type = LINK_TYPE;
	_link.iconUrl = link.iconUrl;
	_link.description = link.description;
	return _link;
}

/**
 * [validLink description]
 * @param  {[type]} link [description]
 * @return {bool}      [description]
 */
function validLink(link) {
	return validNode(link) &&
		   link.url;
}

/**
 * Will not validate parameters(id, parentId, name).
 * @param  {[type]} id       [description]
 * @param  {[type]} parentId [description]
 * @param  {[type]} name     [description]
 * @return {Object}          {id: "", parentId: "", name: ""}.
 */
function createNode(id, parentId, name) {
	return {"id": id, "parentId": parentId, "name": name};
}

/**
 * [validNode description]
 * @param  {[type]} node [description]
 * @return {bool}      [description]
 */
function validNode(node) {
	return node.id &&
		   node.parentId &&
		   node.name;
}