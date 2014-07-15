
/**
 * Manage the jstree instance.
 * @param {String} domId jstree dom ID.
 */
function Tree(domId, configure) {

	this.id = domId;

	// js tree
    $("#" + this.id).jstree(configure);

    // jquery object
    this.$tree = $("#" + this.id);

    // jstree variable
    this.jstree = this.$tree.jstree(true);

    // token
    this.token = "";
    this.generateToken();
}

/**
 * Append node to the tree.
 * @param  {Object} parentId null or '#' means root.
 * @param  {Object} node jstree node.
 */
Tree.prototype.appendNode = function(parentId, node) {
	var parent;
    if (parentId != null && parentId != "#") {
        parent = $("#" + parentId);
    } else {
        parent = parentId;
    }
    this.jstree.create_node(parent, node, "last");
}

/**
 * Clear all node.
 */
Tree.prototype.clear = function() {
    this.jstree.refresh();
}

/**
 * [generateToken description]
 * @return {[type]} [description]
 */
Tree.prototype.generateToken = function() {
    rand = function() {
        return Math.random().toString(36).substr(2);
    }
    this.token = rand() + rand();
}

/**
 * Validate current token.
 * @param  {String} token [description]
 * @return {Tree} null if not match current token.
 */
Tree.prototype.valid = function(token) {
    if (this.token == token) {
        return this;
    } else {
        return null;
    }
}

/**
 * [FolderTree description]
 * @param {[type]} domId [description]
 */
function FolderTree(domId) {
    return new Tree(domId,
    {
        "plugins": ["themes", "json_data", "types"], 
     
        "core": {
            "check_callback": true,
            "multiple": false,
        },
        "types" : {
            "valid_children": ["default", "folder", "file"],
            "default": {"icon": "jstree-folder"},
            "folder": {"icon": "jstree-folder"},
            "file": {"valid_children": [], "icon": "jstree-file"}
        },
    });
}

/**
 * [ContentTree description]
 * @param {[type]} domId [description]
 */
function ContentTree(domId) {
    return new Tree(domId,
    {
        "plugins": ["themes", "json_data", "types"], 
     
        "core": {
            "check_callback": true,
            "multiple": true,
        },
        "types" : {
            "valid_children": ["default", "folder", "file"],
            "default": {"icon": "jstree-folder"},
            "folder": {"icon": "jstree-folder"},
            "file": {"valid_children": [], "icon": "jstree-file"}
        },
    });
}