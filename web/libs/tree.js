
function Tree(domId) {

	this.id = domId;

	// js tree
    $('#' + this.id).jstree({
         "plugins": ["themes", "json_data"], 
     
        'core': {
            "check_callback": true,  
        },
        'types' : {
            'default': {'icon': 'folder'},
            'file': {'valid_children': [], 'icon': 'file'}
        },

    }).on("changed.jstree", function (e, data) {
        // console.log(data.selected);
    });

    this.jstree = $('#' + this.id).jstree(true);
}

/**
 * [appendNode description]
 * @param  {[type]} parentId [description]
 * @param  {[type]} node     [description]
 * @return {[type]}          [description]
 */
Tree.prototype.appendNode = function(parentId, node) {
	var parent;
    if (parentId != null && parentId != '#') {
        parent = $('#' + parentId);
    } else {
        parent = parentId;
    }

    console.log($('#' + this.id).jstree(true));
    this.jstree.create_node(parent, node, "last");
}
