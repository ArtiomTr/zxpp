import { readFile, realpath } from 'fs/promises';
import { createRequire } from 'module';
import { dirname, extname, parse, resolve, sep } from 'path';
import { pathToFileURL } from 'url';

import NodeResolveRaw from '@esbuild-plugins/node-resolve';
import esbuild from 'esbuild';
import { fs } from 'zx';

const NodeResolve = (NodeResolveRaw as unknown as { default: typeof NodeResolveRaw }).default;

const extensionToLoader: Record<string, esbuild.Loader> = {
    '.js': 'js',
    '.cjs': 'js',
    '.jsx': 'jsx',
    '.ts': 'ts',
    '.tsx': 'tsx',
};

export const runScriptInFile = async (path: string) => {
    const { name: targetFilename, dir: targetDirectory, ext } = parse(path);
    const resultFilename = resolve(targetDirectory, `${targetFilename}.mjs`);

    if (ext !== '.mjs') {
        path = await realpath(resolve(path));

        const nodeModulesFolder = 'node_modules';

        const mainFolder = path.includes(nodeModulesFolder)
            ? path.substring(0, path.indexOf(sep, path.indexOf(nodeModulesFolder) + nodeModulesFolder.length + 1))
            : undefined;

        await esbuild.build({
            bundle: true,
            outfile: resultFilename,
            stdin: {
                contents: (await readFile(path)).toString(),
                loader: extensionToLoader[extname(path)] ?? 'ts',
                resolveDir: dirname(path),
                sourcefile: path,
            },
            platform: 'node',
            format: 'esm',
            plugins: [
                NodeResolve({
                    extensions: ['.ts', '.js'],
                    onResolved: (resolved) => {
                        if (resolved.includes('node_modules') && (!mainFolder || !resolved.includes(mainFolder))) {
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
        await fs.rm(resultFilename);
    }
};
