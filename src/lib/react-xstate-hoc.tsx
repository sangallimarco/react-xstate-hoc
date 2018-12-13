import * as React from 'react';
import { State, EventObject, StateSchema, MachineConfig, StateValue, MachineOptions, DefaultContext, StateMachine, Machine } from 'xstate';
import { interpret, Interpreter } from 'xstate/lib/interpreter';
import { StateMachineInjectedProps, StateMachineHOCState, Subtract, StateMachineStateName, MachineOptionsFix } from './types';

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
    ): React.ComponentClass<Subtract<TOriginalProps, StateMachineInjectedProps<TContext, TStateSchema, TEvent>>, StateMachineHOCState<TContext, TStateSchema>> => {

    type WrapperProps = Subtract<TOriginalProps, StateMachineInjectedProps<TContext, TStateSchema, TEvent>>;

    return class StateMachineWrapper extends React.Component<WrapperProps, StateMachineHOCState<TContext, TStateSchema>> {

        // those should be private but TSC fails to export declarations
        public stateMachine: StateMachine<TContext, TStateSchema, TEvent> = Machine(config, options, initialContext);
        public interpreter: Interpreter<TContext, TStateSchema, TEvent>;
        public currentStateName: StateValue;

        public readonly state: StateMachineHOCState<TContext, TStateSchema> = {
            currentState: this.stateMachine.initialState.value as StateMachineStateName<TStateSchema>,
            context: this.stateMachine.context as TContext
        }

        public componentDidMount() {
            this.initInterpreter();
        }

        public componentWillUnmount() {
            this.stopInterpreter();
        }

        public render(): JSX.Element {
            return (
                <Component {...this.props} {...this.state} dispatch={this.handleDispatch} injectMachineOptions={this.setMachineOptions} />
            );
        }

        public initInterpreter() {
            if (!this.interpreter) {
                this.stopInterpreter();
                this.interpreter = interpret(this.stateMachine);
                this.interpreter.onTransition((current) => this._execute(current));
                this.interpreter.onChange((context) => {
                    this.setState({ context })
                });
                this.interpreter.start();
            }
        }

        public stopInterpreter() {
            if (this.interpreter) {
                this.interpreter.stop();
            }
        }

        public async _execute(newState: State<any, EventObject>) {
            const { changed, value } = newState;

            if (changed && value !== this.currentStateName) {
                this.currentStateName = value;
                const newStateName = value as StateMachineStateName<TStateSchema>;
                this.setState({ currentState: newStateName });
            }
        }

        public setMachineOptions = (configOptions: MachineOptionsFix<TContext, TEvent>) => {
            this.stateMachine = this.stateMachine.withConfig(configOptions as MachineOptions<TContext, TEvent>); // FIXME casting type to original MachineOptions for now
            this.initInterpreter();
        };

        public handleDispatch = (action: TEvent) => {
            if (this.interpreter) {
                this.interpreter.send(action);
            }
        };
    };
};