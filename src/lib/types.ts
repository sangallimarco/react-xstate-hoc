import { EventObject, StateSchema, MachineOptions } from 'xstate';

export interface StateMachineHOCState<TContext, TStateSchema extends StateSchema> {
    currentState: StateMachineStateName<TStateSchema>;
    context: TContext,
    stateHash?: string;
}

export interface StateMachineInjectedProps<TContext, TStateSchema extends StateSchema, MachineEvents extends EventObject> extends StateMachineHOCState<TContext, TStateSchema> {
    dispatch: (action: MachineEvents) => void;
    injectMachineOptions: (options: Partial<MachineOptions<TContext, MachineEvents>>) => void;
}

export interface StateMachineConnectedProps<TContext, TStateSchema extends StateSchema, MachineEvents extends EventObject> extends StateMachineHOCState<TContext, TStateSchema> {
    dispatch: (action: MachineEvents) => void;
}

export interface StateMachineAction<T> extends EventObject {
    data: Partial<T>
}

export type StateMachineStateName<T extends StateSchema> = keyof T['states'];

export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

export type Subtract<T, K> = Omit<T, keyof K>;
