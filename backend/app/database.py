# 1. Importa a classe SQLAlchemy do pacote flask_sqlalchemy
from flask_sqlalchemy import SQLAlchemy

# 2. Cria uma instância global do SQLAlchemy
# Esta instância será importada e usada tanto no __init__.py quanto nos models.py
# para definir os modelos e conectar ao app, evitando importações circulares.
db = SQLAlchemy()