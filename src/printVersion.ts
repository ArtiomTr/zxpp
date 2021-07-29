import { version } from '../package.json';

export const printVersion = () => {
    console.log(`🦐 zx++ version ${version}`);

    process.exit(0);
};
