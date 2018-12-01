import * as React from 'react';
import { DefaultContext, State, Machine, EventObject, StateSchema, MachineConfig, StateValue, MachineOptions } from 'xstate';
import { interpret } from 'xstate/lib/interpreter';
import { StateMachineInjectedProps, StateMachineHOCState, Subtract } from './types';

export const withStateMachine = <
    TOriginalProps,
    TStateSchema extends StateSchema,
    TOriginalState extends {} = {},
    TEvent extends EventObject = EventObject
    >(
        Component: (
            React.ComponentClass<TOriginalProps & StateMachineInjectedProps<TOriginalState, TEvent>> |
            React.StatelessComponent<TOriginalProps & StateMachineInjectedProps<TOriginalState, TEvent>>),
        config: MachineConfig<TOriginalState, TStateSchema, TEvent>,
        options: MachineOptions<TOriginalState, TEvent>,
        initialContext: TOriginalState
    ) => {

    type WrapperProps = Subtract<TOriginalProps, StateMachineInjectedProps<TOriginalState, TEvent>>;

    return class StateMachine extends React.Component<WrapperProps, StateMachineHOCState<TOriginalState>> {

        // those should be private but TSC fails to export declarations
        public stateMachine = Machine(config, options, initialContext)
        public interpreter = interpret(this.stateMachine);
        public currentStateName: StateValue;

        public componentDidMount() {
            this.interpreter.start();
        }

        public componentWillUnmount() {
            this.interpreter.stop();
        }

        public readonly state: StateMachineHOCState<TOriginalState> = {
            currentState: this.stateMachine.initialState,
            context: this.stateMachine.context as TOriginalState
        }

        constructor(props: TOriginalProps) {
            super(props);
            this.interpreter.onTransition((current, event) => this._execute(current, event));
            this.interpreter.onChange((context) => {
                this.setState({ context })
            });
        }

        public render(): JSX.Element {
            return (
                <Component {...this.props} {...this.state} dispatch={this.interpreter.send} />
            );
        }

        public async _execute(newState: State<DefaultContext>, newStateEventObject: EventObject) {
            const { changed, value } = newState;

            if (changed && value !== this.currentStateName) {
                this.currentStateName = value;
                this.setState({ currentState: newState });
            }

        }
    };
};