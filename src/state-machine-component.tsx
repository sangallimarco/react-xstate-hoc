import * as React from 'react';
import { DefaultContext, State, Machine, MachineOptions, EventObject, StateSchema, MachineConfig } from 'xstate';

interface HOCState {
    currentState: State<DefaultContext>;
}

interface ExternalProps {
    style?: React.CSSProperties;
}

export interface InjectedProps {
    dispatch: (action: string) => void;
    currentState: State<DefaultContext>;
}

export const withStateMachine = <TOriginalProps extends {}, TContext = DefaultContext, TStateSchema extends StateSchema = any, TEvent extends EventObject = EventObject>(Component: (React.ComponentClass<TOriginalProps & InjectedProps> | React.StatelessComponent<TOriginalProps & InjectedProps>), config: MachineConfig<TContext, TStateSchema, TEvent>, options: MachineOptions<TContext, TEvent>) => {
    type ResultProps = TOriginalProps & ExternalProps;
    return class StateMachine extends React.Component<ResultProps, HOCState> {

        private stateMachine = Machine(config, options);

        public readonly state = {
            currentState: this.stateMachine.initialState
        }

        constructor(props: ResultProps) {
            super(props);
        }

        public render(): JSX.Element {
            return (
                <Component {...this.props} {...this.state} dispatch={this.dispatch} />
            );
        }

        protected dispatch = (action: string) => {
            const { currentState } = this.state;
            if (currentState && this.stateMachine) {
                const { value } = currentState as State<DefaultContext>;
                const newState = this.stateMachine.transition(value, action);
                if (newState.changed) {
                    this.setState({ currentState: newState });
                }
            }
        }
    };
};