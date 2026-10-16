
const express = require('express');
const cors = require('cors');
const conexao = require('./conexao');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API do Estoque Doméstico funcionando!');
});

app.get('/produtos', (req, res) => {
  conexao.query('SELECT * FROM produtos', (erro, resultado) => {
    if (erro) {
      return res.status(500).json({ erro: erro.message });
    }

    res.json(resultado);
  });
});

app.post('/produtos', (req, res) => {
  const { nome, quantidade, validade } = req.body;

  const sql = 'INSERT INTO produtos (nome, quantidade, validade) VALUES (?, ?, ?)';

  conexao.query(sql, [nome, quantidade, validade], (erro, resultado) => {
    if (erro) {
      return res.status(500).json({ erro: erro.message });
    }

    res.status(201).json({
      mensagem: 'Produto cadastrado!',
      id: resultado.insertId
    });
  });
});


app.put('/produtos/:id', (req, res) => {
  const { id } = req.params;
  const { nome, quantidade, validade } = req.body;

  const sql = 'UPDATE produtos SET nome = ?, quantidade = ?, validade = ? WHERE id = ?';

  conexao.query(sql, [nome, quantidade, validade, id], (erro, resultado) => {
    if (erro) {
      return res.status(500).json({ erro: erro.message });
    }

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }

    res.json({ mensagem: 'Produto atualizado com sucesso!' });
  });
});



app.delete('/produtos/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM produtos WHERE id = ?';

  conexao.query(sql, [id], (erro, resultado) => {
    if (erro) {
      return res.status(500).json({ erro: erro.message });
    }

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado' });
    }

    res.json({ mensagem: 'Produto excluído com sucesso!' });
  });
});

app.listen(3000, () => {
  console.log('Servidor funcionando na porta 3000!');
});
