var DataHelper = require('./../utils/dataHelper');

// +----+----------------+----------------------+--------+
// | id | operator_id    | name                 | status |
// +----+----------------+----------------------+--------+
// |  1 | $include       | 包含                 |      1 |
// |  2 | $exclude       | 不包含               |      1 |
// |  3 | $ne            | 不等于               |      1 |
// |  4 | $skip          | 不限                 |      1 |
// |  5 | $gt            | 大于                 |      1 |
// |  6 | $gte           | 大于等于             |      1 |
// |  7 | $optionHasSkip | 单选(包含不限)       |      1 |
// |  8 | $optionNoSkip  | 单选(不含不限)       |      1 |
// |  9 | $eq            | 等于                 |      1 |
// | 10 | $offset        | 动态范围             |      1 |
// | 11 | $in            | 多选                 |      1 |
// | 12 | $range         | 范围                 |      1 |
// | 13 | $range         | 固定范围             |      1 |
// | 14 | $lte           | 结束于               |      1 |
// | 15 | $endWith       | 结尾为               |      1 |
// | 16 | $range         | 介于                 |      1 |
// | 17 | $startWith     | 开头为               |      1 |
// | 18 | $gte           | 起始于               |      1 |
// | 19 | $all           | 完全匹配             |      1 |
// | 20 | $lt            | 小于                 |      1 |
// | 21 | $lte           | 小于等于             |      1 |
// | 22 | $topDomain     | 一级域名为           |      1 |
// | 23 | $domain        | 域名为               |      1 |
// | 24 | $regexp        | 正则表达式           |      1 |
// +----+----------------+----------------------+--------+

var operatorFilterFuncMap = {
    '$include': function (itemField, filterValue) {
        return itemField.indexOf(filterValue) > -1;
    },
    '$exclude': function (itemField, filterValue) {
        return itemField.indexOf(filterValue) == -1;
    },
    '$ne': function (itemField, filterValue) {
        return itemField !== filterValue;
    },
    '$in': function (itemField, filterValues) {
        var result = (filterValues || []).indexOf(itemField) > -1;
        return result
    }
}


var operatorFilterCBMaker = function (operator, filterValue) {
    switch (operator) {
        case '$in':
            return function (item) { return operatorFilterFuncMap[operator](item.id, filterValue) }
        case '$include':
        case '$exclude':
        case '$ne':
            return function (item) { return operatorFilterFuncMap[operator](item.name, filterValue) }
    }

    return function (item) { return operatorFilterFuncMap[operator](item.name, filterValue) }
}

var generateRuleFilterResult = function (list, rule) {
    var filterCB = operatorFilterCBMaker(rule.operator, rule.value);
    var result = list.filter(item => filterCB(item));

    return result;
}

var joinAndResults = function (matrix) {
    var result = matrix[0];
    for (var i = 1; i < matrix.length; i++) {
        var crossResult = DataHelper.CrossJoinArr(result, matrix[i], 'id');
        result = crossResult.cross || [];

        if (result.length == 0) { break; }
    }
    return result;
}

var joinOrResults = function (matrix) {
    var result = [];
    for (var i = 0; i < matrix.length; i++) {
        var crossResult = DataHelper.CrossJoinArr(result, matrix[i], 'id');
        result = [].concat(crossResult.left).concat(crossResult.cross).concat(crossResult.right);
    }
    return result;
}

var joinExcludeResults = function (includeResults, excludeResults) {
    var crossResult = DataHelper.CrossJoinArr(includeResults, excludeResults, 'id');

    return crossResult.left || [];
}

var ruleCollectionGeneraction = function (rulesMMMatrix, dataSource) {
    var resultCollection = [];

    for (var i = 0; i < rulesMMMatrix.length; i++) {
        var andRules = rulesMMMatrix[i];

        var resultMatrix = [];
        for (var j = 0; j < andRules.length; j++) {
            var rule = andRules[j];
            resultMatrix.push(generateRuleFilterResult(dataSource, rule));
        }

        var andRuleResultCollection = joinAndResults(resultMatrix);

        resultCollection.push(andRuleResultCollection);
    }

    return joinOrResults(resultCollection);
}


// ---- RuleList Structure ----
// const rules = [{
//     ...ruleItem
// }, {
//     ...ruleItem2
// }];

