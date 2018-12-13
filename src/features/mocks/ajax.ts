import { values, keys } from 'lodash';

export function fakeAJAX(params: Record<string, string | number | boolean>) {
    return new Promise<string[]>((resolve, reject) => setTimeout(() => {
        const rnd = Math.random();
        if (rnd > 0.5) {
            reject();
        } else {
            resolve(['ok', ...keys(params), ...values(params).map(v => v.toString())]);
        }
    }, 1000)
    );
}