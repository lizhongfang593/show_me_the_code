class DataListener {
    constructor () {
        this.dataStore = {};

        this.changeEventPool = {};
    }

    set (key, data) {
        if (this.dataStore[key] !== data) {
            this.triggerChange(key, data, this.dataStore[key]);
        }
        this.dataStore[key] = data;
    }

    get (key) {
        return this.dataStore[key];
    }

    listen (key, callback) {
        this.changeEventPool[key] = this.changeEventPool[key] || [];
        this.changeEventPool[key].push(callback);
    }

    triggerChange (key, newData, oldData) {
        for (var i = 0; i < (this.changeEventPool[key] && this.changeEventPool[key].length); i++) {
            var callback = this.changeEventPool[key][i];
            callback && typeof callback == 'function' && callback(newData, oldData);
        }
    }

    unListen (key, callback) {
        var targetIndex = (this.changeEventPool[key] || []).indexOf(callback);
        targetIndex > -1 && this.changeEventPool[key].splice(targetIndex, 1);
    }
}

var DL = new DataListener();

function AComponent () {
    this.a = 'aaaa';
    DL.set('a', this.a);

    this.changeAFunc = function () {
        this.a = 'bbbb';
        DL.set('a', this.a);
    }.bind(this);
    return this;
}

function BComponent () {
    this.wantGetA = DL.get('a');
    DL.listen('a', function (newValue) {
        this.wantGetA = newValue
    }.bind(this));

    return this;
}

var A = new AComponent();
var B = new BComponent();
A.changeAFunc()
console.log(B.wantGetA);