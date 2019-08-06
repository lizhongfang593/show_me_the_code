var TreeNode = {
  template: `
    <div class="tree-node">
      <div class="tree-node-title">
        <span v-if="children && children.length" class="child" @click="_expand">
          <i v-if="!expanded" class="icon-angle-right"></i>
          <i v-if="expanded" class="icon-angle-down"></i>
        </span>
        <span v-if="!children || !children.length" class="no-child"><span class="no-child-icon"></span></span>
        <span :click="navToWiki">{{title}}</span>
      </div>
      <div class="tree-child-wrap" v-show="expanded">
        <div v-if="empty">Loading</div>
        <div v-if="!empty && fetchedChildren">
          <tree-node v-for='child in children' :nodeId="child" :key="child"></tree-node>
        </div>
      </div>
    </div>`,
  props: ["nodeId"],
  data() { return { expanded: false } },
  created: function() {
  },
  methods: {
    _expand: function() {
      !this.fetchedChildren && this.fetchChildren && this.fetchChildren(this.nodeId);
      this.expanded = !this.expanded;
    },
    navToWiki: function() {
      router.push({path: "/" + this.id})
    }
  },
}

import { FetchTargetChildren } from 'Model/actions/nodeMap';

function mapStateToProps(state, ownProps) {
  var target = state.nodeMap[ownProps.nodeId];
  return target ? Object.assign({}, target, {empty: false}) : {empty: true};
}

function mapDispatchToProps(dispatch) {
  return {
    fetchChildren: targetId => dispatch(FetchTargetChildren(targetId))
  }
}

import CpInjector from 'HighOrder/CpInjector';
import { connect } from 'HighOrder/vue-redux';

CpInjector("tree-node", connect(mapStateToProps, mapDispatchToProps)(TreeNode));
