import meow from 'meow';
import log from '../utils/log';
import Jonathan from '../bootstrap/jonathan';

const cli = meow(
    `
    USAGE:

    $ yarn create @filipekiss/webpack-sass
        `,
    {
        autoVersion: false,
    }
);

const projectPath = cli.input[0];

if (cli.flags.version) {
    console.log(` ${cli.pkg.name}`);
    log.info(` Version: ${cli.pkg.version}`);
    process.exit(0);
}

try {
    const cwd = process.cwd();
    const builder = new Jonathan(projectPath, cli.flags);
    builder.makeProject(projectPath, cwd);
} catch (err) {
    log.error(err.message);
    process.exit(1);
}
