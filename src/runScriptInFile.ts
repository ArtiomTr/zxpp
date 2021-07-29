import { createRequire } from 'module';
import { dirname, parse, resolve } from 'path';
import { pathToFileURL } from 'url';

import NodeResolveRaw from '@esbuild-plugins/node-resolve';
import esbuild from 'esbuild';
import { fs } from 'zx';

const NodeResolve = (NodeResolveRaw as unknown as { default: typeof NodeResolveRaw }).default;

export const runScriptInFile = async (path: string) => {
    const { name: targetFilename, dir: targetDirectory, ext } = parse(path);
    const resultFilename = resolve(targetDirectory, `${targetFilename}.mjs`);

    if (ext !== '.mjs') {
        await esbuild.build({
            entryPoints: [path],
            bundle: true,
            outfile: resultFilename,
            platform: 'node',
            format: 'esm',
            plugins: [
                NodeResolve({
                    extensions: ['.ts', '.js'],
                    onResolved: (resolved) => {
                        if (resolved.includes('node_modules')) {
                            return {
                                external: true,
                            };
                        }
                        return resolved;
                    },
                }),
            ],
        });
    }

    const savedContext = {
        __dirname: global.__dirname ?? undefined,
        __filename: global.__filename ?? undefined,
        require: global.require ?? undefined,
    };

    try {
        const newFilename = resolve(path);

        Object.assign(global, {
            __filename: newFilename,
            __dirname: dirname(newFilename),
            require: createRequire(newFilename),
        });

        await import(pathToFileURL(resultFilename).toString());
    } catch (err) {
        console.error(err);
    } finally {
        Object.assign(global, savedContext);
    }

    await fs.rm(resultFilename);
};
