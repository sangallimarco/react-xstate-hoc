import { MachineConfig } from 'xstate';

export interface TestChildMachineStateSchema {
    states: {
        START: {};
        END: {};
    }
}

export type TestChildMachineEvents =
    | { type: 'STOP' }
    | { type: 'DEFAULT' };

export const STATE_CHART: MachineConfig<{}, TestChildMachineStateSchema, TestChildMachineEvents> = {
    initial: 'START',
    states: {
        START: {
            on: {
                STOP: {
                    target: 'END'
                }
            }
        },
        END: {
        }
    }
};

export interface TestChildComponentState {
    enabled: boolean;
}

export const MACHINE_OPTIONS = {
};

export const INITIAL_STATE: TestChildComponentState = {
    enabled: true
};