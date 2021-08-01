import isUrl from 'is-url';
import { argv } from 'zx';

import { printHelp } from './printHelp';
import { printVersion } from './printVersion';
import { runScriptFromUrl } from './runScriptFromUrl';
import { runScriptInFile } from './runScriptInFile';

export const main = async () => {
    if (argv.version || argv.V) {
        printVersion();
    }

    if (argv.help || argv.h) {
        printHelp();
    }

    if (argv._.length > 1) {
        console.log('Cannot execute multiple scripts at once');
        process.exit(1);
    }

    const script = argv._[0];

    if (isUrl(script)) {
        runScriptFromUrl(script);
    } else if (script !== undefined) {
        runScriptInFile(script);
    }
};
