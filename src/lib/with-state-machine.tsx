import * as React from 'react';
import { State, EventObject, StateSchema, MachineConfig, StateValue, MachineOptions, DefaultContext, Machine } from 'xstate';
import { interpret, Interpreter } from 'xstate/lib/interpreter';
import { StateMachineInjectedProps, StateMachineHOCState, Subtract, StateMachineStateName } from './types';
import { v4 } from 'uuid';
import {Subject} from 'rxjs';

export const withStateMachine = <
    TOriginalProps,
    TStateSchema extends StateSchema,
    TContext = DefaultContext,
    TEvent extends EventObject = EventObject
>(
    Component: React.ComponentClass<TOriginalProps & StateMachineInjectedProps<TContext, TStateSchema, TEvent>>,
    config: MachineConfig<TContext, TStateSchema, TEvent>,
    initialContext: TContext,
    channel?: Subject<TEvent>
): React.ComponentClass<Subtract<TOriginalProps, StateMachineInjectedProps<TContext, TStateSchema, TEvent>>, StateMachineHOCState<TContext, TStateSchema>> => {

    type WrapperProps = Subtract<TOriginalProps, StateMachineInjectedProps<TContext, TStateSchema, TEvent>>;
    type WrappedProps = TOriginalProps & StateMachineInjectedProps<TContext, TStateSchema, TEvent>;

    return class StateMachineWrapper extends React.Component<WrapperProps, StateMachineHOCState<TContext, TStateSchema>> {

        // those should be private but TSC fails to export declarations
        public stateMachine = Machine(config, {}, initialContext);
        public interpreter: Interpreter<TContext, TStateSchema, TEvent>;
        public currentStateName: StateValue;
        public currentContext: TContext | null = null;

        public readonly state: StateMachineHOCState<TContext, TStateSchema> = {
            currentState: this.stateMachine.initialState.value as StateMachineStateName<TStateSchema>,
            context: this.stateMachine.context as TContext
        }

        public componentDidMount() {
            this.initInterpreter();
            if (channel) {
                channel.subscribe((action: TEvent) => {
                    this.handleDispatch(action);
                })
            }
        }

        public componentWillUnmount() {
            this.stopInterpreter();
            this.currentContext = null;
            if (channel) {
                channel.unsubscribe();
            }
        }

        public render(): JSX.Element {
            const props = { ...this.props, ...this.state } as WrappedProps;
            return (
                <Component {...props} dispatch={this.handleDispatch} injectMachineOptions={this.setMachineOptions} />
            );
        }

        public initInterpreter() {
            if (!this.interpreter) {
                this.interpreter = interpret(this.stateMachine);
                this.interpreter.start();
                this.interpreter.onTransition((current) => {
                    this.handleTransition(current);
                });
                this.interpreter.onChange((context) => {
                    this.handleContext(context);
                });
            }
        }

        public stopInterpreter() {
            if (this.interpreter) {
                this.interpreter.stop();
            }
        }

        public handleTransition(newState: State<TContext, EventObject>) {
            const { changed, value, context } = newState;

            if (changed && value !== this.currentStateName) {
                this.currentStateName = value;
                const newStateName = value as StateMachineStateName<TStateSchema>;
                this.setState({ currentState: newStateName, context, stateHash: v4() });
            }
        }

        public handleContext(context: TContext) {
            if (context !== this.currentContext) {
                this.setState({ context, stateHash: v4() });
                this.currentContext = context;
            }
        }

        public setMachineOptions = (configOptions: Partial<MachineOptions<TContext, TEvent>>) => {
            if (!this.interpreter) {
                this.stateMachine = this.stateMachine.withConfig(configOptions);
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