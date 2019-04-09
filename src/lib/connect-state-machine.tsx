import * as React from 'react';
import { State, EventObject, StateSchema, StateValue, DefaultContext } from 'xstate';
import { Interpreter } from 'xstate/lib/interpreter';
import { StateMachineHOCState, Subtract, StateMachineStateName, StateMachineConnectedProps } from './types';
import { v4 } from 'uuid';

export const connectStateMachine = <
    TOriginalProps,
    TStateSchema extends StateSchema,
    TContext = DefaultContext,
    TEvent extends EventObject = EventObject
>(
    Component: React.ComponentClass<TOriginalProps & StateMachineConnectedProps<TContext, TStateSchema, TEvent>>,
    interpreter: Interpreter<TContext, TStateSchema, TEvent>
): React.ComponentClass<Subtract<TOriginalProps, StateMachineConnectedProps<TContext, TStateSchema, TEvent>>, StateMachineHOCState<TContext, TStateSchema>> => {

    type WrapperProps = Subtract<TOriginalProps, StateMachineConnectedProps<TContext, TStateSchema, TEvent>>;
    type WrappedProps = TOriginalProps & StateMachineConnectedProps<TContext, TStateSchema, TEvent>;

    return class StateMachineWrapper extends React.Component<WrapperProps, StateMachineHOCState<TContext, TStateSchema>> {

        public currentStateName: StateValue;
        public interpreterConnected: boolean = false;
        public currentContext: TContext | null = null;

        public readonly state: StateMachineHOCState<TContext, TStateSchema> = {
            currentState: interpreter.state.value as StateMachineStateName<TStateSchema>,
            context: interpreter.state.context as TContext
        }

        public componentDidMount() {
            this.initInterpreter();
        }

        public componentWillUnmount() {
            this.stopInterpreter();
        }

        public render(): JSX.Element {
            const props = { ...this.props, ...this.state } as WrappedProps;
            return (
                <Component {...props} dispatch={this.handleDispatch} />
            );
        }

        public initInterpreter() {
            if (!this.interpreterConnected) {
                interpreter.onTransition((current) => {
                    this.handleTransition(current);
                });
                interpreter.onChange((context) => {
                    this.handleContext(context);
                });
                this.interpreterConnected = true;
            }
        }

        public stopInterpreter() {
            if (this.interpreterConnected) {
                interpreter.off(this.handleTransition);
                interpreter.off(this.handleState);
            }
        }

        public handleState = (context: TContext) => {
            this.setState({ context, stateHash: v4() });
        }

        public handleContext(context: TContext) {
            if (context !== this.currentContext) {
                this.setState({ context, stateHash: v4() });
                this.currentContext = context;
            }
        }

        public handleTransition = (newState: State<TContext, EventObject>) => {
            const { changed, value } = newState;

            if (changed && value !== this.currentStateName) {
                this.currentStateName = value;
                const newStateName = value as StateMachineStateName<TStateSchema>;
                this.setState({ currentState: newStateName, stateHash: v4() });
            }
        }

        public handleDispatch = (action: TEvent) => {
            if (interpreter) {
                interpreter.send(action);
            }
        };
    };
};