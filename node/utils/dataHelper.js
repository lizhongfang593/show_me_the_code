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