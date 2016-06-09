import getFileMeta from './lib/filemeta';
import { default as copyFile } from './lib/copy';
import config from './config';
import stack from 'callsite';
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
        fileMeta = getFileMeta(
            path.dirname(stack()[2].getFileName()),
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

export default function copy(...args) {
    if (args.length === 0) {
        throw new Error('asset or options parameter not found.');
    }

    if (args.length === 2) {
        // the best case: always redefine (Object.assign again) the options
        return _copy(args[0], config(args[1]));
    }

    if (typeof args[0] === 'string' ||
        (typeof args[0] === 'object' && args[0].filename)) {
        return _copy(args[0], config());
    }

    const opts = config(args[0]);
    return function copyInstance(asset) {
        return _copy(asset, opts);
    };
}
