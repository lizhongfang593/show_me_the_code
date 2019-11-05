export default class TreeModelService {
    /*@ngInject*/
    constructor ($q, $timeout) {
        this.$q = $q;
        this.$timeout = $timeout;
    }

    init (options = {}) {
        return this.$q.all([
            this.initData()
        ]).then(() => this.nestList())
        .then(() => this.initOption(options))
        .then(() => this.updateStatus());
    }

    // FOR OVERRITE
    initData () {

    }

    initOption (options = {}) {
        // THIS IS A DANGEROUS SETTING

        var { selectedId } = options;
        selectedId && this.dataMap[selectedId] && (this.dataMap[selectedId].selected = true);
    }

    updateStatus () {

    }

    getList () { return this.list; }
    getDataMap () { return this.dataMap; }
    getData (id) { return this.dataMap && this.dataMap[id]; }
    getRootLevelList () { return this.list.filter(node => !node.parentId); }


    nestList () {
        this.list = this.list || [ ];
        this.dataMap = this.dataMap || { };

        this.list.map((item, index) => (item.seq = item.seq || index));
        this.list = this.list.sort(function (l, r) { return l.seq - r.seq; });
        this.list.map(item => (item.children = []));
        this.list.map(item => (this.dataMap[item.id] = item));
        this.list.map(item => {
            this.dataMap[item.parentId] && this.dataMap[item.parentId].children.push(item);
        });

        this.list.map(item => this.formatNode(item));
    }


    formatNode (node) {
        Object.assign(node, {
            visible: true,
            selected: node.selected || false,
            checked: node.selected || false,
            children: node.children || [],
            level: this.getNodeDeepLevel(node),
            isFirst: this.getNodeIdx(node) == 0
        });
    }

    selectNode (node) {
        // node = typeof node == 'string' ? this.dataMap[node] : node;
        this.list.map(item => (item.selected = false));
        var id = typeof node != 'object' ? node : node.id;
        var targetNode = this.dataMap && this.dataMap[id];
        targetNode && (targetNode.selected = true);

        targetNode && this.triggerEvent('selectedChanged', targetNode);
    }

    updateVisible (predicate) {
        this.list.map(item => (item.visible = this.getNodeVisible(item, predicate)));
    }

    addNode (newNode) {
        if (!newNode) { return ; }

        this.list = this.list || [];

        this.list.push(Object.assign(newNode, { id: newNode.id || this.randomID() }));
        this.dataMap[newNode.id] = newNode;
        newNode.parentId && this.dataMap[newNode.parentId] && this.dataMap[newNode.parentId].children.push(newNode);
        this.formatNode(newNode);

        this.triggerEvent('nodeAdded', newNode);

        return newNode;
    }

    editNode (id, data) {
        var targetNode = this.dataMap[id];
        if (!targetNode) { return ; }

        Object.assign(targetNode, data);
        this.formatNode(targetNode);
        this.triggerEvent('nodeUpdated', targetNode);

        return targetNode;
    }

    deleteNode (id) {
        id = (id && typeof id == 'object') ? id.id : id;
        var targetNode = this.dataMap[id];
        if (!targetNode) { return ; }

        targetNode.parentId && this.dataMap[targetNode.parentId] && this.dataMap[targetNode.parentId].children.splice(this.dataMap[targetNode.parentId].children.indexOf(targetNode), 1);
        this.list.splice(this.list.indexOf(targetNode), 1);
        delete this.dataMap[id];

        this.triggerEvent('nodeDeleted', targetNode);

        return targetNode;
    }

    getNodeVisible (node, predicate) {
        let visible = node.name.indexOf(predicate) > -1;
        if (visible || !node.children || node.children.length < 1) { return visible; }
        node.children.map(child => visible = (visible || this.getNodeVisible(child, predicate)));
        return visible;
    }

    updateAroundNodeChecked (node) {
        // let checked = node;

        let updateChildrenNodeChecked = function (node) {
            for (var i = 0; i < node.children.length; i++) {
                node.children[i].checked = node.checked;
                updateChildrenNodeChecked(node.children[i]);
            }
        };

        updateChildrenNodeChecked(node);

        let updateParentsNodeChecked = function (node, nodeMap) {
            var parentId = node.parentId;
            var parent = parentId && nodeMap[parentId];
            if (parent) {
                var brothers = parent && parent.children;
                let parentChecked = true;
                brothers.map(bro => (parentChecked = parentChecked && bro.checked));
                parent.checked = parentChecked;

                updateParentsNodeChecked(parent, nodeMap);
            }
        };

        updateParentsNodeChecked(node);
    }

    bindEvent (event, callback) {
        this.eventsPool = this.eventsPool || {};
        this.eventsPool[event] = this.eventsPool[event] || [];
        this.eventsPool[event].push(callback);
    }

    // unbindEvent (event, callback) {
    unbindEvent () {

    }

    triggerEvent (event, body) {
        for (var i = 0; this.eventsPool[event] && i < this.eventsPool[event].length; i++) {
            typeof this.eventsPool[event][i] == 'function' && this.eventsPool[event][i](body);
        }
    }

    getNodeDeepLevel (item) { // id
        typeof item == 'string' && (item = this.list.find(gItem => gItem.id == item));
        var parentId = item && item.parentId;
        var count = 0;
        while(item && parentId) {
            count = count + 1;
            item = this.list.find(gItem => gItem.id == parentId);
            parentId = item.parentId;
        }
        return count;
    }

    getNodeIdx (node) {
        var parentId = node.parentId;
        if (parentId) {
            var parentChildren = this.dataMap[parentId].children || [];
            return parentChildren.indexOf(node);
        }
        return this.getRootLevelList().indexOf(node);
    }

    randomID () {
        return 'RANDOMID_' + Date.now();
    }
}
