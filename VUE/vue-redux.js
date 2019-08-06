import store from 'Model';

export function connect(mapState, mapDispatch) {
  return function(Component) {
    return Object.assign({}, Component, {
      created: function() {
        Component.created && Component.created.call(this, arguments);

        var vueInstance = this;
        store.subscribe(() => {
          var newState = mapState(store.getState(), this);

          if(typeof newState == "object") {
            for(var key in newState) {
              vueInstance[key] = newState[key];
            }
          }
        })
      },
      data: function() {
        return Object.assign({},
          mapState && mapState(store.getState(), this),
          mapDispatch && mapDispatch(store.dispatch),
          Component.data ? Component.data.call(this, arguments) : {});
      },
      beforeDestroy: function() {
        Component.beforeDestroy && Component.beforeDestroy();

      }
    });
  }
}
