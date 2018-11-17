import { DefaultContext, State, EventObject, OmniEvent } from 'xstate';
import { Dictionary } from 'lodash';

export interface StateMachineHOCState<TOriginalState> {
    currentState: State<DefaultContext>;
    context: TOriginalState
}

export interface StateMachineInjectedProps<TOriginalState> extends StateMachineHOCState<TOriginalState> {
    dispatch: (action: OmniEvent<EventObject>) => void;
}

export type StateMachineAction<TOriginalState> = Map<string, (params?: Dictionary<string | number | boolean>) => Promise<StateMachineActionArtifact<TOriginalState>>>;

export interface StateMachineOnEntryAction<T> extends EventObject {
    data: Partial<T>
}

export interface StateMachineActionArtifact<TOriginalState> {
    data: Partial<TOriginalState>;
    triggerAction: string;
}

export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
export type Subtract<T, K> = Omit<T, keyof K>;
