import { StateMachineAction, StateMachineOnEntryAction } from '../../lib';
import { Dictionary } from 'lodash';
// import { assign } from 'xstate/lib/actions';

// https://statecharts.github.io/xstate-viz/

export const MachineState = {
    START: 'START',
    PROCESSING: 'PROCESSING',
    LIST: 'LIST',
    ERROR: 'ERROR',
    SHOW_ITEM: 'SHOW_ITEM',
    END: 'END'
}

export const MachineAction = {
    SUBMIT: 'SUBMIT',
    CANCEL: 'CANCEL',
    PROCESSED: 'PROCESSED',
    ERROR: 'ERROR',
    RESET: 'RESET',
    NONE: 'NONE',
    SELECT: 'SELECT',
    EXIT: 'EXIT'
}

export const STATE_CHART = {
    initial: 'START',
    states: {
        [MachineState.START]: {
            on: {
                [MachineAction.SUBMIT]: {
                    target: MachineState.PROCESSING,
                    cond: 'checkStart'
                }
            },
            onEntry: 'resetContext'
        },
        [MachineState.PROCESSING]: {
            on: {
                [MachineAction.PROCESSED]: {
                    target: MachineState.LIST,
                    actions: 'updateList'
                },
                [MachineAction.ERROR]: MachineState.ERROR
            }
        },
        [MachineState.LIST]: {
            on: {
                [MachineAction.RESET]: MachineState.START,
                [MachineAction.SELECT]: MachineState.SHOW_ITEM
            }
        },
        [MachineState.SHOW_ITEM]: {
            on: {
                [MachineAction.EXIT]: MachineState.LIST
            }
        },
        [MachineState.ERROR]: {
            on: {
                [MachineAction.RESET]: MachineState.START
            }
        }
    }
};

export interface TestComponentState {
    items: string[];
}

// @TODO fix those
export const MACHINE_OPTIONS = {
    actions: {
        resetContext: (ctx: TestComponentState, e: StateMachineOnEntryAction<TestComponentState>) => {
            Object.assign(ctx, { items: [] });
        },
        updateList: (ctx: TestComponentState, e: StateMachineOnEntryAction<TestComponentState>) => {
            const { data: { items } } = e;
            if (items) {
                Object.assign(ctx, { items });
            }
        }
    },
    guards: {
        checkStart: (ctx: TestComponentState) => {
            return ctx.items.length === 0;
        }
    }
};

// test only 
function fakeAJAX(params: Dictionary<string | number | boolean>) {
    return new Promise<string[]>((resolve, reject) => setTimeout(() => {
        const rnd = Math.random();
        if (rnd > 0.5) {
            reject();
        } else {
            resolve(['ok', ...Object.keys(params)]);
        }
    }, 1000)
    );
}

// onEnter actions
export const ON_ENTER_STATE_ACTIONS: StateMachineAction<TestComponentState> = new Map([
    [
        MachineState.PROCESSING,
        async (params: Dictionary<string | number | boolean>) => {
            let triggerAction = MachineAction.PROCESSED;
            let items: string[] = [];
            try {
                items = await fakeAJAX(params);
            } catch (e) {
                triggerAction = MachineAction.ERROR;
            }
            return {
                data: { items },
                triggerAction // please create an StateMachineAction in state machine in order to change
            };
        }
    ]
]);

export const INITIAL_STATE: TestComponentState = {
    items: []
};