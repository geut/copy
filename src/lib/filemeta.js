import url from 'url';
import path from 'path';

/**
 * Helper function that reads the file ang get some helpful information
 * to the copy process.
 *
 * @param  {string} dirname path of the read file css
 * @param  {string} value url
 * @param  {Object} opts plugin options
 * @return {Promise} resolve => fileMeta | reject => error message
 */
export default function getFileMeta(dirname, value, opts) {
    const parsedUrl = url.parse(value, true);
    const filename = parsedUrl.pathname;
    const pathname = path.resolve(dirname, filename);
    const params = parsedUrl.search || '';
    const hash = parsedUrl.hash || '';

    // path between the basePath and the filename
    const src = opts.src.filter(item => pathname.indexOf(item) !== -1)[0];
    if (!src) {
        throw Error(`"src" not found in ${pathname}`);
    }

    const ext = path.extname(pathname);
    const fileMeta = {
        sourceInputFile: dirname, // path to the origin CSS file
        sourceValue: value,
        filename,
        // the absolute path without the #hash param and ?query
        absolutePath: pathname,
        fullName: path.basename(pathname),
        path: path.relative(src, path.dirname(pathname)),
        // name without extension
        name: path.basename(pathname, ext),
        // extension without the '.'
        ext: ext.slice(1),
        query: params + hash,
        qparams: params.length > 0 ? params.slice(1) : '',
        qhash: hash.length > 0 ? hash.slice(1) : '',
        src
    };

    return fileMeta;
}
