import test from 'ava';
import copy from '../src';
import errors from '../src/errors';
import path from 'path';

test('should throw an error if the default arguments (asset and/or options) are not passed.', t => {
    return t.throws(copy);
});

test('should throw an error if the "src" option is not setted', t => {
    return t.throws(() => copy('fixtures/text1.txt'), errors.srcRequired());
});


test('should throw an error if the "dest" option is not setted', t => {
    return t.throws(() => copy('fixtures/text1.txt', { src: 'fixtures' }), errors.destRequired());
});

test('should throw an error if the "src" and "dest" are setted but the "src" is not corresponding with the asset path', t => {
    return t.throws(() => {
        return copy('fixtures/text1.txt', {
            src: 'different-path',
            dest: 'dest'
        });
    }, errors.srcNotFound(path.resolve('fixtures/text1.txt')));
});

test('should return a copyInstance only if the options argument is passed', t => {
    const object = copy({
        src: 'fixtures',
        dest: 'dest'
    });

    t.is(object.name, 'copyInstance');
});

test('should work with a package.json options (object options)', t => {
    const object = copy({
        pkgLookUp: './fixtures/pkg-options',
        dest: 'dest'
    });

    t.true(path.basename(object.opts.src[0]) === 'other-src');
});

test('should work with a package.json options (extended from a file)', t => {
    const object = copy({
        pkgLookUp: './fixtures/pkg-extend',
        dest: 'dest'
    });

    t.true(path.basename(object.opts.src[0]) === 'other-src');
});
