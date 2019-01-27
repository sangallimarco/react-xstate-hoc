import { normaliseStateName } from '../lib/utils';

describe('Utils', () => {
    it('normalise name', () => {
        const normalised = normaliseStateName({ FOO: 'BAR' });
        expect(normalised).toEqual('FOO.BAR');
    });
});