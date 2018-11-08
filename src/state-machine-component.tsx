import * as React from 'react';
import { DefaultContext, State, Machine, EventObject, StateSchema, MachineConfig, StateValue } from 'xstate';

interface HOCState<TOriginalState> {
    currentState: State<any>; // @TODO fix it
    context: TOriginalState
}

export interface InjectedProps<TOriginalState> extends HOCState<TOriginalState> {
    dispatch: (action: string) => void;
}

export type Action<TOriginalState> = Map<string, () => Promise<Partial<TOriginalState>>>; // do better here

type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
type Subtract<T, K> = Omit<T, keyof K>;

export const withStateMachine = <
    TOriginalProps,
    TOriginalState extends {} = {},
    TStateSchema extends StateSchema = any,
    TEvent extends EventObject = EventObject
    >(
        Component: (
            React.ComponentClass<TOriginalProps & InjectedProps<TOriginalState>> |
            React.StatelessComponent<TOriginalProps & InjectedProps<TOriginalState>>),
        config: MachineConfig<DefaultContext, TStateSchema, TEvent>,
        context: TOriginalState,
        actions?: Action<TOriginalState>
    ) => {

    type WrapperProps = Subtract<TOriginalProps, InjectedProps<TOriginalState>>;

    return class StateMachine extends React.Component<WrapperProps, HOCState<TOriginalState>> {

        private stateMachine = Machine(config);

        public readonly state: HOCState<TOriginalState> = {
            currentState: this.stateMachine.initialState,
            context
        }

        constructor(props: TOriginalProps) {
            super(props);
        }

        public render(): JSX.Element {
            return (
                <Component {...this.props} {...this.state} dispatch={this.dispatch} />
            );
        }

        public dispatch = (actionName: string) => {
            const { currentState: { value } } = this.state;
            const newState = this.stateMachine.transition(value, actionName);
            if (newState.changed) {
                const { value: stateName } = newState;
                this.setState({ currentState: newState });
                this.execute(stateName);
            }
        }

        private async execute(actionName: StateValue) {
            if (actions) {
                const action = actions.get(actionName as string);
                if (action) {
                    const newContext = await action() as any;
                    const { context: prevContext } = this.state as any;
                    this.setState({ context: { ...prevContext, ...newContext } });
                }
            }
        }
    };
};