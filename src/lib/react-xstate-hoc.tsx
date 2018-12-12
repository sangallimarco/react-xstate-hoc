import * as React from 'react';
import { State, EventObject, StateSchema, MachineConfig, StateValue, MachineOptions, DefaultContext, StateMachine, Machine } from 'xstate';
import { interpret, Interpreter } from 'xstate/lib/interpreter';
import { StateMachineInjectedProps, StateMachineHOCState, Subtract, StateMachineStateName } from './types';

export const withStateMachine = <
    TOriginalProps,
    TStateSchema extends StateSchema,
    TContext = DefaultContext,
    TEvent extends EventObject = EventObject
    >(
        Component: (
            React.ComponentClass<TOriginalProps & StateMachineInjectedProps<TContext, TStateSchema, TEvent>> |
            React.StatelessComponent<TOriginalProps & StateMachineInjectedProps<TContext, TStateSchema, TEvent>>),
        config: MachineConfig<TContext, TStateSchema, TEvent>,
        options: MachineOptions<TContext, TEvent>,
        initialContext: TContext
    ) => {

    type WrapperProps = Subtract<TOriginalProps, StateMachineInjectedProps<TContext, TStateSchema, TEvent>>;

    return class StateMachineWrapper extends React.Component<WrapperProps, StateMachineHOCState<TContext, TStateSchema>> {

        // those should be private but TSC fails to export declarations
        public stateMachine: StateMachine<TContext, TStateSchema, TEvent> = Machine(config, options, initialContext);
        public interpreter: Interpreter<TContext, TStateSchema, TEvent>;
        public currentStateName: StateValue;

        public componentWillUnmount() {
            if (this.interpreter) {
                this.interpreter.stop();
            }
        }

        public componentDidMount() {
            this.interpreter = interpret(this.stateMachine);
            this.interpreter.onTransition((current) => this._execute(current));
            this.interpreter.onChange((context) => {
                this.setState({ context })
            });
            this.interpreter.start();
        }

        public readonly state: StateMachineHOCState<TContext, TStateSchema> = {
            currentState: this.stateMachine.initialState.value as StateMachineStateName<TStateSchema>,
            context: this.stateMachine.context as TContext
        }

        public render(): JSX.Element {
            return (
                <Component {...this.props} {...this.state} dispatch={this.handleDispatch} injectMachineOptions={this.setMachineOptions} />
            );
        }

        public async _execute(newState: State<any, EventObject>) {
            const { changed, value } = newState;

            if (changed && value !== this.currentStateName) {
                this.currentStateName = value;
                const newStateName = value as StateMachineStateName<TStateSchema>;
                this.setState({ currentState: newStateName });
            }
        }

        public setMachineOptions = (configOptions: MachineOptions<TContext, TEvent>) => {
            this.stateMachine = Machine(config, configOptions, initialContext);
        };

        public handleDispatch = (action: TEvent) => {
            if (this.interpreter) {
                this.interpreter.send(action);
            }
        };
    };
};