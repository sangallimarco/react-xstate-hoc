import { MachineConfig } from 'xstate';

export enum TestChildStates {
    START = 'START',
    END = 'END'
}

export enum TestChildActions {
    STOP = 'STOP',
    DEFAULT = 'DEFAULT'
}

export interface TestChildMachineStateSchema {
    states: {
        [TestChildStates.START]: {};
        [TestChildStates.END]: {};
    }
}

export type TestChildMachineEvents =
    | { type: TestChildActions.STOP }
    | { type: TestChildActions.DEFAULT };

export const STATE_CHART: MachineConfig<{}, TestChildMachineStateSchema, TestChildMachineEvents> = {
    initial: TestChildStates.START,
    states: {
        [TestChildStates.START]: {
            on: {
                [TestChildActions.STOP]: {
                    target: TestChildStates.END
                }
            }
        },
        [TestChildStates.END]: {
        }
    }
};

export interface TestChildComponentState {
    enabled: boolean;
}

export const INITIAL_STATE: TestChildComponentState = {
    enabled: true
};