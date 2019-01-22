import * as React from 'react';
import { State, EventObject, StateSchema, MachineConfig, StateValue, MachineOptions, DefaultContext, Machine } from 'xstate-ext';
import { interpret, Interpreter } from 'xstate-ext/lib/interpreter';
import { StateMachineInjectedProps, StateMachineHOCState, Subtract, StateMachineStateName, MachineOptionsFix } from './types';
import { v4 } from 'uuid';

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
    initialContext: TContext
): React.ComponentClass<Subtract<TOriginalProps, StateMachineInjectedProps<TContext, TStateSchema, TEvent>>, StateMachineHOCState<TContext, TStateSchema>> => {

    type WrapperProps = Subtract<TOriginalProps, StateMachineInjectedProps<TContext, TStateSchema, TEvent>>;

    return class StateMachineWrapper extends React.Component<WrapperProps, StateMachineHOCState<TContext, TStateSchema>> {

        // those should be private but TSC fails to export declarations
        public stateMachine = Machine(config, {}, initialContext);
        public interpreter: Interpreter<TContext, TStateSchema, TEvent>;
        public currentStateName: StateValue;

        public readonly state: StateMachineHOCState<TContext, TStateSchema> = {
            currentState: this.stateMachine.initialState.value as StateMachineStateName<TStateSchema>,
            context: this.stateMachine.context as TContext,
            stateHash: undefined
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
                this.interpreter = interpret(this.stateMachine);
                this.interpreter.start();
                this.interpreter.onTransition((current) => {
                    this._execute(current);
                });
                this.interpreter.onChange((context) => {
                    this.setState({ context, stateHash: v4() });
                });
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
                this.setState({ currentState: newStateName, stateHash: v4() });
            }
        }

        public setMachineOptions = (configOptions: MachineOptionsFix<TContext, TEvent>) => {
            if (!this.interpreter) {
                this.stateMachine = this.stateMachine.withConfig(configOptions as MachineOptions<TContext, TEvent>); // FIXME casting type to original MachineOptions for now
                this.initInterpreter();
            }
        };

        public handleDispatch = (action: TEvent) => {
            if (this.interpreter) {
                this.interpreter.send(action);
            }
        };
    };
};