# 1. Importações necessárias do Flask e extensões
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from .database import db

# 2. Função Factory da Aplicação
# Este é um padrão comum no Flask para criar e configurar a aplicação.
def create_app():
    """Cria e configura uma instância da aplicação Flask."""
    
    # 3. Inicializa a aplicação Flask
    app = Flask(__name__)
    
    # 4. Configuração da conexão com o banco de dados MySQL
    # Substitua 'root' e '' pela seu usuário e senha do MySQL, se forem diferentes.
    app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:@localhost/salao_manicure'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # 5. Inicializa o SQLAlchemy com a nossa aplicação
    db.init_app(app)
    
    # 6. Habilita o CORS para permitir que o frontend (rodando em outra porta)
    # se comunique com este backend.
    CORS(app)
    
    # 7. Bloco de contexto da aplicação
    # É necessário para que o Flask saiba qual aplicação está ativa
    # ao realizar operações como a criação das tabelas do banco.
    with app.app_context():
        # 8. Importa as rotas (endpoints da API)
        from . import routes
        
        # 9. Registra o Blueprint que contém todas as nossas rotas.
        # O Blueprint ajuda a organizar a aplicação em componentes.
        app.register_blueprint(routes.bp)

        # 10. Cria todas as tabelas no banco de dados, se elas ainda não existirem.
        # Isso é útil na primeira vez que você roda a aplicação.
        db.create_all()

    # 11. Retorna a instância da aplicação configurada
    return app