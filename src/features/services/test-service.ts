import { omit } from 'lodash';
import { fakeAJAX } from '../mocks/ajax';
import { TestMachineEventType } from '../configs/test-machine';

export async function fetchData(e: TestMachineEventType) {
    const params = omit(e, 'type');
    let items: string[] = [];
    try {
        items = await fakeAJAX(params);
        return { items };
    } catch (e) {
        throw new Error('Something Wrong');
    }
}
