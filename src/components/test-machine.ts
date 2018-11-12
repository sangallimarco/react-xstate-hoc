import { Action } from '../state-machine-component';
import { Dictionary } from 'lodash';

export const MachineState = {
    START: 'START',
    PROCESSING: 'PROCESSING',
    LIST: 'LIST',
    ERROR: 'ERROR',
    END: 'END'
}

export const MachineAction = {
    SUBMIT: 'SUBMIT',
    CANCEL: 'CANCEL',
    PROCESSED: 'PROCESSED',
    ERROR: 'ERROR',
    RESET: 'RESET',
    NONE: 'NONE'
}

// this can be visualised here: https://musing-rosalind-2ce8e7.netlify.com/?machine=%7B%22initial%22%3A%22START%22%2C%22states%22%3A%7B%22START%22%3A%7B%22on%22%3A%7B%22SUBMIT%22%3A%22PROCESSING%22%7D%7D%2C%22PROCESSING%22%3A%7B%22on%22%3A%7B%22PROCESSED%22%3A%22LIST%22%2C%22ERROR%22%3A%22ERROR%22%7D%7D%2C%22LIST%22%3A%7B%22on%22%3A%7B%22RESET%22%3A%22START%22%7D%7D%2C%22ERROR%22%3A%7B%22on%22%3A%7B%22RESET%22%3A%22START%22%7D%7D%7D%7D

export const STATE_CHART = {
    initial: 'START',
    states: {
        START: {
            on: {
                SUBMIT: 'PROCESSING'
            }
        },
        PROCESSING: {
            on: {
                PROCESSED: 'LIST',
                ERROR: 'ERROR'
            }
        },
        LIST: {
            on: {
                RESET: 'START',
                SELECT: 'SHOW_ITEM'
            }
        },
        SHOW_ITEM: {
            on: {
                EXIT: 'LIST'
            }
        },
        ERROR: {
            on: {
                RESET: 'START'
            }
        }
    }
};

// test only 
function fakeAJAX(params: Dictionary<string | number | boolean>) {
    return new Promise<string[]>(resolve => setTimeout(() => {
        resolve(['ok', ...Object.keys(params)]);
    }, 2000)
    );
}

export interface TestComponentState {
    items: string[];
    terms: string;
}


// onEnter actions
export const ON_ENTER_STATE_ACTIONS: Action<TestComponentState> = new Map([
    [
        MachineState.PROCESSING,
        async (params: Dictionary<string | number | boolean>) => {
            const res = await fakeAJAX(params);
            return {
                data: { items: res },
                triggerAction: MachineAction.PROCESSED
            };
        }
    ],
    [
        MachineState.START,
        async () => {
            return {
                data: { items: [] },
                triggerAction: MachineAction.NONE
            };
        }
    ]
]);

export const INITIAL_STATE: TestComponentState = {
    items: [],
    terms: ''
}