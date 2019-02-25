import { EventObject, StateSchema, ConditionPredicate, ActionFunctionMap, ActivityConfig } from 'xstate';

export interface StateMachineHOCState<TContext, TStateSchema extends StateSchema> {
    currentState: StateMachineStateName<TStateSchema>;
    context: TContext,
    stateHash: string | undefined;
}

export interface MachineOptionsFix<TContext, TEvent extends EventObject> { // FIXME interface looks broken, please remove when fixed
    guards?: Record<string, ConditionPredicate<TContext, TEvent>>;
    actions?: ActionFunctionMap<TContext, TEvent>;
    activities?: Record<string, ActivityConfig<TContext, TEvent>>;
    services?: Record<string, StateServiceBind<TContext, TEvent, Keys extends keyof TContext>>;
}

export interface StateMachineInjectedProps<TContext, TStateSchema extends StateSchema, MachineEvents extends EventObject> extends StateMachineHOCState<TContext, TStateSchema> {
    dispatch: (action: MachineEvents) => void;
    injectMachineOptions: (options: MachineOptionsFix<TContext, MachineEvents>) => void; // FIXME MachineOptions<TContext, EventObject> broken
}

export interface StateMachineAction<T> extends EventObject {
    data: Partial<T>
}

export type StateMachineStateName<T extends StateSchema> = keyof T['states'];

export type StateServiceBind<TContext, Keys extends keyof TContext> = (ctx: TContext) => Promise<Pick<TContext, Keys>>;
export type StateServiceBind<TContext, TEvent, Keys extends keyof TContext> = (ctx: TContext, event: TEvent) => Promise<Pick<TContext, Keys>>;

export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

export type Subtract<T, K> = Omit<T, keyof K>;
