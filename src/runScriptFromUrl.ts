import { tmpdir } from 'os';
import { basename, join } from 'path';

import { fetch, fs } from 'zx';

import { runScriptInFile } from './runScriptInFile';

export const runScriptFromUrl = async (url: string) => {
    const response = await fetch(url);

    const script = await response.text();

    const filename = basename(url);
    const dir = await fs.mkdtemp(join(tmpdir(), filename));

    const fullPath = join(dir, filename);

    await fs.writeFile(fullPath, script);

    await runScriptInFile(fullPath);
};
