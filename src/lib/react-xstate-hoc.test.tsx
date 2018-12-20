import * as React from 'react'
import { withStateMachine } from './react-xstate-hoc';
import { StateMachineInjectedProps } from './types';
import { shallow, mount } from 'enzyme';
import { MachineConfig, EventObject } from 'xstate';

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
        onChange: jest.fn(),
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
    | { type: 'DEFAULT' };


interface HostedComponentProps extends StateMachineInjectedProps<{}, HostedComponentSchema, HostedComponentEvents> {
}

class HostedComponent extends React.Component<HostedComponentProps> {
    render() {
        return <div />;
    }
}

class HostedComponentInjector extends React.Component<HostedComponentProps> {
    constructor(props: any) {
        super(props);
        const { injectMachineOptions } = this.props;
        injectMachineOptions({ actions: {} });
    }

    render() {
        return <div />;
    }
}

describe('ReactXstateHoc', () => {
    beforeEach(() => {
        mockStart = jest.fn();
        mockStop = jest.fn();
        mockWithConfig = jest.fn();
    });

    it('Should not initilise interpreter when render called', () => {
        const component = React.createElement(withStateMachine(HostedComponent, machineMock, {}));
        const instance = mount(component).instance() as any; // should be a type here
        const initInterpreter = jest.spyOn(instance, 'initInterpreter');
        instance.forceUpdate();
        expect(mockWithConfig).not.toHaveBeenCalled();
        expect(initInterpreter).not.toHaveBeenCalled();
        expect(mockStart).toHaveBeenCalledTimes(1);
    });

    it('Should not initilise interpreter on mount', () => {
        const component = React.createElement(withStateMachine(HostedComponent, machineMock, {}));
        const instance = mount(component).instance() as any; // should be a type here
        const initInterpreter = jest.spyOn(instance, 'initInterpreter');
        instance.componentDidMount();
        expect(mockWithConfig).not.toHaveBeenCalled();
        expect(initInterpreter).toHaveBeenCalled();
        expect(mockStart).toHaveBeenCalledTimes(1);
    });

    it('Should initilise interpreter when option passed', () => {
        const component = React.createElement(withStateMachine(HostedComponentInjector, machineMock, {}));
        mount(component);
        expect(mockWithConfig).toHaveBeenCalledWith({ actions: {} });
        expect(mockWithConfig).toHaveBeenCalledTimes(1);
    });

    it('Should stop interpreter on unmount', () => {
        const component = React.createElement(withStateMachine(HostedComponent, machineMock, {}));
        const instance = shallow(component);
        instance.unmount();
        expect(mockStop).toHaveBeenCalledTimes(1);
    });
})