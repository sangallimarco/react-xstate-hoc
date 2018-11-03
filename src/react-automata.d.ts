declare module 'react-automata' {
    import * as react from 'react';

    interface StateMachineProps {
        transition: (stateName: string) => void; // add updater
        machineState: string;
    }

    class Automata<P, S> extends React.Component<P & StateMachineProps, S> {

    }

    export function withStateMachine<P, S>(statechart: {}, options?: {}): (component: React.ComponentClass<P, S>) => Automata<P, S>;

}