import { Action } from '../state-machine-component';

const MachineState = {
    START: 'START',
    PROCESSING: 'PROCESSING',
    LIST: 'LIST',
    END: 'END'
}

export const MachineAction = {
    SUBMIT: 'SUBMIT',
    CANCEL: 'CANCEL',
    AUTO: 'AUTO'
}

export const STATE_CHART = {
    initial: MachineState.START,
    states: {
        [MachineState.START]: {
            on: {
                [MachineAction.SUBMIT]: {
                    target: MachineState.PROCESSING,
                    actions: [
                    ]
                }
            }
        },
        [MachineState.PROCESSING]: {
            on: {
                [MachineAction.AUTO]: {
                    target: MachineState.LIST,
                    actions: []
                }
            }
        },
        [MachineState.LIST]: {
            on: {
                [MachineAction.CANCEL]: {
                    target: MachineState.START
                }
            }
        }
    }
}

// test only 
function fakeAJAX() {
    return new Promise<string[]>(resolve => setTimeout(() => {
        resolve(['ok']);
    }, 2000)
    );
}

export interface TestComponentState {
    items: string[];
}

export const STATE_ACTIONS: Action<TestComponentState> = new Map([
    [
        MachineState.PROCESSING,
        async () => {
            const res = await fakeAJAX();
            return {
                data: { items: res },
                actionName: MachineAction.AUTO
            };
        }
    ]
]);

export const INITIAL_STATE: TestComponentState = {
    items: []
}