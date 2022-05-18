import Component from "./component";
import { REACT_FORWARD_REF_TYPE } from "./constants";
import { wrapToVDom } from "./utils";

const React = {
  createElement,
  Component,
  createRef,
  forwardRef,
  createContext,
};

function createContext() {
  let context = { Provider, Consumer };
  // 创建 2 个函数组件
  function Provider({ value, children }) {
    // 从 props 解构出 value、children

    // 1.将 value 赋值给 context._value 属性
    context._value = value;

    // 2.将子组件 children 返回，按原样渲染
    return children;
  }

  function Consumer(props) {}

  // 返回函数组件供外部使用
  return context;
}

// 实现1: 使用包装类
// function forwardRef(FunctionComponent) {
//   return class extends Component {
//     render() {
//       return FunctionComponent(this.props, this.props.ref);
//     }
//   };
// }

// 实现2: 返回特殊对象
// 此种方法的特点
// 1.和源码接近
// 2.ref 来自 vdom，不再来自 props，在 React.createElement() 方法中可以 `delete config.ref;` 删除 props 的 ref
function forwardRef(render) {
  return {
    $$typeof: REACT_FORWARD_REF_TYPE,
    render,
  };
}

function createRef() {
  return { current: null };
}

function createElement(type, config, children) {
  let key;
  let ref;
  if (config) {
    delete config.__source;
    delete config.__self;

    // key、ref 两个值非常特殊，不会写到 props 里
    key = config.key;
    ref = config.ref;
    delete config.key;
    delete config.ref;
  }

  let props = { ...config };
  if (arguments.length > 3) {
    // children 是一个数组
    props.children = Array.prototype.slice.call(arguments, 2).map(wrapToVDom);
  } else {
    // children 是一个对象
    props.children = wrapToVDom(children);
  }

  return {
    type,
    props,
    key,
    ref,
  };
}

export default React;
