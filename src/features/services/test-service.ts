import { fakeAJAX } from '../mocks/ajax';

export async function fetchData(label: string) {
    let items: string[] = [];
    try {
        items = await fakeAJAX({ label });
        return { items };
    } catch (e) {
        throw new Error('Something Wrong');
    }
}
