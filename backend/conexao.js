const mysql = require('mysql2');

const conexao = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'admin',
  database: 'estoque_domestico'
});

conexao.connect((erro) => {
  if (erro) {
    console.log('Erro ao conectar:', erro.message);
  } else {
    console.log('Conectado ao MySQL!');
  }
});

module.exports = conexao;