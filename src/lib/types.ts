import { State, EventObject, OmniEvent } from 'xstate';

export interface StateMachineHOCState<TContext> {
    currentState: State<TContext>;
    context: TContext
}

export interface StateMachineInjectedProps<TContext, MachineEvents extends OmniEvent<EventObject>> extends StateMachineHOCState<TContext> {
    dispatch: (action: MachineEvents) => void;
}

export interface StateMachineAction<T> extends EventObject {
    data: Partial<T>
}

export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
export type Subtract<T, K> = Omit<T, keyof K>;
