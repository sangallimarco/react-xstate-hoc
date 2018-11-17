import * as React from 'react';
import { DefaultContext, State, Machine, EventObject, StateSchema, MachineConfig, StateValue, MachineOptions } from 'xstate';
import { interpret } from 'xstate/lib/interpreter';
import { omit } from 'lodash';
import { StateMachineInjectedProps, StateMachineHOCState, Subtract, StateMachineActionArtifact, StateMachineAction } from './types';

export const withStateMachine = <
    TOriginalProps,
    TOriginalState extends {} = {},
    TStateSchema extends StateSchema = any,
    TEvent extends EventObject = EventObject
    >(
        Component: (
            React.ComponentClass<TOriginalProps & StateMachineInjectedProps<TOriginalState>> |
            React.StatelessComponent<TOriginalProps & StateMachineInjectedProps<TOriginalState>>),
        config: MachineConfig<TOriginalState, TStateSchema, TEvent>,
        options: MachineOptions<TOriginalState, TEvent>,
        initialContext: TOriginalState,
        onEnterActions: StateMachineAction<TOriginalState>
    ) => {

    type WrapperProps = Subtract<TOriginalProps, StateMachineInjectedProps<TOriginalState>>;

    return class StateMachine extends React.Component<WrapperProps, StateMachineHOCState<TOriginalState>> {

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
            let params = {};

            if (newStateEventObject.type) {
                params = omit(newStateEventObject, 'type');
            }

            // should be in a service/function
            if (changed && value !== this.currentStateName) {
                this.currentStateName = value;
                this.setState({ currentState: newState });
                if (onEnterActions) {
                    const action = onEnterActions.get(value as string);
                    if (action) {
                        const actionArtifact: StateMachineActionArtifact<TOriginalState> = await action(params);
                        const { data, triggerAction } = actionArtifact;
                        if (triggerAction) {
                            const newEvent = {
                                type: triggerAction,
                                data
                            };
                            this.interpreter.send(newEvent as any);
                        }
                    }
                }
            }

        }
    };
};