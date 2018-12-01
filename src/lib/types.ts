import { DefaultContext, State, EventObject, OmniEvent } from 'xstate';

export interface StateMachineHOCState<TOriginalState> {
    currentState: State<DefaultContext>;
    context: TOriginalState
}

export interface StateMachineInjectedProps<TOriginalState, MachineEvents extends OmniEvent<EventObject>> extends StateMachineHOCState<TOriginalState> {
    dispatch: (action: MachineEvents) => void;
}

export interface StateMachineAction<T> extends EventObject {
    data: Partial<T>
}

export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
export type Subtract<T, K> = Omit<T, keyof K>;
