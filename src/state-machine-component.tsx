import * as React from 'react';
import { DefaultContext, State, Machine, EventObject, StateSchema, MachineConfig, StateValue, OmniEvent } from 'xstate';
import { interpret } from 'xstate/lib/interpreter';
import { omit, Dictionary } from 'lodash';

interface HOCState<TOriginalState> {
    currentState: State<DefaultContext>;
    context: TOriginalState
}

export interface InjectedProps<TOriginalState> extends HOCState<TOriginalState> {
    dispatch: (action: OmniEvent<EventObject>) => void;
}

export type Action<TOriginalState> = Map<string, (params?: Dictionary<string | number | boolean>) => Promise<ActionArtifact<TOriginalState>>>;

export interface OnEntryAction<T> extends EventObject {
    data: Partial<T>
}

export interface ActionArtifact<TOriginalState> {
    data: Partial<TOriginalState>;
    triggerAction: string;
}

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
        config: MachineConfig<TOriginalState, TStateSchema, TEvent>,
        actions?: Action<TOriginalState>
    ) => {

    type WrapperProps = Subtract<TOriginalProps, InjectedProps<TOriginalState>>;
    const stateMachine = Machine(config);

    return class StateMachine extends React.Component<WrapperProps, HOCState<TOriginalState>> {

        private interpreter = interpret(stateMachine);
        private currentStateName: StateValue;

        public componentDidMount() {
            this.interpreter.start();
        }

        public componentWillUnmount() {
            this.interpreter.stop();
        }

        public readonly state: HOCState<TOriginalState> = {
            currentState: stateMachine.initialState,
            context: stateMachine.context as TOriginalState
        }

        constructor(props: TOriginalProps) {
            super(props);
            this.interpreter.onTransition((current, event) => this.execute(current, event));
            this.interpreter.onChange((context) => {
                this.setState({ context })
            });
        }

        public render(): JSX.Element {
            return (
                <Component {...this.props} {...this.state} dispatch={this.interpreter.send} />
            );
        }

        private async execute(newState: State<DefaultContext>, newStateEventObject: EventObject) {
            const { changed, value } = newState;
            let params = {};

            if (newStateEventObject.type) {
                params = omit(newStateEventObject, 'type');
            }

            // should be 
            if (changed && value !== this.currentStateName) {
                this.currentStateName = value;
                this.setState({ currentState: newState });
                if (actions) {
                    const action = actions.get(value as string);
                    if (action) {
                        const actionArtifact: ActionArtifact<TOriginalState> = await action(params);
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