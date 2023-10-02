import { beginWork } from './beginWork'
import { commitMutationEffects } from './commitWork';
import { completeWork } from './completeWork'
import type { FiberNode } from './fiber'
import { FiberRootNode, createWorkInProgres } from './fiber';
import { MutationMask, NoFlags } from './fiberFlags';
import { HostRoot } from './workTags';

// 正在工作的 fiberNode
let workInProgress: FiberNode | null = null

function prepareFreshStack(root: FiberRootNode) {
  workInProgress = createWorkInProgres(root.current, {})
}

// 将renderRoot和update更新关联起来
export function scheduleUpdateOnFiber(fiber: FiberNode) {
  // 调度功能
  // fiberRootNode 
  // 因为调用this.setState等方法时，fiber不是根节点fiber, 所以需要向上遍历获取真实根fiber, 从而得到fiberRootNode
  const root = markUpdateFromFiberToRoot(fiber)
  renderRoot(root)
}
// 从当前节点向上遍历获取根节点
function markUpdateFromFiberToRoot(fiber: FiberNode) {
  // 除了hostRootFiber上只有stateNode指针指向fiberRootNode, 其他fiber都是return指针指向上一级
  let node = fiber
  let parent = node.return

  while(parent !== null) {
    node = parent
    parent = node.return
  }
  if(node.tag === HostRoot) {
    return node.stateNode
  }
  return null
}

function renderRoot(root: FiberRootNode) {
  // 初始化开始工作的 fiberNode
  prepareFreshStack(root)

  do {
    try {
      workLoop()
      break
    } catch (e) {
      if (__DEV__) {
				console.warn('workLoop发生错误', e);
			}
      workInProgress = null
    }
  } while (true)
  const finishedWork = root.current.alternate;
	root.finishedWork = finishedWork;

	// wip fiberNode树 树中的flags
	commitRoot(root);
}
function commitRoot(root: FiberRootNode) {
	const finishedWork = root.finishedWork;

	if (finishedWork === null) {
		return;
	}

	if (__DEV__) {
		console.warn('commit阶段开始', finishedWork);
	}

	// 重置
	root.finishedWork = null;

	// 判断是否存在3个子阶段需要执行的操作
	// root flags root subtreeFlags
	const subtreeHasEffect =
		(finishedWork.subtreeFlags & MutationMask) !== NoFlags;
	const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags;

	if (subtreeHasEffect || rootHasEffect) {
		// beforeMutation
		// mutation Placement
		commitMutationEffects(finishedWork);

		root.current = finishedWork;

		// layout
	} else {
		root.current = finishedWork;
	}
}

function workLoop() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress)
  }
}

/**
 * @param fiber 实际上是workInProgress，即正在工作的fiberNode
 */
function performUnitOfWork(fiber: FiberNode) {
  const next = beginWork(fiber)
  fiber.memoizedProps = fiber.pendingProps

  if (next === null) {
    // 递归中的归阶段
    completeUnitOfWork(fiber)
  } else {
    // 按 DFS 不断向下执行，直到叶子节点
    workInProgress = next
  }
}

function completeUnitOfWork(fiber: FiberNode) {
  let node: FiberNode | null = fiber

  do {
    completeWork(node)
    const sibling = node.sibling

    if (sibling !== null) {
      workInProgress = sibling
      // 别着急继续返回，先开启兄弟节点的“递”阶段
      return
    }
    // 完成父节点的“归”阶段
    node = node.return
    workInProgress = node
  } while (node !== null)
}