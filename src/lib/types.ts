import { EventObject, OmniEvent, StateSchema, ConditionPredicate, ActionFunctionMap, ActivityConfig } from 'xstate';

export interface StateMachineHOCState<TContext, TStateSchema extends StateSchema> {
    currentState: StateMachineStateName<TStateSchema>;
    context: TContext
}

export interface MachineOptionsFix<TContext, TEvent extends EventObject> { // FIXME interface looks broken, please remove when fixed
    guards?: Record<string, ConditionPredicate<TContext, TEvent>>;
    actions?: ActionFunctionMap<TContext>;
    activities?: Record<string, ActivityConfig<TContext>>;
    services?: Record<string, (ctx: TContext, event: TEvent) => Promise<Partial<TContext>>>; // ServiceConfig ?
}

export interface StateMachineInjectedProps<TContext, TStateSchema extends StateSchema, MachineEvents extends OmniEvent<EventObject>> extends StateMachineHOCState<TContext, TStateSchema> {
    dispatch: (action: MachineEvents) => void;
    injectMachineOptions: (options: MachineOptionsFix<TContext, EventObject>) => void; // FIXME MachineOptions<TContext, EventObject> broken
}

export interface StateMachineAction<T> extends EventObject {
    data: Partial<T>
}

export type StateMachineStateName<T extends StateSchema> = keyof T['states'];

export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

export type Subtract<T, K> = Omit<T, keyof K>;
