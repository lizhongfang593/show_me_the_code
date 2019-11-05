export default function asyncActionStateTracker (asyncActionGenerator, FETCHING_KEY) {
    return function () {
        var args = arguments;
        return async (dispatch) => {
            console.log("FETCHING_START");
            dispatch({ type: 'FETCHING_START', "fetchingKey": FETCHING_KEY});
            // await asyncActionGenerator.apply(null, args)(dispatch);
            var fetchResult = await dispatch(asyncActionGenerator.apply(null, args));
            dispatch({ type: 'FETCHING_STOP', "fetchingKey": FETCHING_KEY});
            console.log("FETCHING_STOP");
            return fetchResult;
        };
    }
}
