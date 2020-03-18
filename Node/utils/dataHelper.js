// 数组二维变一维
// MatrixToArr([ [1,2,3], [4,5,6], [7,8] ]) = [ 1,2,3,4,5,6,7,8 ]
export const MatrixToArr = function (matrix) {
    var result = []; 
    matrix.map(row => (result = result.concat(row))); 
    return result; 
}

// 数组一维变二维 
// ArrToMatrix([ 1,2,3,4,5,6,7,8 ], 3) = [ [1,2,3], [4,5,6], [7,8] ]
export const ArrToMatrix = function (arr, rowLength) {
    var matrix = [];
    while(arr.length) {
        matrix.push(arr.splice(0, rowLength));
    }
    return matrix;
}

// 数组去重
export const FilterForRemoveSame = function (arr) {
    var arrMap = {}, result = [];
    // arr.map(data => (arrMap[data] = true));
    for (var i = 0; i < arr.length; i++) {
        !arrMap[arr[i]] && result.push(arr[i]);
        arrMap[arr[i]] = true;
    }
    return result;
}

// 数组 转 Map :  
// ArrToMap([{id: 'I_1', name: 'nnnn'}, {id: 'I_2', name: 'nnnn2'}], 'id') = { 'I_1': {id: 'I_1', name: 'nnnn'}, 'I_2': {id: 'I_2', name: 'nnnn2'} }
export const ArrToMap = function (arr, objKey) {
    var mapData = {};
    arr && arr.map(data => ( mapData[ objKey ? data[objKey] : data ] = data ));
    return mapData;
}

// Map 转 数组
// MapToArr({ 'I_1': {id: 'I_1', name: 'nnnn'}, 'I_2': {id: 'I_2', name: 'nnnn2'} }) = [{id: 'I_1', name: 'nnnn'}, {id: 'I_2', name: 'nnnn2'}];
export const MapToArr = function (obj) {
    return obj && Object.keys(obj).map(key => obj[key]);
}

// 对象数组取交集
export const CrossJoinArr = function (leftArr, rightArr, objKey) {
    var leftMap = ArrToMap(leftArr, objKey), rightMap = ArrToMap(rightArr, objKey);

    var result = { left: [], cross: [], right: [] };
    result.left = leftArr.filter(item => !rightMap[objKey ? item[objKey] : item]);
    result.cross = leftArr.filter(item => rightMap[objKey ? item[objKey] : item]);
    result.right = rightArr.filter(item => !leftMap[objKey ? item[objKey] : item]);
    return result;
}

// 对象数组 Right Join
export const RightJoinArr = function (leftArr, rightArr, objKey) {
    var crossResult = CrossJoinArr(leftArr, rightArr, objKey);

    return { result: crossResult.cross.concat(crossResult.right), rest: crossResult.left };
}

export const Base64Encode = function (str) {
    return Buffer.from(str).toString('base64');
}

export const Base64Decode = function (str) {
    return Buffer.from(str, 'base64').toString('ascii');
}