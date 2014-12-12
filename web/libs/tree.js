

/**
 * [commonTreeDataReceiveHandle description]
 * @param  {[type]} tree  [description]
 * @param  {[type]} event [description]
 * @return {true}       consume event.
 */
Tree.commonTreeDataReceiveHandle = function(tree, event) {

    if (event.type == CREATE_ROOT_EVENT) {
        tree.setRoot(event.source);
        return true;

    } else if (event.type == CREATE_EVENT) {
        tree.createNode(event.source);
        return true;

    } else if (event.type == CLEAR_ALL_EVENT) {
		tree.clearAll();
		return true;

	} else if (event.type == DELETE_EVENT) {
		tree.deleteNode(event.source);
		return true;

	} else if (event.type == UPDATE_EVENT) {
		tree.updateNode(event.source);
		return true;

	} else {
		return false;
	}
}

/**
 * [wrapConfig description]
 * @param  {[type]} config [description]
 * @return {[type]}        [description]
 */
Tree.wrapConfig = function(config, treeManipulation) {
	config.contextmenu = {
		"items": function(jstreeNode) {
            var treeNode = jstreeNode.data;

            var items = {
                "editNode": {
                    "label": "Edit",
                    "icon": "glyphicon  glyphicon-pencil",
                    "action": function() {
                        if (treeNode.type == FOLDER_TYPE) {
                            treeManipulation.updateFolder(treeNode);

                        } else if (treeNode.type == LINK_TYPE) {
                            treeManipulation.updateLink(treeNode);

                        } else {
                            // XXX
                        }
                    } 
                },

                 "deleteNode": {
                    "label": "Delete",
                    "icon": "glyphicon  glyphicon-trash",
                    "action": function() {
                        treeManipulation.deleteNode(treeNode);
                    }    
                },

                "addLink": {
                    "separator_before": true,
                    "label": "Add Link in\"" + treeNode.name + "\"",
                    "icon": "glyphicon  glyphicon-link",
                    "action": function() {
                        treeManipulation.addLink(treeNode);
                    }
                },

                "addFolder": {
                    "label": "Add Folder in\"" + treeNode.name + "\"",
                    "icon": "glyphicon  glyphicon-folder-open",
                    "action": function() {
                        treeManipulation.addFolder(treeNode);
                    }
                },
            };

            return items;
        }
	};

    return config;
}

/**
 * [getCreateParentId description]
 * @param  {[type]} jstreeNode [description]
 * @return {[type]}            [description]
 */
Tree.getCreateParentId = function(jstreeNode) {
	if (jstreeNode.type == FOLDER_TYPE) {
		return jstreeNode.id;
	} else if (jstreeNode.type == LINK_TYPE) {
		return jstreeNode.parentId;
	}
}

/**
 * Manage the jstree instance.
 * @param {String} domId jstree dom ID.
 */
function Tree(domId, config, treeManipulation) {

	this.rootFolder = {};  // folder node
	this.domId = domId;
	this.treeManipulation = treeManipulation;

    this.$tree = $("#" + domId).jstree(Tree.wrapConfig(config, treeManipulation));  // jquery object
    this.jstree = this.$tree.jstree(true);  // jstree variable

    this.initKeyDownListener();
}

/**
 * [initKeyDownListener description]
 * @return {[type]} [description]
 */
Tree.prototype.initKeyDownListener = function() {
	var _tree = this;

	this.$tree.on("keydown.jstree", ".jstree-anchor", function(e) {

        var node = _tree.jstree.get_node(this);

        switch (e.which) {
            // F2
            case 113:
            	_tree.treeManipulation.updateNode(node.id);
                break;

            // ctrl + shift + 'F'
            case 70:
                if (e.ctrlKey && e.shiftKey) {
                	var parentId = Tree.getCreateParentId(node);
                	_tree.treeManipulation.addFolder(parentId);
                }
                break;

            // ctrl + shift + 'L'
            case 76:
            	if (e.ctrlKey && e.shiftKey) {
                	var parentId = Tree.getCreateParentId(node);
                	_tree.treeManipulation.addLink(parentId);
                }
                break;

            // Del
            case 46:
                _tree.treeManipulation.deleteNode(node.id);
                break;

            default:
                // do nothing
                break;    
        }
    });
}

/**
 * [setRoot description]
 * @param {[type]} rootFolder [description]
 */
Tree.prototype.setRoot = function(rootFolder) {
    this.clearAll();
    this.rootFolder = rootFolder;
}

/**
 * Clear all node.
 * @return {[type]} [description]
 */
Tree.prototype.clearAll = function() {
    this.jstree.refresh();
}

/**
 * [createNode description]
 * @param  {[type]} node [description]
 * @return {[type]}      [description]
 */
Tree.prototype.createNode = function(node) {
	var parent = this.getJstreeNode(node.parentId);
    var jstreeNode = this.toJstreeNode({}, node);
    this.jstree.create_node(parent, jstreeNode, "last");
}

/**
 * [deleteNode description]
 * @param  {[type]} node [description]
 * @return {[type]}      [description]
 */
Tree.prototype.deleteNode = function(node) {
	this.jstree.delete_node(this.getJstreeNode(node.id));
}

/**
 * [updateNode description]
 * @param  {[type]} node [description]
 * @return {[type]}      [description]
 */
Tree.prototype.updateNode = function(node) {
    var jstreeNode = this.getJstreeNode(node.id);
    jstreeNode = this.toJstreeNode(jstreeNode, node);
    
    this.jstree.rename_node(jstreeNode, node.name);

    var parentJstreeNode = this.getJstreeNode(node.parentId);
    // this.jstree.redraw(true);
    // XXX
    // if (parentJstreeNode != "#") {
    //     this.jstree.refresh_node(parentJstreeNode);
    // } else {
    //     this.jstree.refresh();
    // }
}

