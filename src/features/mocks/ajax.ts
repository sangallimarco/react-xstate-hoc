import { Dictionary } from 'lodash';

export function fakeAJAX(params: Dictionary<string | number | boolean>) {
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