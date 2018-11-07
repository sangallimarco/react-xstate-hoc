import * as React from 'react';
import { DefaultContext, State, Machine, MachineOptions, EventObject, StateSchema, MachineConfig } from 'xstate';
import { interpret } from 'xstate/lib/interpreter';

interface HOCState<T> {
    currentState: State<any>; // @TODO fix it
    context: T | undefined;
}

export interface InjectedProps<T> extends HOCState<T> {
    dispatch: (action: string) => void;
}

type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
type Subtract<T, K> = Omit<T, keyof K>;

export const withStateMachine = <
    TOriginalProps,
    TContext = DefaultContext,
    TStateSchema extends StateSchema = any,
    TEvent extends EventObject = EventObject
    >(
        Component: (
            React.ComponentClass<TOriginalProps & InjectedProps<TContext>> |
            React.StatelessComponent<TOriginalProps & InjectedProps<TContext>>),
        config: MachineConfig<TContext, TStateSchema, TEvent>,
        options: MachineOptions<TContext, TEvent>
    ) => {

    return class StateMachine extends React.Component<
        Subtract<TOriginalProps, InjectedProps<TContext>>
        , HOCState<TContext>
        > {

        private stateMachine = Machine(config, options);
        private service = interpret(this.stateMachine);

        public readonly state = {
            currentState: this.stateMachine.initialState,
            context: this.stateMachine.context
        }

        constructor(props: TOriginalProps) {
            super(props);
            this.service.onTransition(currentState => {
                this.setState({ currentState })
            });
            this.service.onChange((context: TContext) => {
                this.setState({ context })
            });
        }

        public componentDidMount() {
            this.service.start();
        }

        public componentWillUnmount() {
            this.service.stop();
        }

        public render(): JSX.Element {
            return (
                <Component {...this.props} {...this.state} dispatch={this.dispatch} />
            );
        }

        public dispatch = (actionName: string) => {
            this.service.send(actionName);
        }

        // private async executeAction(action: ActionObject<TContext>) {
        // }
    };
};