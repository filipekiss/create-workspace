// Node System Imports
import path from 'path';
import os from 'os';
// Node Modules imports
import Listr from 'listr';
import chalk from 'chalk';
import execa from 'execa';
import fs from 'fs-extra';
// Custom Code Imports
import log from '../utils/log';
import workspaceSettings from '../static/workspace';

class Jonathan {
    constructor(projectPath = false, options = {}) {
        if (projectPath) {
            return;
        }
        throw new Error('You need to specify the path to install the project');
    }

    isSafeToCreateProjectIn(root, name) {
        const validFiles = [
            '.DS_Store',
            'Thumbs.db',
            '.git',
            '.gitignore',
            '.idea',
            'README.md',
            'LICENSE',
            'web.iml',
            '.hg',
            '.hgignore',
            '.hgcheck',
            '.npmignore',
            'mkdocs.yml',
            'docs',
            '.travis.yml',
            '.gitlab-ci.yml',
            '.gitattributes',
        ];

        const conflicts = fs
            .readdirSync(root)
            .filter(file => !validFiles.includes(file));

        if (conflicts.length > 0) {
            log.warning(
                `The directory ${chalk.green(
                    name
                )} contains files that could conflict:`
            );
            console.log();
            for (const file of conflicts) {
                console.log(`  ${file}`);
            }
            console.log();

            return false;
        }

        return true;
    }

    makeProject(at, from) {
        const root = path.resolve(at);
        const appName = path.basename(root);

        fs.ensureDirSync(root);

        if (!this.isSafeToCreateProjectIn(root, appName)) {
            throw new Error(
                'Either try using a new directory name, or remove the files listed above.'
            );
        }

        const packageJson = {
            name: appName,
            version: '0.1.0',
            private: true,
        };

        fs.writeFileSync(
            path.join(root, 'package.json'),
            JSON.stringify(
                Object.assign(packageJson, workspaceSettings),
                null,
                2
            ) + os.EOL
        );
        if (!fs.existsSync(`${root}/.git`)) {
            execa.sync('git', ['init'], { cwd: root });
        }
        const installTask = new Listr(
            [
                {
                    title: chalk`Creating Workspace at {green ${root}}`,
                    task: () => {
                        return new Listr([
                            {
                                title: 'Installing dependencies',
                                task: () => {
                                    return execa.stdout('yarnpkg', {
                                        cwd: root,
                                    });
                                },
                            },
                            {
                                title: 'Basic .gitignore',
                                task: () => {
                                    return new Promise((resolve, reject) => {
                                        try {
                                            fs.ensureFileSync(
                                                `${root}/.gitignore`
                                            );

                                            const ignored = Array.from(
                                                fs
                                                    .readFileSync(
                                                        `${root}/.gitignore`,
                                                        'utf8'
                                                    )
                                                    .split('\n')
                                            );

                                            const ignorables = [
                                                'dist',
                                                'node_modules',
                                                'yarn.lock',
                                            ];

                                            const missingIgnorables = ignorables.filter(
                                                ignorable => {
                                                    return !ignored.includes(
                                                        ignorable
                                                    );
                                                }
                                            );

                                            missingIgnorables.forEach(
                                                ignorable => {
                                                    fs.appendFileSync(
                                                        `${root}/.gitignore`,
                                                        ignorable + os.EOL,
                                                        err => {
                                                            if (err) throw err;
                                                        }
                                                    );
                                                }
                                            );
                                            resolve();
                                        } catch (err) {
                                            reject(err);
                                        }
                                    });
                                },
                            },
                            {
                                title: 'Initial Commit!',
                                task: () => {
                                    return new Promise((resolve, reject) => {
                                        try {
                                            execa.sync('git', ['add', '.'], {
                                                cwd: root,
                                            });
                                            execa.sync(
                                                'git',
                                                ['add', '.gitignore'],
                                                {
                                                    cwd: root,
                                                }
                                            );
                                            execa.sync(
                                                'git',
                                                [
                                                    'commit',
                                                    '--no-gpg-sign',
                                                    '--no-verify',
                                                    '--message',
                                                    'Initial Commit :tada:',
                                                ],
                                                { cwd: root }
                                            );
                                            resolve();
                                        } catch (err) {
                                            reject(err);
                                        }
                                    });
                                },
                            },
                        ]);
                    },
                },
                {
                    title: 'Configuring Webpack',
                    task: () => {
                        return fs.copy(
                            `${from}/src/static/webpack.config.babel.js`,
                            `${root}/webpack.config.babel.js`
                        );
                    },
                },
            ],
            {
                concurrent: true,
            }
        );

        installTask.run().then(() => {
            log.success('Done!');
        });
    }
}

export default Jonathan;
