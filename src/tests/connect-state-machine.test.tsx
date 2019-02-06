import * as React from 'react'
import { connectStateMachine } from '../lib/connect-state-machine';
import { StateMachineInjectedProps } from '../lib/types';
import { shallow, mount } from 'enzyme';
import { EventObject, Machine, MachineConfig, StateMachine, interpret } from 'xstate';
import { Interpreter } from 'xstate/lib/interpreter';

let mockWithConfig = jest.fn();
jest.mock('xstate', () => ({
    Machine: () => ({
        initialState: {
            value: 'A'
        },
        withConfig: mockWithConfig
    })
}));

let mockStart = jest.fn();
let mockStop = jest.fn();
jest.mock('xstate/lib/interpreter', () => ({
    interpret: () => ({
        start: mockStart,
        stop: mockStop,
        onTransition: jest.fn(),
        onChange: jest.fn()
    })
}));

interface HostedMachineStateSchema {
    states: {
        A: {};
        B: {}
    }
}

const machineMock: MachineConfig<{}, HostedMachineStateSchema, EventObject> = {
    initial: 'A',
    states: {
        A: {},
        B: {}
    }
};
interface HostedComponentSchema {
    states: {
        A: {};
        B: {};
    }
}

type HostedComponentEvents =
    | { type: 'DEFAULT' }
    | { type: 'NULL' };


interface HostedComponentProps extends StateMachineInjectedProps<{}, HostedComponentSchema, HostedComponentEvents> {
}

class HostedComponent extends React.Component<HostedComponentProps> {
    public render() {
        return <div />;
    }
}

class HostedComponentInjector extends React.Component<HostedComponentProps> {
    constructor(props: any) {
        super(props);
        const { injectMachineOptions } = this.props;
        injectMachineOptions({ actions: {} });
    }

    public render() {
        return <div />;
    }
}

interface HostedComponentContext {
    enabled: boolean;
}

let stateMachine: StateMachine<HostedComponentContext, HostedComponentSchema, HostedComponentEvents>;
let interpreter: Interpreter<HostedComponentContext, HostedComponentSchema, HostedComponentEvents>;

describe('ReactXstateHoc', () => {
    beforeEach(() => {
        mockStart = jest.fn();
        mockStop = jest.fn();
        mockWithConfig = jest.fn();
        stateMachine = Machine(machineMock, {}, { enabled: true });
        interpreter = interpret(stateMachine);
    });

    it('Should not initilise interpreter when render called', () => {
        const component = React.createElement(connectStateMachine(HostedComponent, interpreter));
        const instance = mount(component).instance() as any; // should be a type here
        const initInterpreter = jest.spyOn(instance, 'initInterpreter');
        instance.forceUpdate();
        expect(mockWithConfig).not.toHaveBeenCalled();
        expect(initInterpreter).not.toHaveBeenCalled();
        expect(mockStart).toHaveBeenCalledTimes(1);
    });

    it('Should initilise interpreter on mount when injectMachineOptions is not called by hosted component', () => {
        const component = React.createElement(connectStateMachine(HostedComponent, interpreter));
        const instance = mount(component).instance() as any; // should be a type here
        const initInterpreter = jest.spyOn(instance, 'initInterpreter');
        instance.componentDidMount();
        expect(mockWithConfig).not.toHaveBeenCalled();
        expect(initInterpreter).toHaveBeenCalledTimes(1);
        expect(mockStart).toHaveBeenCalledTimes(1);
    });

    it('Should initilise interpreter when injectMachineOptions is called by hosted component', () => {
        const component = React.createElement(connectStateMachine(HostedComponentInjector, interpreter));
        mount(component);
        expect(mockWithConfig).toHaveBeenCalledWith({ actions: {} });
        expect(mockWithConfig).toHaveBeenCalledTimes(1);
        expect(mockStart).toHaveBeenCalledTimes(1);
    });

    it('Should stop interpreter on unmount', () => {
        const component = React.createElement(connectStateMachine(HostedComponent, interpreter));
        const instance = shallow(component);
        instance.unmount();
        expect(mockStop).toHaveBeenCalledTimes(1);
    });
})