export default {
    minimalArgs() {
        return 'asset and/or options parameter not found.';
    },
    srcRequired() {
        return 'Option `src` is required.';
    },
    destRequired() {
        return 'Option `dest` is required.';
    },
    srcNotFound(pathname) {
        return `"src" not found in ${pathname}`;
    }
};
