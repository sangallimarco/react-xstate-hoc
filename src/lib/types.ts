import { EventObject, OmniEvent, StateSchema } from 'xstate';

export interface StateMachineHOCState<TContext, TStateSchema extends StateSchema> {
    currentState: StateMachineStateName<TStateSchema>;
    context: TContext
}

export interface StateMachineInjectedProps<TContext, TStateSchema extends StateSchema, MachineEvents extends OmniEvent<EventObject>> extends StateMachineHOCState<TContext, TStateSchema> {
    dispatch: (action: MachineEvents) => void;
}

export interface StateMachineAction<T> extends EventObject {
    data: Partial<T>
}

export type StateMachineStateName<T extends StateSchema> = keyof T['states'];

export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

export type Subtract<T, K> = Omit<T, keyof K>;
