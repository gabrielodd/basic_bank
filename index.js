// modulos externos
const inquirer = require('inquirer')
const chalk = require('chalk')

const fs = require('fs')
const { parse } = require('path')

operation()

function operation() {
  inquirer.prompt([{
    type: 'list', 
    name: 'action',
    message: 'O que você deseja fazer?',
    choices: [
      'Criar Conta',
      'Consultar Saldo',
      'Depositar',
      'Sacar',
      'Transferir',
      'Sair'
    ]
  }]).then((answer) => {
    const action = answer['action']

    if(action === 'Criar Conta'){
      createAccount()
    } else if(action === 'Depositar') {
      deposit()
    } else if(action === 'Consultar Saldo'){
      getBalance()
    } else if(action === 'Sacar') {
      withdraw()
    } else if(action === 'Transferir') {
      transfer()
    } else if(action === 'Sair'){
      console.log(chalk.bgBlue.black('Até logo!'))
      process.exit()
    }
    console.log(action)
  }).catch((err) => console.log(err))
}

function createAccount() {
  console.log(chalk.bgGreen.black('Criando conta...'))
  console.log(chalk.green('Defina as opções da sua conta a seguir'))
  buildAccount()
}

function buildAccount() {
  inquirer.prompt([
    {
      name: 'accountName',
      message: 'Digite um nome para a sua conta: '
    }
  ]).then(answer => {
    const accountName = answer['accountName']
    console.info(accountName)

    if(!fs.existsSync('accounts')) {
      fs.mkdirSync('accounts')
    }

    if(fs.existsSync(`accounts/${accountName}.json`)) {
      console.log(
        chalk.bgRed.black('Esta conta já existe. Escolha outro nome!'),
      )
      buildAccount()
    }

    fs.writeFileSync(`accounts/${accountName}.json`, '{"balance": 0}', function(err) {
      console.log(err)
    })

    console.log(chalk.green('Conta criada com sucesso!'))
  }).catch((err) => console.log(err))
}

function deposit() {
  inquirer.prompt([
    {
      name: 'accountName',
      message: 'Qual o nome da sua conta?'
    }
  ]).then((answer) => {
    const accountName = answer['accountName']

    if(!checkAccount(accountName)) {
      return deposit()
    }

    inquirer.prompt([
      {
        name: 'amount',
        message: 'Quanto você deseja depositar?'
      },
    ]).then((answer) => {
      const amount = answer['amount']
      addAmount(accountName, amount)
      operation()
    }).catch(err => console.log(err))
  }).catch(err => console.log(err))
}

function checkAccount(accountName) {
  if(!fs.existsSync(`accounts/${accountName}.json`)) {
    console.log(chalk.bgRed.black('Esta conta não existe, Tente novamente.'))
    return false
  }
  return true
}

function addAmount(accountName, amount, transfer = false) {
  const accountData = getAccount(accountName)
  if(!amount) {
    console.log(chalk.bgRed.black('Valor inválido. Tente novamente!'))
    return deposit();
  }
  accountData.balance = parseFloat(amount) + parseFloat(accountData.balance)

  fs.writeFileSync(`accounts/${accountName}.json`,
  JSON.stringify(accountData),
  function(err) {
    console.log(err)
  })

  if(transfer === false){
    console.log(chalk.green(`Foi depositado o valor de R$${amount} na sua conta!`))
  } else {
    console.log(chalk.green(`Foi transferido o valor de R$${amount} para a conta do ${accountName}!`))
  }
}

function getAccount(accountName) {
  const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
    enconding: 'utf8',
    flag: 'r',
  })

  return JSON.parse(accountJSON)
}

function getBalance() {
  inquirer
    .prompt([
      {
        name: 'accountName',
        message: 'Qual o nome da sua conta?',
      },
    ])
    .then((answer) => {
      const accountName = answer['accountName']

      if (!checkAccount(accountName)) {
        return getAccountBalance()
      }

      const accountData = getAccount(accountName)

      console.log(
        chalk.bgBlue.black(
          `O saldo da sua conta é de R$${accountData.balance}`,
        ),
      )
      operation()
    })
}

function withdraw() {
  inquirer
    .prompt([
      {
        name: 'accountName',
        message: 'Qual o nome da sua conta?',
      },
    ])
    .then((answer) => {
      const accountName = answer['accountName']

      if (!checkAccount(accountName)) {
        return withdraw()
      }

      inquirer
        .prompt([
          {
            name: 'amount',
            message: 'Quanto você deseja sacar?',
          },
        ])
        .then((answer) => {
          const amount = answer['amount']

          removeAmount(accountName, amount)
          operation()
        })
    })
}

function removeAmount(accountName, amount) {
  const accountData = getAccount(accountName)

  if (!amount) {
    console.log(
      chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!'),
    )
    return withdraw()
  }

  if (accountData.balance < amount) {
    console.log(chalk.bgRed.black('Valor indisponível!'))
    return withdraw()
  }

  accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    function (err) {
      console.log(err)
    },
  )

  console.log(
    chalk.green(`Foi realizado um saque de R$${amount} da sua conta!`),
  )
}

function transfer() {
  inquirer
    .prompt([
      {
        name: 'accountName',
        message: 'Qual o nome da sua conta?',
      },
      {
        name:'accountName2',
        message: 'Qual o nome da conta que irá transferir'
      }
    ])
    .then((answer) => {
      const accountName = answer['accountName']
      const accountName2 = answer['accountName2']

      if (!checkAccount(accountName)) {
        return transfer()
      }

      if (!checkAccount(accountName2)) {
        return transfer()
      }

      inquirer
        .prompt([
          {
            name: 'amount',
            message: 'Quanto você deseja transferir?',
          },
        ])
        .then((answer) => {
          const amount = answer['amount']

          removeAmount(accountName, amount)
          addAmount(accountName2, amount, true)
          operation()
        })
    })
}
