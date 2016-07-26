import { default as _getFileMeta } from './lib/filemeta';
import { default as copyFile } from './lib/copy';
import errors from './errors';
import config from './config';
import stackTrace from 'stack-trace';
import path from 'path';

const tags = [
    'path',
    'name',
    'hash',
    'ext'
];

function _copy(asset, opts = {}) {
    let fileMeta;
    if (typeof asset === 'string') {
        const trace = stackTrace.get().find((elem) => elem.getFileName() !== __filename);
        fileMeta = _getFileMeta(
            path.dirname(trace.getFileName()),
            asset,
            opts
        );
    } else {
        fileMeta = asset;
    }

    return copyFile(
        fileMeta.absolutePath,
        () => {
            return fileMeta.resultAbsolutePath;
        },
        contents => {
            fileMeta.contents = contents;
            fileMeta.hash = opts.hashFunction(contents);
            let tpl = opts.template;
            if (typeof tpl === 'function') {
                tpl = tpl(fileMeta);
            } else {
                tags.forEach(tag => {
                    tpl = tpl.replace(
                        '[' + tag + ']',
                        fileMeta[tag] || opts[tag]
                    );
                });
            }

            fileMeta.resultAbsolutePath = path.resolve(opts.dest, tpl);

            return Promise.resolve(
                opts.transform(fileMeta)
            )
            .then(transformed => {
                fileMeta = transformed || {};
                return fileMeta.contents;
            });
        }
    )
    .then(() => {
        const relativePath = opts.relativePath(
            fileMeta,
            opts
        );

        return {
            hash: fileMeta.hash,
            original: {
                fullName: fileMeta.fullName,
                name: fileMeta.name,
                ext: fileMeta.ext,
                path: fileMeta.path,
                extra: fileMeta.extra
            },
            path: path.relative(
                relativePath,
                fileMeta.resultAbsolutePath
            ).split('\\').join('/') + fileMeta.extra
        };
    });
}

/**
 * copy function
 * @param  {string|fileMeta} [asset]    the asset path or a fileMeta
 * @param  {object}          [options]  options for the copy process
 * @return {promise|copyInstance} return a promise or a copyInstance
 */
function copy(...args) {
    if (args.length === 0) {
        throw new Error(errors.minimalArgs);
    }

    if (args.length === 2 || typeof args[0] === 'string' || typeof args[0] === 'object' && args[0].filename) {
        // the best case: always redefine (Object.assign again) the options
        return new Promise(() => {
            return  _copy(args[0], config(args.length === 2 ? args[1] : {}));
        });
    }

    const opts = config(args[0]);
    const copyInstance = function copyInstance(asset) {
        return new Promise(() => {
            return  _copy(asset, opts);
        });
    };
    copyInstance.getFileMeta = function getFileMeta(dirname, asset) {
        return _getFileMeta(dirname, asset, opts);
    };
    return copyInstance;
}

copy.getFileMeta = function getFileMeta(dirname, asset, opts) {
    return _getFileMeta(dirname, asset, config(opts));
};

export default copy;
