import { StateMachineAction } from 'src/lib';
import { omit } from 'lodash';
import { fakeAJAX } from '../mocks/ajax';
import { TestComponentState } from '../types/test-types';

export async function fetchData(e: StateMachineAction<TestComponentState>) {
    const params = omit(e, 'type');
    let items: string[] = [];
    try {
        items = await fakeAJAX(params);
        return { items };
    } catch (e) {
        throw new Error('Something Wrong');
    }
}
