export const defaultLoadingCp = () => (
  <div className="loading-dimmer">
    <div className="loading-icon"></div>
  </div>
)


// Acturally, this method should be called "AsyncLoadingWrapper"
function AsyncLoadingWrapper(fetchingType, Component, LoadingComponent = defaultLoadingCp) {
  LoadingComponent = LoadingComponent || defaultLoadingCp;
  return connect(
    ({ asyncTrackerState }) => ({
      isFetching: asyncTrackerState[fetchingType]
    })
  )(props => {
    return (
      <div className="loading-wrapper">
        { !props.isFetching && Component && <Component {...props} /> }
        { props.isFetching && <LoadingComponent /> }
      </div>
    );
  });
}

// export default AsyncComponentGeneratorForDevelop;
export default AsyncLoadingWrapper;

export function AsyncDimmerWrapper(fetchingType, Component, DimmerComponent = defaultLoadingCp) {
    DimmerComponent = DimmerComponent || defaultLoadingCp;

    return connect(
        ({ asyncTrackerState }) => ({
            isFetching: asyncTrackerState[fetchingType]
        })
    )(props => {
        return (
            <div className="loading-wrapper">
            { Component && <Component {...props} /> }
            { props.isFetching && <DimmerComponent /> }
            </div>
        );
    });
}

export function AsyncToggleWrapper(fetchingType, Component) {
    return connect(
        ({ asyncTrackerState }) => ({
          isFetching: asyncTrackerState[fetchingType]
        })
    )(props => {
        return (
            <div className="loading-wrapper">
            { (!props.isFetching) && Component && <Component {...props} /> }
            </div>
        );
    });
}
