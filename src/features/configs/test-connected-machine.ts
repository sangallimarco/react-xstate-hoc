import { assign } from 'xstate/lib/actions';
import { MachineConfig, Machine, interpret } from 'xstate';
import { StateMachineAction } from '../../lib';

export interface TestConnectedComponentState {
    cnt: number;
}

export const INITIAL_STATE: TestConnectedComponentState = {
    cnt: 0
};

export enum TestConnectedMachineState {
    START = 'START',
    LIST = 'LIST'
}

export enum TestConnectedMachineAction {
    SUBMIT = 'SUBMIT',
    RESET = 'RESET'
}

export interface TestConnectedMachineStateSchema {
    states: {
        [TestConnectedMachineState.START]: {};
        [TestConnectedMachineState.LIST]: {};
    }
}

export type TestConnectedMachineEvent =
    | { type: TestConnectedMachineAction.SUBMIT, cnt: number }
    | { type: TestConnectedMachineAction.RESET }
    ;

export type TestConnectedMachineEventType = StateMachineAction<TestConnectedComponentState>;

export enum TestConnectedMachineService {
    FETCH_DATA = 'FETCH_DATA'
}

export const STATE_CHART: MachineConfig<TestConnectedComponentState, TestConnectedMachineStateSchema, TestConnectedMachineEvent> = {
    id: 'test',
    initial: TestConnectedMachineState.START,
    states: {
        [TestConnectedMachineState.START]: {
            on: {
                [TestConnectedMachineAction.SUBMIT]: {
                    target: TestConnectedMachineState.LIST,
                    actions: assign((ctx, e) => ({
                        cnt: ctx.cnt + e.cnt
                    }))
                }
            }
        },
        [TestConnectedMachineState.LIST]: {
            on: {
                [TestConnectedMachineAction.RESET]: {
                    target: TestConnectedMachineState.START
                }
            }
        }
    }
};

const TestConnectedMachine = Machine(STATE_CHART, {}, { cnt: 0 });

// export intepreter as shared resource
export const TestConnectedInterpreter = interpret(TestConnectedMachine).start();

