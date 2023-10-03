import { Container } from 'hostConfig';
import { FiberNode, FiberRootNode } from './fiber';
import { HostRoot } from './workTags';
import { createUpdateQueue, createUpdate, enqueueUpdate, UpdateQueue } from './updateQueue';
import { ReactElementType } from '../../shared/ReactTypes';
import { scheduleUpdateOnFiber } from './workLoop';



// 调用ReactDom.createRoot(rootElement)时调用createContainer
export function createContainer(container: Container) {
    // 挂载节点hostRoot的fiber结构
    const hostRootFiber = new FiberNode(HostRoot, {}, null)
    // 真正的根节点fiberRootNode
    const root = new FiberRootNode(container, hostRootFiber)
    // 接入关联更新机制
    hostRootFiber.updateQueue = createUpdateQueue()
    return root
}

export function updateContainer(element: ReactElementType| null, root: FiberRootNode) {
    const hostRootFiber = root.current
    
    const update = createUpdate<ReactElementType | null>(element)

    enqueueUpdate(
        hostRootFiber.updateQueue as UpdateQueue<ReactElementType | null>, 
        update
    )
    
    scheduleUpdateOnFiber(hostRootFiber)
    return element
}