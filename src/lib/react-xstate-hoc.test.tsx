import * as React from 'react'
import { withStateMachine } from './react-xstate-hoc';
import { StateMachineInjectedProps } from './types';
import { shallow } from 'enzyme';
import { MachineConfig, EventObject } from 'xstate';

jest.mock('xstate', () => ({
    Machine: () => ({
        initialState: {
            value: 'a'
        },
        withConfig: jest.fn()
    })
}));

let mockStart = jest.fn();
jest.mock('xstate/lib/interpreter', () => ({
    interpret: () => ({
        start: mockStart,
        stop: jest.fn(),
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
}

describe('ReactXstateHoc', () => {
    beforeEach(() => {
        mockStart = jest.fn();
    });

    it('Should initilise interpreter when render called', () => {
        const component = React.createElement(withStateMachine(HostedComponent, machineMock, {}));
        const instance = shallow(component).instance() as any; // should be a type here
        const spy = jest.spyOn(instance, 'initInterpreter');
        expect(mockStart).toHaveBeenCalled();
        instance.render();
        expect(spy).toHaveBeenCalled();
        expect(mockStart).toHaveBeenCalledTimes(1);
    });

    it('Should initilise interpreter when option passed', () => {
        const component = React.createElement(withStateMachine(HostedComponent, machineMock, {}));
        const instance = shallow(component).instance() as any; // should be a type here
        const spy = jest.spyOn(instance, 'initInterpreter');
        instance.setMachineOptions({});
        expect(spy).toHaveBeenCalled();
        expect(mockStart).toHaveBeenCalledTimes(1);
    });
})