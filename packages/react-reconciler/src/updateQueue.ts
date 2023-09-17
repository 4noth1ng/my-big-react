import { Action } from "shared/ReactTypes";
/**
 * Action: 更新的动作，State | (prevState:State) => State
 * 触发更新的单元：Update，Update内包含了action，
 * action可以是值，也可以是函数，比如setState(1)或setState((x) => x+1), 
 * UpdateQueue作为存放和消费Update的结构
 */
export interface Update<State> {
    action: Action<State>
}
export interface UpdateQueue<State> {
    shared: {
        pending: Update<State> | null;
    }
}


export const createUpdate = <State>(action: Action<State>) =>  {
    return {
        shared: {
            pending: null
        }
    }
}

export const createUpdateQueue = <Action>() => {
    return {
        shared: {
            pending: null
        }
    } as UpdateQueue<Action>
}
// 增加update
export const enqueueUpdate = <Action>(
    UpdateQueue: UpdateQueue<Action>,
    update: Update<Action>
) => {
    UpdateQueue.shared.pending = update
}

// 消费update
export const processUpdateQueue = <State>(
    baseState: State,
    pendingUpdate: Update<State> | null
): {memoizedState: State} => {
    const result: ReturnType<typeof processUpdateQueue<State>> = {
        memoizedState: baseState
    }
    if(pendingUpdate !== null) {
        const action = pendingUpdate.action
        if(action instanceof Function) {
            result.memoizedState = action(baseState)
        } else {
            result.memoizedState = action
        }
    }
    return result
}