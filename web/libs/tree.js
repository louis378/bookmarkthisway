const TREE_NODE_TYPE_ROOT_FOLDER = "rootFolder";
const TREE_NODE_TYPE_FOLDER = "folder";
const TREE_NODE_TYPE_LINK = "link";

/**
 * Manage the jstree instance.
 * @param {String} domId jstree dom ID.
 */
function Tree(domId, domJstree) {

	this.id = domId;

	// js tree
   

    // jquery object
    this.$tree = domJstree;

    // jstree variable
    this.jstree = this.$tree.jstree(true);

    // token
    this.token = "";
    this.generateToken();
}

/**
 * Append node to the tree.
 * @param  {String} parentId null or '#' means root.
 * @param  {Object} node jstree node.
 * @param  {String} tiken if not equals current token will do nothing.
 */
Tree.prototype.appendNode = function(parentId, node, token) {
    if (!this.valid(token)) {
        return;
    }

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
 * Use ajax to set node icon by url(will auto to get favicon), if no favicon will do nothing.
 * @param {String} nodeId  [description]
 * @param {String} url web site url.
 */
Tree.prototype.setFavicon = function(nodeId, url) {
    var protocol = $.url("protocol", url);
    var hostname = $.url("hostname", url);
    var port = $.url("port", url);
    var favicoUrl = protocol + "://" + hostname + ":" + port + "/favicon.ico";
    var curToken = this.token;

    var _tree = this;
    $('<img/>').attr("src", favicoUrl).load(function() {
        $(this).remove(); // prevent memory leaks as @benweet suggested
        
        // tree change root(not current token)
        if (!_tree.valid(curToken)) {
            return;
        }

        // favicon exists
        _tree.jstree.set_icon(_tree.jstree.get_node(nodeId), favicoUrl);
    });

}

/**
 * [generateToken description]
 * @return {[String]} new current tiken
 */
Tree.prototype.generateToken = function() {
    rand = function() {
        return Math.random().toString(36).substr(2);
    }
    this.token = rand() + rand();
    return this.token;
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

//  Folder Tree ---------------------------------------------------------------------------------------------
/**
 * [FolderTree description]
 * @param {[type]} domId [description]
 */
function FolderTree(domId, contextmenuCallBack) {
    var config = {
        "core": {
            "check_callback": true,
            "multiple": false,
        },

        "types": {
            "valid_children": [TREE_NODE_TYPE_FOLDER, TREE_NODE_TYPE_ROOT_FOLDER],
            "types": {
                    "valid_children": [TREE_NODE_TYPE_FOLDER, TREE_NODE_TYPE_ROOT_FOLDER],
            }
        },

        "plugins": ["contextmenu", "themes", "json_data", "types"],

        "contextmenu": {
            "items": function(node) {
                var items = {
                    "addLink": {
                        "label": "Add Link",
                        "icon": "glyphicon  glyphicon-link",
                        "action": function() {
                            contextmenuCallBack.addLink(node);
                        }
                    },
                    "addFolder": {
                        "label": "Add Folder",
                        "icon": "glyphicon  glyphicon-folder-open",
                        "action": function() {
                            contextmenuCallBack.addFolder(node);
                        }
                    },
                    "renameFolder": {
                        "label": "Rename",
                        "icon": "glyphicon  glyphicon-pencil",
                        "action": function() {
                            contextmenuCallBack.renameFolder(node);
                        } 
                    },
                     "deleteFolder": {
                        "label": "Delete",
                        "icon": "glyphicon  glyphicon-trash",
                        "action": function() {
                            contextmenuCallBack.deleteFolder(node);
                        }    
                    },
                };

                if(this.get_type(node) === TREE_NODE_TYPE_ROOT_FOLDER) {
                    delete items.renameFolder;
                    delete items.deleteFolder;
                }


                return items;
            }

        }
    };
    // types
    config.types[TREE_NODE_TYPE_ROOT_FOLDER] = {"icon": "glyphicon glyphicon-book"};
    config.types[TREE_NODE_TYPE_FOLDER] = {"icon": "glyphicon glyphicon-folder-open"};

    // instance
    jstree = $("#" + domId).jstree(config);
    var tree = new Tree(domId, jstree);

    // keydown
    tree.$tree.on('keydown.jstree', '.jstree-anchor', function(e) {
        console.log(e);

        var node = tree.jstree.get_node(this)
        switch (e.which) {
            // F2
            case 113:
                contextmenuCallBack.renameFolder(node);
                break;

            // ctrl + shift + 'F'
            case 70:
                if (e.ctrlKey && e.shiftKey) {
                    contextmenuCallBack.addFolder(node);
                }
                break;

            // Del
            case 46:
                contextmenuCallBack.deleteFolder(node);
                break;

            default:
                // do nothing
                break;    
        }
    });

    return tree;
}    

/**
 * [folderTreeCustomMenu description]
 * @param  {[type]} node [description]
 * @return {Object}      [description]
 */
function folderTreeCustomMenu(node) {
     // The default set of all items
    var items = {
        renameItem: { // The "rename" menu item
            label: "rename",
            action: function () {}
        },
        deleteItem: { // The "delete" menu item
            label: "delete",
            action: function () {}
        }
    };

    if ($(node).hasClass("folder")) {
        // Delete the "delete" menu item
        delete items.deleteItem;
    }

    return items;
}

//  Content Tree ---------------------------------------------------------------------------------------------
/**
 * [ContentTree description]
 * @param {[type]} domId [description]
 */
function ContentTree(domId) {
    var config = {
        "plugins": ["themes", "json_data", "types"], 
     
        "core": {
            "check_callback": true,
            "multiple": false,
        },
        "types": {
            "valid_children": [TREE_NODE_TYPE_FOLDER, TREE_NODE_TYPE_LINK],
        },
    };
    // types
    config.types[TREE_NODE_TYPE_FOLDER] = {"icon": "glyphicon glyphicon-folder-open"};
    config.types[TREE_NODE_TYPE_LINK] = {"valid_children": [], "icon": "glyphicon glyphicon-link"};

    // instance
    jstree = $("#" + domId).jstree(config);
    var result = new Tree(domId, jstree);

    return result;
}