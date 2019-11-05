// PromiseAll 并且 保持 Response Array 顺序
export const PromiseAllSortedResponse = function (promiseArr) {
    var result = [], resultPromiseArr = [];

    var responseInsertMaker = function (index) {
        return function (response) { result[index] = response; };
    }
    for (var i = 0; i < promiseArr.length; i++) {
        resultPromiseArr.push(promiseArr[i].then(responseInsertMaker(i)));
    }
    return Promise.all(resultPromiseArr).then(() => result);
}

// 重复Promise操作直到返回值满足某种条件
// promiseFetchMaker: promise生成方法
// checkRepeat: callback是否需要重复
// repeatCount: 重复次数上线
// repeatDelay: 每次操作间隔时间
export const PromiseRepetTill = function (promiseFetchMaker, checkRepeat, repeatCount, repeatDelay) {
    var promiseInstance = Promise.resolve(promiseFetchMaker());

    promiseInstance = promiseInstance.then(response => {
        var needRepeat = checkRepeat(response) && (repeatCount > 0);

        if (needRepeat) {
            console.log('Fail Repeat Rest Count:', repeatCount - 1);
            return new Promise(function (resolve, reject) {
                setTimeout(function () { resolve(); }, repeatDelay || 0)
            }).then(() => PromiseRepetTill(promiseFetchMaker, checkRepeat, repeatCount - 1));

            return PromiseRepetTill(promiseFetchMaker, checkRepeat, repeatCount - 1);
        } else {
            return response;
        }
    });

    return promiseInstance;
}