// ---- RuleItem Structure ----
// const ruleItem = {
//     'parentId': 'DV_0001',
//     'includeRules': [
//         [
//             { operator: '$include', value: '视频' },
//             { operator: '$in', value: ['DV_0002', 'DV_0005', 'DV_0006'] },
//         ], //'or'
//         [
//             { operator: '$include', value: '视频' },
//             { operator: '$in', value: ['DV_0002', 'DV_0005', 'DV_0006'] },
//         ]
//     ],
//     'excludeRules': [
//         [
//             { operator: '$include', value: '视频' },
//             { operator: '$in', value: ['DV_0002', 'DV_0005', 'DV_0006'] },
//         ]
//     ]
// }

class DimensionValueRuleService {
    constructor(rules, dimensionValueList) {
        this.rules = rules || [];
        this.dimensionValueList = dimensionValueList || [];
    }

    updateDimensionValueList(newList) {
        this.dimensionValueList = newList;
    }

    generateRuleResult (rule) {
        var includeResults = ruleCollectionGeneraction(rule.includeRules, this.dimensionValueList);
        var excludeResults = ruleCollectionGeneraction(rule.excludeRules, this.dimensionValueList);

        var parentItem = this.dimensionValueList.find(item => item.id == rule.parentId);
        parentItem && excludeResults.push(parentItem); // 筛选结果中 把 父节点 删除

        return joinExcludeResults(includeResults, excludeResults);
    }

    checkStatus () {
        var generateResult = this.generate();

        return generateResult.available;
    }

    generate () {
        var chidrenMatrix = [], totalCount = 0;

        for (var i = 0; i < this.rules.length; i++) {
            var rule = this.rules[i];

            chidrenMatrix[i] = chidrenMatrix[i] || { parentId: rule.parentId, children: [] };

            chidrenMatrix[i].children = this.generateRuleResult(rule) || [];

            totalCount += chidrenMatrix[i].children.length;
        }

        var joinAllResults = joinOrResults(chidrenMatrix.map(item => item.children));

        var available = totalCount == joinAllResults.length; // 去重合并后的数量 如果 和合计数量不同， 说明有重复的子节点生成， 同一个子节点不可能属于多个 父节点

        // if (!available) { 
        //     return { available }; }

        var totalParentMap = { };
        for (var i = 0; i < chidrenMatrix.length; i++) {
            var parentId = chidrenMatrix[i].parentId;
            (chidrenMatrix[i].children || []).map(item => {
                totalParentMap[item.id] = totalParentMap[item.id] || [];
                totalParentMap[item.id].push(parentId);
            });
        }

        if (!available) {
            var conflictChildren = Object.keys(totalParentMap).filter(id => totalParentMap[id] && totalParentMap[id].length > 1).map(id => ({ id, parentIds: totalParentMap[id] }));
            
            return { available, conflictChildren, allChildren: joinAllResults }
        }

        var model = this.dimensionValueList.map(dV => ({
            id: dV.id, name: dV.name,
            parentId: totalParentMap[dV.id] !== null && totalParentMap[dV.id] !== undefined ? totalParentMap[dV.id] : null
        }));

        return { available, model, allChildren: joinAllResults };
    }

    getRules() {
        return this.rules;
    }

    addRule (rule) {
        var existRule = this.rules.find(r => r.parentId == rule.parentId);
        if (existRule) { return { error: 'Exist Parent Id Rule' }; }

        var checkResult = this.checkRule(rule);

        if (checkResult.error) { return checkResult; }

        this.rules.push(rule);

        return this.generate();
    }

    removeRule(rule) {
        var parentId = rule.parentId;

        this.rules = this.rules.filter(rule => rule.parentId != parentId);
    }

    updateRule(newRule) {
        var parentId = newRule.parentId;

        var oldRule = this.rules.find(rule => rule.parentId == parentId);
        var oldRuleIndex = this.rules.indexOf(oldRule);
        this.rules = this.rules.filter(rule => rule.parentId != parentId); // 暂时删除这条规则，用于测试新规则可用性

        this.rules.splice(oldRuleIndex, 0, newRule);

        var generateResult = this.generate();
        if (!generateResult.available) {
            this.rules.splice(oldRuleIndex, 1, oldRule); // 恢复原来位置的规则
        }

        return generateResult;

        // var checkResult = this.checkRule(newRule);

        // console.log('Update Check Result : ')
        // console.log(checkResult)
        // if (checkResult.error) {
        //     this.rules.splice(oldRuleIndex, 0, oldRule); // 恢复原来位置的规则
        //     return checkResult;
        // }

        // this.rules.splice(oldRuleIndex, 0, newRule);

        // return this.generate();
    }

