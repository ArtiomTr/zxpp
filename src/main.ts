import isUrl from 'is-url';
import { argv } from 'zx';

import { printHelp } from './printHelp';
import { printVersion } from './printVersion';
import { runScriptFromUrl } from './runScriptFromUrl';
import { runScriptInFile } from './runScriptInFile';

export const main = async () => {
    if (argv.debug) {
        console.log('Running zxpp with arguments:', argv, process.argv);
    }
    const firstArgument = process.argv[2];

    if (firstArgument === undefined || firstArgument[0] === '-') {
        if (argv.version || argv.V) {
            printVersion();
        }

        if (argv.help || argv.h) {
            printHelp();
        }
    }

    const script = argv._[0];

    if (isUrl(script)) {
        runScriptFromUrl(script);
    } else if (script !== undefined) {
        runScriptInFile(script);
    } else {
        throw new Error('Invalid usage. Specify --help flag to see correct usage');
    }
};
