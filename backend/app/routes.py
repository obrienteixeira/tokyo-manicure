# 1. Importações necessárias do Flask, SQLAlchemy e dos nossos modelos
from flask import Blueprint, jsonify, request
from .database import db
from .models import Cliente, Funcionario, Servico, Produto, Agendamento, Transacao, Pacote, User

# 2. Cria um Blueprint para organizar as rotas.
# O Blueprint é como um mini-app que pode ser registrado na aplicação principal.
bp = Blueprint('api', __name__, url_prefix='/api')

# 3. Rota de teste para a raiz da API
@bp.route('/')
def index():
    return jsonify({"message": "API do Salão de Manicure Tokyo Nails está no ar!"})

# --- ROTAS DE CRUD GENÉRICAS ---
# Funções para evitar repetição de código nas operações básicas de CRUD.

# 4. Função genérica para buscar todos os itens de um modelo
def get_all(model):
    items = db.session.execute(db.select(model)).scalars().all()
    return jsonify([item.to_dict() for item in items])

# 5. Função genérica para buscar um item por ID
def get_by_id(model, item_id):
    item = db.get_or_404(model, item_id)
    return jsonify(item.to_dict())

# 6. Função genérica para criar um novo item
def create_item(model):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Requisição inválida"}), 400
    new_item = model(**data)
    db.session.add(new_item)
    db.session.commit()
    return jsonify(new_item.to_dict()), 201

# 7. Função genérica para atualizar um item existente
def update_item(model, item_id):
    item = db.get_or_404(model, item_id)
    data = request.get_json()
    if not data:
        return jsonify({"error": "Requisição inválida"}), 400
    for key, value in data.items():
        setattr(item, key, value)
    db.session.commit()
    return jsonify(item.to_dict())

# 8. Função genérica para deletar um item
def delete_item(model, item_id):
    item = db.get_or_404(model, item_id)
    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Item deletado com sucesso"}), 200

# --- APLICAÇÃO DAS ROTAS GENÉRICAS PARA CADA MODELO ---

# 9. Rotas para Clientes
@bp.route('/clientes', methods=['GET', 'POST'])
def handle_clientes():
    if request.method == 'POST':
        return create_item(Cliente)
    return get_all(Cliente)

@bp.route('/clientes/<int:id>', methods=['GET', 'PUT', 'DELETE'])
def handle_cliente(id):
    if request.method == 'PUT':
        return update_item(Cliente, id)
    if request.method == 'DELETE':
        return delete_item(Cliente, id)
    return get_by_id(Cliente, id)

# 10. Rotas para Funcionários
@bp.route('/funcionarios', methods=['GET', 'POST'])
def handle_funcionarios():
    if request.method == 'POST':
        return create_item(Funcionario)
    return get_all(Funcionario)

@bp.route('/funcionarios/<int:id>', methods=['GET', 'PUT', 'DELETE'])
def handle_funcionario(id):
    if request.method == 'PUT':
        return update_item(Funcionario, id)
    if request.method == 'DELETE':
        return delete_item(Funcionario, id)
    return get_by_id(Funcionario, id)

# 11. Rotas para Serviços
@bp.route('/servicos', methods=['GET', 'POST'])
def handle_servicos():
    if request.method == 'POST':
        return create_item(Servico)
    return get_all(Servico)

@bp.route('/servicos/<int:id>', methods=['GET', 'PUT', 'DELETE'])
def handle_servico(id):
    if request.method == 'PUT':
        return update_item(Servico, id)
    if request.method == 'DELETE':
        return delete_item(Servico, id)
    return get_by_id(Servico, id)

# 12. Rotas para Produtos
@bp.route('/produtos', methods=['GET', 'POST'])
def handle_produtos():
    if request.method == 'POST':
        return create_item(Produto)
    return get_all(Produto)

@bp.route('/produtos/<int:id>', methods=['GET', 'PUT', 'DELETE'])
def handle_produto(id):
    if request.method == 'PUT':
        return update_item(Produto, id)
    if request.method == 'DELETE':
        return delete_item(Produto, id)
    return get_by_id(Produto, id)

# 13. Rotas para Agendamentos
@bp.route('/agendamentos', methods=['GET', 'POST'])
def handle_agendamentos():
    if request.method == 'POST':
        return create_item(Agendamento)
    return get_all(Agendamento)

@bp.route('/agendamentos/<int:id>', methods=['GET', 'PUT', 'DELETE'])
def handle_agendamento(id):
    if request.method == 'PUT':
        return update_item(Agendamento, id)
    if request.method == 'DELETE':
        return delete_item(Agendamento, id)
    return get_by_id(Agendamento, id)

# 14. Rotas para Transações
@bp.route('/transacoes', methods=['GET', 'POST'])
def handle_transacoes():
    if request.method == 'POST':
        return create_item(Transacao)
    return get_all(Transacao)

@bp.route('/transacoes/<int:id>', methods=['GET', 'PUT', 'DELETE'])
def handle_transacao(id):
    if request.method == 'PUT':
        return update_item(Transacao, id)
    if request.method == 'DELETE':
        return delete_item(Transacao, id)
    return get_by_id(Transacao, id)

# 15. Rotas para Pacotes
@bp.route('/pacotes', methods=['GET', 'POST'])
def handle_pacotes():
    if request.method == 'POST':
        return create_item(Pacote)
    return get_all(Pacote)

@bp.route('/pacotes/<int:id>', methods=['GET', 'PUT', 'DELETE'])
def handle_pacote(id):
    if request.method == 'PUT':
        return update_item(Pacote, id)
    if request.method == 'DELETE':
        return delete_item(Pacote, id)
    return get_by_id(Pacote, id)

# 16. Rotas para Usuários
@bp.route('/users', methods=['GET', 'POST'])
def handle_users():
    if request.method == 'POST':
        return create_item(User)
    return get_all(User)

@bp.route('/users/<int:id>', methods=['GET', 'PUT', 'DELETE'])
def handle_user(id):
    if request.method == 'PUT':
        return update_item(User, id)
    if request.method == 'DELETE':
        return delete_item(User, id)
    return get_by_id(User, id)