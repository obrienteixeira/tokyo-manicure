# 1. Importa a função factory 'create_app' do nosso pacote 'app'
from app import create_app

# 2. Cria uma instância da nossa aplicação Flask
# A factory 'create_app' cuida de todas as configurações iniciais.
app = create_app()

# 3. Bloco de execução principal
# A condição 'if __name__ == "__main__":' garante que o servidor
# só será iniciado quando este script for executado diretamente.
if __name__ == '__main__':
    # 4. Inicia o servidor de desenvolvimento do Flask
    # debug=True: habilita o modo de depuração, que reinicia o servidor
    # automaticamente a cada alteração no código e fornece mais detalhes sobre erros.
    # host='0.0.0.0': torna o servidor acessível na sua rede local (opcional).
    # port=5000: define a porta em que o servidor irá rodar.
    app.run(host='0.0.0.0', port=5000, debug=True)