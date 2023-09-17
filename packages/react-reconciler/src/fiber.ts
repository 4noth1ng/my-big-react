import type { Key, Props, Ref } from 'shared/ReactTypes'
import type { WorkTag } from './workTags'
import type { Flags } from './fiberFlags'
import { NoFlags } from './fiberFlags'
import { Containter } from 'hostConfig';
import { UpdateQueue } from './updateQueue';

export class FiberNode {
  type: any
  tag: WorkTag
  pendingProps: Props
  key: Key
  stateNode: any
  ref: Ref

  return: FiberNode | null
  sibling: FiberNode | null
  child: FiberNode | null
  index: number

  memoizedProps: Props | null
  memoizedState: any;
  alternate: FiberNode | null
  flags: Flags
  updateQueue: UpdateQueue<any> | null
  constructor(tag: WorkTag, pendingProps: Props, key: Key) {
    // 实例属性
    this.tag = tag
    this.key = key
    this.ref = null
    // 对于HostComponent是一个<div>, 那么stateNode就保存了div这个dom
    this.stateNode = null
    // FunctionComponent () => {}
    this.type = null

    // 构成树状结构
    // 父节点，return 描述了工作顺序
    this.return = null
    this.sibling = null
    this.child = null
    // 同级 FiberNode 的索引
    this.index = 0

    // 作为工作单元
    // 工作开始前的 props
    this.pendingProps = pendingProps
    // 工作结束后确定下的 props
    this.memoizedProps = null
    // 工作结束后确定下的 state
    this.memoizedState = null
    // 用于在 wip 和 current 之间切换
    this.alternate = null
    // 副作用，更新标记
    this.flags = NoFlags
    this.updateQueue = null
  }
}

// 由于更新不一定从根组件开始，所以需要一个通用的根节点保存信息
export class FiberRootNode {
  container: Containter;
  current: FiberNode;
  // 完成整个递归更新后的hostRootFiber 保存在finishedWork
  finishedWork: FiberNode  | null;
  constructor(container: Containter, hostRootFiber: FiberNode) {
    this.container = container
    this.current =  hostRootFiber
    hostRootFiber.stateNode = this
    this.finishedWork = null
  }
}

export const createWorkInProgres = (current: FiberNode, pendingProps: Props):FiberNode => {
  let wip = current.alternate

  if(wip === null) {
    // mount
    wip = new FiberNode(current.tag, pendingProps, current.key)
    wip.type = current.type
    wip.stateNode = current.stateNode

    wip.alternate  = current
    current.alternate = wip
  } else {
    // update
    wip.pendingProps = pendingProps
    // 清除副作用
    wip.flags = NoFlags
  }
  wip.type = current.type
  wip.updateQueue = current.updateQueue
  wip.child = current.child
  wip.memoizedProps = current.memoizedProps
  wip.memoizedState = current.memoizedState
  return wip
}