    checkRule(rule) {
        var parentItem = this.dimensionValueList.find(item => item.id == rule.parentId);
        if (!parentItem) { return { error: 'Parent Id Not Exist' } }

        var generateResult = this.generate();
        if (!generateResult.available) { return { error: 'Exist Error' }; }

        var allChildren = generateResult.allChildren || [];

        var newRuleChildren = this.generateRuleResult(rule);

        var crossChildren = DataHelper.CrossJoinArr(allChildren, newRuleChildren, 'id');

        if (crossChildren && (crossChildren.length > 0)) return { error: 'Cross Error', cross: crossChildren, children: newRuleChildren };

        return { error: null, children: newRuleChildren };
    }


}






const dataSourceExampleList = [
    { "value": "地图", "key": "3" }, 
    { "value": "高德DSP", "key": "1" }, 
    { "value": "视频站点", "key": "0" }, 
    { "value": "优酷视频Youtu", "key": "10" }, 
    { "value": "乐视视频Letv", "key": "8" }, 
    { "value": "今日头条Toutiao", "key": "5" }, 
    { "value": "PPTV视频", "key": "7" }, 
    { "value": "爱奇艺视频iQIYI", "key": "9" }, 
    { "value": "腾讯视频Tencent", "key": "tencent" }, 
    { "value": "搜狐视频Sohu", "key": "soho" },
    { "value": "暴风影音", "key": "bf" },
    { "value": "KMVideo", "key": "km" },
    { "value": "百度地图", "key": "bdMap" },
    { "value": "Apple_Map", "key": "appleMap" },
    { "value": "NNN_Map", "key": "nnn" },
].map(item => ({
    id: item.key, name: item.value
}));

var rulesObjectExample = [{
    parentId: 0,
    includeRules: [
        [
            { operator: '$include', value: '视频' },
            // { operator: '$in', value: ['10', '8', '0'] },
        ],
        [
            { operator: '$in', value: [ 'bf', 'km' ] },
        ]
    ],
    excludeRules: [
        [ 
            { operator: '$in', value: ['8'] }
        ]
    ]
}];

var dVRService = new DimensionValueRuleService(rulesObjectExample, dataSourceExampleList);


/**  生成 维度值 关系序列  */
var generateResult = dVRService.generate();
console.log(generateResult);

/**  添加维度值规则 - 成功  */
var generateResult = dVRService.addRule({
    parentId: 3,
    includeRules: [
        [{ operator: '$include', value: '地图' }],
        [{ operator: '$in', value: [ '1', 'appleMap' ] }],
    ],
    excludeRules: []
});
console.log('Add Result - Success: ');
console.log(generateResult);

/**  添加维度值规则 - 失败  */
var generateResult = dVRService.addRule({
    parentId: 4,
    includeRules: [
        [{ operator: '$include', value: '地图' }],
        [{ operator: '$in', value: [ '1', 'appleMap' ] }],
    ],
    excludeRules: []
});
console.log('Add Result - Error: ');
console.log(generateResult);

/**  编辑维度值规则 - 成功  */
var generateResult = dVRService.updateRule({
    parentId: 3,
    includeRules: [
        [{ operator: '$include', value: '地图' }],
        [{ operator: '$in', value: [ '1', 'appleMap', 'nnn', '8' ] }],
    ],
    excludeRules: []
});
console.log('Update Result - Success: ');
console.log(generateResult);

/**  编辑维度值规则 - 失败  */
var generateResult = dVRService.updateRule({
    parentId: 3,
    includeRules: [
        [{ operator: '$include', value: '地图' }],
        [{ operator: '$in', value: [ '1', 'appleMap', 'nnn', '8', 'bf' ] }],
    ],
    excludeRules: []
});
console.log('Update Result - Error: ');
console.log(generateResult);

/**  编辑维度值规则 - 失败 - 修复  */
var generateResult = dVRService.updateRule({
    parentId: 3,
    includeRules: [
        [{ operator: '$include', value: '地图' }],
        [{ operator: '$in', value: [ '1', 'appleMap', 'nnn', '8', 'bf' ] }],
    ],
    excludeRules: [
        [{ operator: '$in', value: [ 'bf' ] }]
    ]
});
console.log('Update Result - Error - Fix: ');
console.log(generateResult);

// TODO: Export Error Relations




var generateResult = dVRService.generate();
console.log(generateResult);

