// 一个优雅地命令行交互spinner
const ora = require('ora')
// 问题交互 inquirer负责问询
const inquirer = require('inquirer')
// 字体加颜色 改变命令行输出样式
const chalk = require('chalk')
//  为各种日志级别提供着色的符号
const symbols = require('log-symbols')
const shell = require('shelljs')

const download = require('./download')

module.exports = function (params) {
    spinner = ora('\n 开始生成项目，请等待......');
    spinner.start();
    try {
        download('https://github.com/you-want/vue3-cloud-admin', params.name, {
            clone: true,
            type: params.type
        }, (error) => {
            spinner.stop();
            if (error) {
                spinner.fail();
                console.log('项目生成失败......')
                console.log(symbols.error, chalk.red(error));
                process.exit()
            }
            spinner.succeed();
            console.log(`请执行以下命令进行依赖文件安装...... \n`)
            console.log(`cd ${params.name} && pnpm install \n`)
            console.log(symbols.success, chalk.green(`${params.name} 项目生成完毕!`))
            const inquirer = require('inquirer');
            inquirer.prompt([{
                type: 'name',
                name: 'install',
                message: '是否安装项目所需要的依赖文件？',
                default: true
            }]).then((answers) => {
                if (answers.install != 'false' && answers.install != 'N' && answers.install != 'n') {
                    let spinner = ora('安装依赖中.....');
                    spinner.start();
                    shell.exec("cd " + params.name + " && pnpm i", function (err, stdout, stderr) {
                        if (err) {
                            spinner.fail();
                            console.log(symbols.error, chalk.red(err));
                        } else {
                            spinner.succeed();
                            console.log(symbols.success, chalk.green('安装成功'));
                        }
                    })
                }
            })
        })
    } catch (error) {
        console.log('安装失败')
    }
}