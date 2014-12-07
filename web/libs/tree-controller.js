
/**
 * Constructor.
 */
function TreeController() {
	this.treeData = new TreeData("");
	this.ctrlStrategy = {};
}

/**
 * [addTreeDataListener description]
 * @param {[type]} listener [description]
 */
TreeController.prototype.addTreeDataListener = function(listener) {
	this.treeData.addListener(listener);
}

/**
 * [removeTreeDataListener description]
 * @param  {[type]} listener [description]
 * @return {[type]}          [description]
 */
TreeController.prototype.removeTreeDataListener = function(listener) {
	this.treeData.removeListener(listener);
}

/**
 * [setCtrlStrategy description]
 * @param {[type]} ctrlStrategy [description]
 */
TreeController.prototype.setCtrlStrategy = function(ctrlStrategy) {
	this.ctrlStrategy = ctrlStrategy;
	this.ctrlStrategy.setTreeData(this.treeData);
}

/**
 * [getRootSubfolders description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
TreeController.prototype.getRootSubfolders = function(callback) {
	this.ctrlStrategy.getRootSubfolders(callback);
}

/**
 * [setRootFolder description]
 * @param {[type]}   rootFolder [description]
 * @param {Function} callback   [description]
 */
TreeController.prototype.setRootFolder = function(rootFolder, callback) {
	this.ctrlStrategy.setRootFolder(rootFolder, callback);
}

/**
 * [loadChildren description]
 * @param  {[type]}   folderId [description]
 * @return {[type]}            [description]
 */
TreeController.prototype.loadChildren = function(folderId) {
	this.ctrlStrategy.loadChildren(folderId);
}

/**
 * [addLink description]
 * @param {[type]}   link     [description]
 * @param {Function} callback [description]
 */
TreeController.prototype.addLink = function(link, callback) {
	this.ctrlStrategy.addLink(link, callback);
}

/**
 * [addFolder description]
 * @param {[type]}   folder   [description]
 * @param {Function} callback [description]
 */
TreeController.prototype.addFolder = function(folder, callback) {
	this.ctrlStrategy.addFolder(folder, callback);
}

/**
 * [deleteNode description]
 * @param  {[type]}   node     [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
TreeController.prototype.deleteNode = function(node, callback) {
	this.ctrlStrategy.deleteNode(node, callback);
}

/**
 * [updateLink description]
 * @param  {[type]}   link     [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
TreeController.prototype.updateLink = function(link, callback) {
	this.ctrlStrategy.updateLink(link, callback);
}

/**
 * [updateFolder description]
 * @param  {[type]}   folder   [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
TreeController.prototype.updateFolder = function(folder, callback) {
	this.ctrlStrategy.updateFolder(folder, callback);
}