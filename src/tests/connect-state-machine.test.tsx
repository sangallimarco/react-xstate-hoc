import * as React from 'react'
import { connectStateMachine } from '../lib/connect-state-machine';
import { StateMachineConnectedProps } from '../lib/types';
import { shallow, mount } from 'enzyme';
import { Machine, MachineConfig, StateMachine, interpret } from 'xstate';
import { Interpreter } from 'xstate/lib/interpreter';

let mockWithConfig = jest.fn();
let mockStart = jest.fn();
let mockStop = jest.fn();
let mockTransition = jest.fn();
let mockChange = jest.fn();
let mockOff = jest.fn();

jest.mock('xstate', () => ({
    Machine: () => ({
        initialState: {
            value: 'A'
        },
        withConfig: mockWithConfig
    }),
    interpret: () => ({
        state: 'A',
        start: mockStart,
        stop: mockStop,
        onTransition: mockTransition,
        onChange: mockChange,
        off: mockOff
    })
}));

interface HostedMachineStateSchema {
    states: {
        A: {};
        B: {}
    }
}

interface HostedComponentSchema {
    states: {
        A: {};
        B: {};
    }
}

type HostedComponentEvents =
    { type: 'DEFAULT' }
    | { type: 'NULL' };


interface HostedComponentProps extends StateMachineConnectedProps<HostedComponentContext, HostedComponentSchema, HostedComponentEvents> {
}

class HostedComponent extends React.Component<HostedComponentProps> {
    public render() {
        return <div />;
    }
}

interface HostedComponentContext {
    enabled: boolean;
}

const machineMock: MachineConfig<HostedComponentContext, HostedMachineStateSchema, HostedComponentEvents> = {
    initial: 'A',
    states: {
        A: {},
        B: {}
    }
};

let stateMachine: StateMachine<HostedComponentContext, HostedComponentSchema, HostedComponentEvents>;
let interpreter: Interpreter<HostedComponentContext, HostedComponentSchema, HostedComponentEvents>;

describe('ReactXstateHoc', () => {
    beforeEach(() => {
        mockStart = jest.fn();
        mockStop = jest.fn();
        mockWithConfig = jest.fn();
        stateMachine = Machine(machineMock, {}, { enabled: true });
        interpreter = interpret(stateMachine); //.start();
    });

    it('Should initilise interpreter on mount by hosted component', () => {
        const component = React.createElement(connectStateMachine(HostedComponent, interpreter));
        const instance = mount(component).instance() as any; // should be a type here
        const initInterpreter = jest.spyOn(instance, 'initInterpreter');
        instance.componentDidMount();
        expect(initInterpreter).toHaveBeenCalledTimes(1);
        expect(mockTransition).toHaveBeenCalled();
        expect(mockChange).toHaveBeenCalledTimes(1);
    });

    it('Should remove listeners interpreter on unmount', () => {
        const component = React.createElement(connectStateMachine(HostedComponent, interpreter));
        const instance = shallow(component);
        instance.unmount();
        expect(mockOff).toHaveBeenCalledTimes(2);
    });
})