import * as React from 'react';
import { DefaultContext, State, Machine, EventObject, StateSchema, MachineConfig, StateValue } from 'xstate';
import { interpret } from 'xstate/lib/interpreter';

interface HOCState<TOriginalState> {
    currentState: State<any>; // @TODO fix it
    context: TOriginalState
}

export interface InjectedProps<TOriginalState> extends HOCState<TOriginalState> {
    dispatch: (action: string) => void;
}

export type Action<TOriginalState> = Map<string, () => Promise<ActionArtifact<TOriginalState>>>;

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
        config: MachineConfig<DefaultContext, TStateSchema, TEvent>,
        context: TOriginalState,
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
            context
        }

        constructor(props: TOriginalProps) {
            super(props);
            this.interpreter.onTransition(current => this.execute(current));
        }

        public render(): JSX.Element {
            return (
                <Component {...this.props} {...this.state} dispatch={this.interpreter.send} />
            );
        }

        private async execute(newState: State<DefaultContext>) {
            const { changed, value } = newState;
            if (changed && value !== this.currentStateName) {
                this.currentStateName = value;
                this.setState({ currentState: newState });
                if (actions) {
                    const action = actions.get(value as string);
                    if (action) {
                        const actionArtifact: ActionArtifact<TOriginalState> = await action();
                        const { data, triggerAction } = actionArtifact;
                        const { context: prevContext } = this.state;
                        this.setState({ context: { ...prevContext as any, ...data as any } }); // use util to merge data
                        if (triggerAction) {
                            this.interpreter.send(triggerAction);
                        }
                    }
                }
            }
        }
    };
};