import * as flattern from 'flat';
import { StateValue } from 'xstate';
import { isString } from 'util';

export function normaliseStateName(params: StateValue): string {
    if (isString(params)) {
        return params;
    }
    const flat = flattern(params);
    return Object.keys(flat).map(k => `${k}.${flat[k]}`).join('');
}
