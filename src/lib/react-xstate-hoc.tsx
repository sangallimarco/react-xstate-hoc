import * as React from 'react';
import { State, Machine, EventObject, StateSchema, MachineConfig, StateValue, MachineOptions, DefaultContext } from 'xstate';
import { interpret } from 'xstate/lib/interpreter';
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

    return class StateMachine extends React.Component<WrapperProps, StateMachineHOCState<TContext, TStateSchema>> {

        // those should be private but TSC fails to export declarations
        public stateMachine = Machine(config, {}, initialContext)
        public interpreter = interpret(this.stateMachine);
        public currentStateName: StateValue;

        // public componentDidMount() {
        //     this.interpreter.start();
        // }

        public componentWillUnmount() {
            this.interpreter.stop();
        }

        public readonly state: StateMachineHOCState<TContext, TStateSchema> = {
            currentState: this.stateMachine.initialState.value as StateMachineStateName<TStateSchema>,
            context: this.stateMachine.context as TContext
        }

        constructor(props: TOriginalProps) {
            super(props);
            // this.setMachineOptions(options);
        }

        public render(): JSX.Element {
            return (
                <Component {...this.props} {...this.state} dispatch={this.interpreter.send} injectConfig={this.setMachineOptions} />
            );
        }

        public setMachineOptions = (configOptions: any) => { // MachineOptions<TContext, TEvent> broken type
            this.interpreter.stop();

            this.stateMachine = Machine(config, configOptions, initialContext);
            this.interpreter = interpret(this.stateMachine);
            this.interpreter.onTransition((current) => this._execute(current));
            this.interpreter.onChange((context) => {
                this.setState({ context })
            });

            this.interpreter.start();
        }

        public async _execute(newState: State<any, EventObject>) {
            const { changed, value } = newState;

            if (changed && value !== this.currentStateName) {
                this.currentStateName = value;
                const newStateName = value as StateMachineStateName<TStateSchema>;
                this.setState({ currentState: newStateName });
            }

        }
    };
};