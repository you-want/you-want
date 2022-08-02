// 动画效果 一个优雅地命令行交互spinner
const ora = require('ora')
// 问题交互 inquirer负责问询
const inquirer = require('inquirer')
// 字体加颜色 改变命令行输出样式
const chalk = require('chalk')
// 为各种日志级别提供着色的符号
const symbols = require('log-symbols')
const fs = require('fs')

const vue3cloudAdmin = require('./vue3-cloud-admin')
const complexWebpack = require('./complex-webpack')

module.exports = function (params) {
    if (fs.existsSync(params.name)) {
        console.log(symbols.error, chalk.red('项目生成失败, 项目已存在'));
        process.exit()
    }
    // 问询
    inquirer.prompt([{
        type: "list",
        name: 'clitype',
        message: '请选择一种模板构建',
        suffix: '\n以下为模板简单介绍\n<1>vue3+AntD模板；\n<2>其他模版，暂不支持，敬请期待；',
        choices: [
            "1）vue3 + vite + AntD 版本",
            "2）其他模板",
        ],
    }]).then((answers) => {
        if (answers.clitype === '1）vue3 + vite + AntD 版本') {
            vue3cloudAdmin(params)
        }
        if (answers.clitype === '2）其他模板') {
            console.info('其他模板，暂时不支持，敬请期待');
            return;
            inquirer.prompt([{
                type: "list",
                name: 'clitlang',
                message: '请选择基础语言框架',
                suffix: '\n包含vue-cli/create-react-app的内容，在此基础上做的定制，请知悉\n',
                choices: [
                    "1）Vue",
                    "2）React"
                ],
            }]).then((answers) => {
                const compileType = {
                    '1）Vue': 'vue',
                    '2）React': 'react'
                }
                complexWebpack(params, compileType[answers.clitlang])
            })
        }
    })
}
