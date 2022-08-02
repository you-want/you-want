#!/usr/bin/env node

// commander负责读取命令
const program = require('commander')
// 改变命令行输出样式
const chalk = require('chalk')

const init = require('../lib/init')
const version = require('../package.json').version

// 解析命令
program.version(version, '-v, --version')
    .command('init <name> [type]')
    .action((name, type) => {
        if (!name) {
            console.log(chalk.red('init必须配置name值'));
            process.exit()
        }
        init({
            name: name,
            type: type
        })
    })
program.parse(process.argv)