import chalk from 'chalk';
import logSymbols from 'log-symbols';

export default {
    error: message => {
        console.error(chalk` {red ${logSymbols.error}} ${message}`);
    },
    info: message => {
        console.log(chalk` {blue ${logSymbols.info}} ${message}`);
    },
    warning: message => {
        console.log(chalk` {yellow ${logSymbols.warning}} ${message}`);
    },
    success: message => {
        console.log(chalk` {green ${logSymbols.success}} ${message}`);
    },
};
