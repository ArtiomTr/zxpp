import { description } from '../package.json';

export const printHelp = () => {
    console.log(`
Usage: zxpp [options] <script>

${description}

Options:
  -V, --version    output the version number
  -h, --help       display help
`);
    process.exit(0);
};
