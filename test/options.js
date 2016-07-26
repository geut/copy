import test from 'ava';
import copy from '../src';
import errors from '../src/errors';

test('should throw an error if the default arguments (asset and/or options) are not passed.', t => {
    return t.throws(() => {
        copy();
    });
});

test('should throw an error if the "src" option is not setted', t => {
    return copy('fixtures/text1.txt')
    .catch(err => {
        t.is(err.message, errors.srcRequired);
    });
});

test('should throw an error if the "dest" option is not setted', t => {
    return copy('fixtures/text1.txt', {
        src: 'fixtures'
    })
    .catch(err => {
        t.is(err.message, errors.destRequired);
    });
});

test('should return a copyInstance only if the options argument is passed', t => {
    const object = copy({
        src: 'fixtures',
        dest: 'dest'
    });

    t.is(object.name, 'copyInstance');
});

test('should return a promise if the asset argument is passed', t => {
    const object = copy('fixtures/text1.txt', {
        src: 'fixtures',
        dest: 'dest'
    });
    t.true(typeof object.then === 'function');
});
