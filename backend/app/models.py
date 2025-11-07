# 1. Importa a instância 'db' do nosso módulo de banco de dados
from .database import db

# 2. Classe de utilidade para serialização
# Adiciona um método 'to_dict' para converter facilmente os objetos do SQLAlchemy em dicionários Python (e depois em JSON).
class SerializerMixin:
    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

# 3. Modelo de Usuário (Tabela 'users')
class User(db.Model, SerializerMixin):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    openId = db.Column(db.String(64), unique=True, nullable=False)
    name = db.Column(db.Text)
    email = db.Column(db.String(320), unique=True, nullable=False)
    senha = db.Column(db.String(255))
    loginMethod = db.Column(db.String(64))
    role = db.Column(db.Enum('user', 'admin', 'gerente', 'atendente'), nullable=False, default='user')
    ativo = db.Column(db.Boolean, default=True)

# 4. Modelo de Cliente (Tabela 'clientes')
class Cliente(db.Model, SerializerMixin):
    __tablename__ = 'clientes'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(255), nullable=False)
    telefone = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(320))
    dataNascimento = db.Column(db.DateTime)
    dataRegistro = db.Column(db.DateTime, server_default=db.func.now())
    observacoes = db.Column(db.Text)

# 5. Modelo de Funcionário (Tabela 'funcionarios')
class Funcionario(db.Model, SerializerMixin):
    __tablename__ = 'funcionarios'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(255), nullable=False)
    telefone = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(320))
    cpfCnpj = db.Column(db.String(20))
    especialidades = db.Column(db.Text)
    comissaoPercentual = db.Column(db.Integer, nullable=False, default=0)
    bancoNome = db.Column(db.String(255))
    agencia = db.Column(db.String(10))
    contaBancaria = db.Column(db.String(20))
    tipoConta = db.Column(db.Enum('corrente', 'poupanca'))
    ativo = db.Column(db.Boolean, nullable=False, default=True)

# 6. Modelo de Serviço (Tabela 'servicos')
class Servico(db.Model, SerializerMixin):
    __tablename__ = 'servicos'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(255), nullable=False)
    descricao = db.Column(db.Text)
    preco = db.Column(db.Integer, nullable=False)
    duracaoMinutos = db.Column(db.Integer, nullable=False)
    ativo = db.Column(db.Boolean, nullable=False, default=True)

# 7. Modelo de Produto (Tabela 'produtos')
class Produto(db.Model, SerializerMixin):
    __tablename__ = 'produtos'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(255), nullable=False)
    descricao = db.Column(db.Text)
    preco = db.Column(db.Integer, nullable=False)
    estoque = db.Column(db.Integer, nullable=False, default=0)
    estoqueMinimo = db.Column(db.Integer, nullable=False, default=0)
    ativo = db.Column(db.Boolean, nullable=False, default=True)

# 8. Modelo de Agendamento (Tabela 'agendamentos')
class Agendamento(db.Model, SerializerMixin):
    __tablename__ = 'agendamentos'
    id = db.Column(db.Integer, primary_key=True)
    clienteId = db.Column(db.Integer, nullable=False)
    funcionarioId = db.Column(db.Integer, nullable=False)
    servicoId = db.Column(db.Integer, nullable=False)
    dataHora = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.Enum('agendado', 'confirmado', 'em_atendimento', 'concluido', 'cancelado'), nullable=False, default='agendado')
    observacoes = db.Column(db.Text)

# 9. Modelo de Transação (Tabela 'transacoes')
class Transacao(db.Model, SerializerMixin):
    __tablename__ = 'transacoes'
    id = db.Column(db.Integer, primary_key=True)
    tipo = db.Column(db.Enum('servico', 'produto', 'pacote'), nullable=False)
    clienteId = db.Column(db.Integer, nullable=False)
    funcionarioId = db.Column(db.Integer)
    agendamentoId = db.Column(db.Integer)
    valor = db.Column(db.Integer, nullable=False)
    comissaoFuncionario = db.Column(db.Integer, nullable=False, default=0)
    metodoPagamento = db.Column(db.Enum('dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'outro'), nullable=False)
    descricao = db.Column(db.Text)
    dataTransacao = db.Column(db.DateTime, nullable=False)

# 10. Modelo de Pacote (Tabela 'pacotes')
class Pacote(db.Model, SerializerMixin):
    __tablename__ = 'pacotes'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(255), nullable=False)
    descricao = db.Column(db.Text)
    preco = db.Column(db.Integer, nullable=False)
    precoOriginal = db.Column(db.Integer, nullable=False)
    servicosInclusos = db.Column(db.Text, nullable=False)
    validade = db.Column(db.Integer, nullable=False)
    ativo = db.Column(db.Boolean, nullable=False, default=True)