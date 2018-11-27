import { StateMachineAction, } from '../../lib';

export const MachineState = {
    START: 'START',
    END: 'END'
}

export const MachineAction = {
    RESET: 'RESET'
}

export const STATE_CHART = {
    initial: MachineState.START,
    states: {
        [MachineState.START]: {
            on: {
                SUBMIT: {
                    target: MachineState.END
                }
            },
            onEntry: 'resetContext'
        },
        [MachineState.END]: {
            on: {
                [MachineAction.RESET]: MachineState.START
            },
            onEntry: 'resetContext'
        }
    }
};

export interface TestChildComponentState {
    enabled: boolean;
}

// @TODO fix those
export const MACHINE_OPTIONS = {
    actions: {
    },
    guards: {
    }
};

// onEnter actions
export const ON_ENTER_STATE_ACTIONS: StateMachineAction<TestChildComponentState> = new Map();

export const INITIAL_STATE: TestChildComponentState = {
    enabled: true
};