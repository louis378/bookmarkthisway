
/**
 * Manage the jstree instance.
 * @param {String} domId jstree dom ID.
 */
function Tree(domId) {

	this.id = domId;

	// js tree
    $('#' + this.id).jstree({
        'plugins': ['themes', 'json_data', 'types'], 
     
        'core': {
            'check_callback': true,
            'multiple' : false,
        },
        'types' : {
            'valid_children': ['default', 'folder', 'file'],
            'default': {'icon': 'jstree-folder'},
            'folder': {'icon': 'jstree-folder'},
            'file': {'valid_children': [], 'icon': 'jstree-file'}
        },
    });

    // jquery object
    this.$tree = $('#' + this.id);

    // jstree variable
    this.jstree = this.$tree.jstree(true);
}

/**
 * Append node to the tree.
 * @param  {Object} parentId null or '#' means root.
 * @param  {Object} node jstree node.
 */
Tree.prototype.appendNode = function(parentId, node) {
	var parent;
    if (parentId != null && parentId != '#') {
        parent = $('#' + parentId);
    } else {
        parent = parentId;
    }
    this.jstree.create_node(parent, node, 'last');
}

/**
 * Clear all node.
 */
Tree.prototype.clear = function() {
    this.jstree.refresh();
}