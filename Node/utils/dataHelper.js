export const MatrixToArr = function (matrix) {
    var result = []; 
    matrix.map(row => (result = result.concat(row))); 
    return result; 
}

export const ArrToMatrix = function (arr, rowLength) {
    var matrix = [];
    while(arr.length) {
        matrix.push(arr.splice(0, rowLength));
    }
    return matrix;
}

export const FilterForRemoveSame = function (arr) {
    var arrMap = {}, result = [];
    // arr.map(data => (arrMap[data] = true));
    for (var i = 0; i < arr.length; i++) {
        !arrMap[arr[i]] && result.push(arr[i]);
        arrMap[arr[i]] = true;
    }
    return result;
}

export const ArrToMap = function (arr, objKey) {
    var mapData = {};
    arr && arr.map(data => ( mapData[ objKey ? data[objKey] : data ] = data ));
    return mapData;
}

export const CrossJoinArr = function (leftArr, rightArr, objKey) {
    var leftMap = ArrToMap(leftArr, objKey), rightMap = ArrToMap(rightArr, objKey);

    var result = { left: [], cross: [], right: [] };
    result.left = leftArr.filter(item => !rightMap[objKey ? item[objKey] : item]);
    result.cross = leftArr.filter(item => rightMap[objKey ? item[objKey] : item]);
    result.right = rightArr.filter(item => !leftMap[objKey ? item[objKey] : item]);
    return result;
}

export const RightJoinArr = function (leftArr, rightArr, objKey) {
    var crossResult = CrossJoinArr(leftArr, rightArr, objKey);

    return { result: crossResult.cross.concat(crossResult.right), rest: crossResult.left };
}