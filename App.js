
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView
} from 'react-native';

export default function App() {

  const [produtos, setProdutos] = useState([]);
  const [tela, setTela] = useState('lista');
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [validade, setValidade] = useState('');
  const [idEdicao, setIdEdicao] = useState(null);

  // Cores usadas apenas na interface
  const [cor, setCor] = useState('#dbeafe');
  const [coresProdutos, setCoresProdutos] = useState({});

  const cores = [
    '#dbeafe', // Azul
    '#fce7f3', // Rosa
    '#dcfce7', // Verde
    '#fef3c7', // Amarelo
    '#ede9fe'  // Roxo
  ];

  // READ - Consultar produtos
  async function carregarProdutos() {
    try {
      const resposta = await fetch('http://localhost:3000/produtos');
      const dados = await resposta.json();

      const lista = dados.map((produto) => ({
        ...produto,
        id: String(produto.id),
        quantidade: String(produto.quantidade),
        validade: produto.validade.substring(0, 10)
          .split('-').reverse().join('/')
      }));

      setProdutos(lista);
    } catch (erro) {
      console.log('Erro ao carregar produtos:', erro);
    }
  }

  useEffect(() => {
    carregarProdutos();
  }, []);

  // Abrir cadastro
  function abrirCadastro() {
    setNome('');
    setQuantidade('');
    setValidade('');
    setIdEdicao(null);
    setCor('#dbeafe');
    setTela('cadastro');
  }

  // Abrir edição
  function editarProduto(produto) {
    setNome(produto.nome);
    setQuantidade(produto.quantidade);
    setValidade(produto.validade);
    setIdEdicao(produto.id);
    setCor(coresProdutos[produto.id] || '#dbeafe');
    setTela('cadastro');
  }

  // CREATE e UPDATE - Salvar produto
  async function salvarProduto() {

    if (!nome.trim() || !quantidade.trim() || !validade.trim()) {
      alert('Preencha todos os campos!');
      return;
    }

    if (!/^[1-9]\d*$/.test(quantidade)) {
      alert('Informe uma quantidade inteira maior que zero.');
      return;
    }

    const partes = validade.split('/');
    const dia = Number(partes[0]);
    const mes = Number(partes[1]);
    const ano = Number(partes[2]);
    const data = new Date(ano, mes - 1, dia);

    if (
      !/^\d{2}\/\d{2}\/\d{4}$/.test(validade) ||
      data.getFullYear() !== ano ||
      data.getMonth() !== mes - 1 ||
      data.getDate() !== dia
    ) {
      alert('Informe uma validade válida no formato DD/MM/AAAA.');
      return;
    }

    const validadeBanco =
      `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;

    try {
      const url = idEdicao !== null
        ? `http://localhost:3000/produtos/${idEdicao}`
        : 'http://localhost:3000/produtos';

      const resposta = await fetch(url, {
        method: idEdicao !== null ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nome: nome.trim(),
          quantidade: Number(quantidade),
          validade: validadeBanco
        })
      });

      if (!resposta.ok) {
        throw new Error('Erro ao salvar produto');
      }

      // Guardar a cor apenas no aplicativo
      if (idEdicao !== null) {
        setCoresProdutos({
          ...coresProdutos,
          [idEdicao]: cor
        });
      } else {
        const dados = await resposta.json();

        setCoresProdutos({
          ...coresProdutos,
          [String(dados.id)]: cor
        });
      }

      await carregarProdutos();
      setTela('lista');

    } catch (erro) {
      alert('Erro ao salvar o produto.');
      console.log(erro);
    }
  }

  // DELETE - Excluir produto
  async function excluirProdutoBanco(id) {
    try {
      const resposta = await fetch(
        `http://localhost:3000/produtos/${id}`,
        { method: 'DELETE' }
      );

      if (!resposta.ok) {
        throw new Error('Erro ao excluir produto');
      }

      await carregarProdutos();

    } catch (erro) {
      alert('Erro ao excluir produto.');
      console.log(erro);
    }
  }

  function excluirProduto(id) {
    const confirmar = () => excluirProdutoBanco(id);

    if (typeof window !== 'undefined' && window.confirm) {
      if (window.confirm('Deseja realmente excluir este produto?')) {
        confirmar();
      }
    } else {
      Alert.alert(
        'Excluir produto',
        'Deseja realmente excluir este produto?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Excluir', onPress: confirmar }
        ]
      );
    }
  }

  return (
    <View style={styles.container}>

      {tela === 'lista' ? (
        <>
          {/* Cabeçalho */}
          <View style={styles.cabecalho}>
            <Text style={styles.titulo}>
              Controle de Estoque Doméstico
            </Text>
          </View>

          {/* Lista de produtos */}
          <FlatList
            data={produtos}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.conteudoLista}

            ListHeaderComponent={
              <View style={styles.cabecalhoLista}>
                <Text style={styles.tituloSecao}>
                  Meus produtos
                </Text>

                <TouchableOpacity
                  style={styles.botaoAdicionar}
                  onPress={abrirCadastro}
                >
                  <Text style={styles.textoBotao}>
                    + Adicionar
                  </Text>
                </TouchableOpacity>
              </View>
            }

            ListEmptyComponent={
              <View style={styles.cardVazio}>
                <Text style={styles.textoVazio}>
                  Nenhum produto cadastrado.
                </Text>
                <Text style={styles.textoVazioSecundario}>
                  Adicione seu primeiro produto ao estoque.
                </Text>
              </View>
            }

            renderItem={({ item }) => (
              <View style={styles.card}>

                <View style={styles.linhaProduto}>

                  {/* Letra inicial do produto */}
                  <View
                    style={[
                      styles.iconeProduto,
                      {
                        backgroundColor:
                          coresProdutos[item.id] || '#dbeafe'
                      }
                    ]}
                  >
                    <Text style={styles.textoIcone}>
                      {item.nome.charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  {/* Informações do produto */}
                  <View style={styles.dadosProduto}>
                    <Text style={styles.nome}>
                      {item.nome}
                    </Text>
                    <Text style={styles.validade}>
                      Validade: {item.validade}
                    </Text>
                  </View>

                  {/* Quantidade */}
                  <View style={styles.quantidadeBox}>
                    <Text style={styles.numeroQuantidade}>
                      {item.quantidade}
                    </Text>
                    <Text style={styles.labelQuantidade}>
                      unidades
                    </Text>
                  </View>

                </View>

                <View style={styles.divisor} />

                {/* Botões de editar e excluir */}
                <View style={styles.acoes}>

                  <TouchableOpacity
                    style={styles.botaoEditar}
                    onPress={() => editarProduto(item)}
                  >
                    <Text style={styles.textoEditar}>
                      Editar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.botaoExcluir}
                    onPress={() => excluirProduto(item.id)}
                  >
                    <Text style={styles.textoExcluir}>
                      Excluir
                    </Text>
                  </TouchableOpacity>

                </View>
              </View>
            )}
          />
        </>
      ) : (

        /* Tela de cadastro e edição */
        <ScrollView
          contentContainerStyle={styles.conteudoFormulario}
        >

          <TouchableOpacity
            style={styles.voltar}
            onPress={() => setTela('lista')}
          >
            <Text style={styles.textoVoltar}>
              ← Voltar
            </Text>
          </TouchableOpacity>

          <Text style={styles.tituloFormulario}>
            {idEdicao !== null
              ? 'Editar produto'
              : 'Novo produto'}
          </Text>

          <Text style={styles.subtituloFormulario}>
            Preencha as informações abaixo.
          </Text>

          <View style={styles.cardFormulario}>

            <Text style={styles.label}>
              Nome do produto
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Arroz"
              placeholderTextColor="#a8a29e"
              value={nome}
              onChangeText={setNome}
            />

            <Text style={styles.label}>
              Quantidade
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 5"
              placeholderTextColor="#a8a29e"
              value={quantidade}
              onChangeText={setQuantidade}
              keyboardType="numeric"
            />

            <Text style={styles.label}>
              Data de validade
            </Text>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/AAAA"
              placeholderTextColor="#a8a29e"
              value={validade}
              onChangeText={setValidade}
            />

            {/* Seleção da cor */}
            <Text style={styles.label}>
              Cor do produto
            </Text>

            <View style={styles.listaCores}>
              {cores.map((item) => (
                <TouchableOpacity
                  key={item}
                  onPress={() => setCor(item)}
                  style={[
                    styles.opcaoCor,
                    { backgroundColor: item },
                    cor === item && styles.corSelecionada
                  ]}
                >
                  {cor === item && (
                    <Text style={styles.marcadorCor}>
                      ✓
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Salvar */}
            <TouchableOpacity
              style={styles.botaoSalvar}
              onPress={salvarProduto}
            >
              <Text style={styles.textoBotao}>
                {idEdicao !== null
                  ? 'Salvar alterações'
                  : 'Adicionar produto'}
              </Text>
            </TouchableOpacity>

            {/* Cancelar */}
            <TouchableOpacity
              style={styles.botaoCancelar}
              onPress={() => setTela('lista')}
            >
              <Text style={styles.textoCancelar}>
                Cancelar
              </Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      )}

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#faf8f5',
    paddingTop: 45
  },

  cabecalho: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e7e5e4'
  },

  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#292524'
  },

  conteudoLista: {
    padding: 20,
    paddingBottom: 35
  },

  cabecalhoLista: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20
  },

  tituloSecao: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#292524'
  },

  botaoAdicionar: {
    backgroundColor: '#292524',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 25
  },

  textoBotao: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold'
  },

  card: {
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e7e5e4'
  },

  linhaProduto: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },

  iconeProduto: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },

  textoIcone: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#44403c'
  },

  dadosProduto: {
    flex: 1
  },

  nome: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#292524'
  },

  validade: {
    fontSize: 12,
    color: '#78716c',
    marginTop: 5
  },

  quantidadeBox: {
    alignItems: 'flex-end'
  },

  numeroQuantidade: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#292524'
  },

  labelQuantidade: {
    fontSize: 11,
    color: '#a8a29e'
  },

  divisor: {
    height: 1,
    backgroundColor: '#f5f5f4',
    marginVertical: 16
  },

  acoes: {
    flexDirection: 'row',
    gap: 10
  },

  botaoEditar: {
    flex: 1,
    backgroundColor: '#f5f5f4',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center'
  },

  textoEditar: {
    color: '#57534e',
    fontWeight: 'bold'
  },

  botaoExcluir: {
    flex: 1,
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center'
  },

  textoExcluir: {
    color: '#dc2626',
    fontWeight: 'bold'
  },

  cardVazio: {
    backgroundColor: '#ffffff',
    padding: 35,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e7e5e4'
  },

  textoVazio: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#292524'
  },

  textoVazioSecundario: {
    fontSize: 13,
    color: '#78716c',
    marginTop: 8,
    textAlign: 'center'
  },

  conteudoFormulario: {
    padding: 20,
    paddingBottom: 40
  },

  voltar: {
    marginBottom: 25
  },

  textoVoltar: {
    fontSize: 15,
    color: '#78716c'
  },

  tituloFormulario: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#292524'
  },

  subtituloFormulario: {
    fontSize: 14,
    color: '#78716c',
    marginTop: 6,
    marginBottom: 25
  },

  cardFormulario: {
    backgroundColor: '#ffffff',
    padding: 22,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e7e5e4'
  },

  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#57534e',
    marginBottom: 8
  },

  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e7e5e4',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    fontSize: 15,
    color: '#292524'
  },

  listaCores: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 25
  },

  opcaoCor: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },

  corSelecionada: {
    borderWidth: 2,
    borderColor: '#292524'
  },

  marcadorCor: {
    fontSize: 18,
    color: '#292524',
    fontWeight: 'bold'
  },

  botaoSalvar: {
    backgroundColor: '#292524',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 5
  },

  botaoCancelar: {
    padding: 15,
    alignItems: 'center',
    marginTop: 8
  },

  textoCancelar: {
    color: '#78716c',
    fontSize: 15
  }

});
