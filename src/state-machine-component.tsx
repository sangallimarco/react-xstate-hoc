import * as React from 'react';
import { DefaultContext, State, Machine, MachineOptions, EventObject, StateSchema, MachineConfig } from 'xstate';
import { interpret } from 'xstate/lib/interpreter';

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
        private service = interpret(this.stateMachine)
            .onTransition(currentState => this.setState({ currentState }));

        public readonly state = {
            currentState: this.stateMachine.initialState
        }

        constructor(props: ResultProps) {
            super(props);
        }

        public componentDidMount() {
            this.service.start();
        }

        public componentWillUnmount() {
            this.service.stop();
        }

        public render(): JSX.Element {
            return (
                <Component {...this.props} {...this.state} dispatch={this.dispatch} />
            );
        }

        protected dispatch = (actionName: string) => {
            this.service.send(actionName);
        }

        // private async executeAction(action: ActionObject<TContext>) {
        // }
    };
};