/**
 * [getJstreeNode description]
 * @param  {[type]} id [description]
 * @return {[type]}    [description]
 */
Tree.prototype.getJstreeNode = function(id) {
	var node;
	if (id == this.rootFolder.id) {
		node = "#";
	} else {
		node = $("#" + id);
	}
    return node;
}

/**
 * [toJstreeNode description]
 * @param  {[type]} node [description]
 * @return {[type]}      [description]
 */
Tree.prototype.toJstreeNode = function(jstreeNode, node) {

    var _tree = this;

    var wrapJstreeFolder = function(jstreeNode, node) {

    }

    var wrapJstreeLink = function(jstreeNode, node) {
        // icon
        _tree.setFavicon(node.id, node.url);

        // li
        jstreeNode.li_attr = {

        };

        // hyperlink
        jstreeNode.a_attr = {
            "href": node.url,
        };
    }

    jstreeNode = jstreeNode || {};
    jstreeNode.id = node.id;
    jstreeNode.parent = node.parentId;
    jstreeNode.text = node.name;
    jstreeNode.type = node.type;
    jstreeNode.data = node;

    if (node.type == FOLDER_TYPE) {
        wrapJstreeFolder(jstreeNode, node);
    } else if (node.type == LINK_TYPE) {
        wrapJstreeLink(jstreeNode, node);
    }

    return jstreeNode;
}

/**
 * Use ajax to set node icon by url(will auto to get favicon), if no favicon will do nothing.
 * @param {String} nodeId  [description]
 * @param {String} url web site url.
 */
Tree.prototype.setFavicon = function(nodeId, url) {
    var favicoUrl = "http://www.google.com/s2/favicons?domain=" + url;
    var curToken = this.token;

    var _tree = this;
    $('<img/>').attr("src", favicoUrl).load(function() {
        $(this).remove(); // prevent memory leaks as @benweet suggested

        // favicon exists
        _tree.jstree.set_icon(_tree.jstree.get_node(nodeId), favicoUrl);
    });

}

/**
 * [FolderTree description]
 * @param {[type]} domId               [description]
 * @param {[type]} treeManipulation [description]
 */
function FolderTree(domId, treeManipulation) {
	
    this.tree = this.initTree(domId, treeManipulation);

}

/**
 * [initTree description]
 * @param  {[type]} domId            [description]
 * @param  {[type]} treeManipulation [description]
 * @return {[type]}                  [description]
 */
FolderTree.prototype.initTree = function(domId, treeManipulation) {
	var config = {
        "core": {
            "check_callback": true,
            "multiple": false,
        },


        "types": {
            "valid_children": [FOLDER_TYPE],
        },

        "plugins": ["contextmenu", "themes", "json_data", "types"],
    };
    // types
    config.types[FOLDER_TYPE] = {"icon": "glyphicon glyphicon-book"};
    return new Tree(domId, config, treeManipulation);
}

/**
 * TreeData listener.
 * @param  {[type]} event [description]
 * @return {[type]}       [description]
 */
FolderTree.prototype.receiveEvent = function(event) {
    if (!this.tree.rootFolder) {
        return;
    }
    
    // filter
    if (event.type == CREATE_EVENT && event.source.type == LINK_TYPE) {
        return;
    }

    // common handle
	if (Tree.commonTreeDataReceiveHandle(this.tree, event)) {
		return;
	}
}

/**
 * [ContentTree description]
 * @param {[type]} domId               [description]
 * @param {[type]} contextmenuCallBack [description]
 * @param {[type]} treeManipulation    [description]
 */
function ContentTree(domId, treeManipulation) {
	
    this.tree = this.initTree(domId, treeManipulation);

}

/**
 * [initTree description]
 * @param  {[type]} domId            [description]
 * @param  {[type]} treeManipulation [description]
 * @return {[type]}                  [description]
 */
ContentTree.prototype.initTree = function(domId, treeManipulation) {
	var config = {
        "plugins": ["contextmenu", "themes", "json_data", "types"], 
     
        "core": {
            "check_callback": true,
            "multiple": false,
        },

        // types
        "types": {
            "valid_children": [FOLDER_TYPE, LINK_TYPE],
        },
    };
    // types
    config.types[FOLDER_TYPE] = {"icon": "glyphicon glyphicon-folder-open"};
    config.types[LINK_TYPE] = {"valid_children": [], "icon": "glyphicon glyphicon-link"};

    return new Tree(domId, config, treeManipulation);
}

/**
 * [receiveEvent description]
 * @param  {[type]} event [description]
 * @return {[type]}       [description]
 */
ContentTree.prototype.receiveEvent = function(event) {
    if (!this.tree.rootFolder) {
        return;
    }

    // filter
    if (event.type == CREATE_EVENT && event.source.parentId != this.tree.rootFolder.id) {
        return;
    }
    if (event.type == CREATE_ROOT_EVENT) {
        return;
    }

    // common handle
    if (Tree.commonTreeDataReceiveHandle(this.tree, event)) {
        return;
    }

}

/**
 * [clearAll description]
 */
ContentTree.prototype.clearAll = function() {
	this.tree.clearAll();
}

/**
 * [setFolder description]
 */
ContentTree.prototype.setFolder = function(folder) {
	this.tree.setRoot(folder);

	for (var i in folder.nodes) {
		this.tree.createNode(folder.nodes[i]);
	}
}