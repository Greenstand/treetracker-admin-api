module.exports = function (Tree) {
    Tree.disableRemoteMethod('upsert', true);
    Tree.disableRemoteMethod('deleteById', true);
    Tree.disableRemoteMethod('updateAll', true);
    Tree.disableRemoteMethod('updateAttributes', true);
    Tree.disableRemoteMethod('patchAttributes', true);
    Tree.disableRemoteMethod('createChangeStream', true);
    Tree.disableRemoteMethod('findOne', true);
    Tree.disableRemoteMethod('replace', true);
    Tree.disableRemoteMethod('upsertWithWhere', true);
    Tree.disableRemoteMethod('replaceOrCreate', true);
};