import { hello } from './hello';

hello();

const a = async () => {
    await $`echo "HELLO WORLD"`;
};

a();
