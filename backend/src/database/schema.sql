-- ========================================
-- SCHEMA DO BANCO DE DADOS ORACLE
-- ========================================

-- Tabela de usuários (para login)
CREATE TABLE usuario (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario VARCHAR2(100) UNIQUE NOT NULL,
    senha_hash VARCHAR2(255) NOT NULL,
    nome VARCHAR2(200) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de vendedores
CREATE TABLE vendedor (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR2(200) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de clientes
CREATE TABLE cliente (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR2(200) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de produtos
CREATE TABLE produto (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR2(200) NOT NULL,
    custo NUMBER(10,2),
    preco_venda NUMBER(10,2),
    permite_desconto CHAR(1) DEFAULT 'N' CHECK (permite_desconto IN ('S', 'N')),
    estoque NUMBER DEFAULT 0,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de lançamentos (para calcular dívida do cliente)
CREATE TABLE tabela_lancamento (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_cliente NUMBER NOT NULL,
    valor NUMBER(10,2) NOT NULL,
    vencimento DATE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_lancamento_cliente FOREIGN KEY (id_cliente) REFERENCES cliente(id)
);

-- Tabela cabeçalho venda online
CREATE TABLE venda_online (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_vendedor NUMBER NOT NULL,
    id_cliente NUMBER NOT NULL,
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_venda_vendedor FOREIGN KEY (id_vendedor) REFERENCES vendedor(id),
    CONSTRAINT fk_venda_cliente FOREIGN KEY (id_cliente) REFERENCES cliente(id)
);

-- Tabela itens venda online
CREATE TABLE venda_online_produto (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_venda_online NUMBER NOT NULL,
    id_produto NUMBER NOT NULL,
    quantidade NUMBER NOT NULL,
    preco_unitario NUMBER(10,2) NOT NULL,
    CONSTRAINT fk_venda_produto_venda FOREIGN KEY (id_venda_online) REFERENCES venda_online(id),
    CONSTRAINT fk_venda_produto_produto FOREIGN KEY (id_produto) REFERENCES produto(id)
);

-- ========================================
-- DADOS DE EXEMPLO
-- ========================================

-- Inserir usuário de teste (senha: admin123)
-- Hash gerado com bcrypt, rounds=10
INSERT INTO usuario (usuario, senha_hash, nome) 
VALUES ('admin', '$2b$10$xQHJZ5z5YqGxR5m5HEXKouVJhF7Y8vqK4C7DZpQxN3vN2Z5YqGxR5', 'Administrador');

-- Inserir vendedores
INSERT INTO vendedor (nome) VALUES ('João Silva');
INSERT INTO vendedor (nome) VALUES ('Maria Santos');
INSERT INTO vendedor (nome) VALUES ('Pedro Oliveira');

-- Inserir clientes
INSERT INTO cliente (nome) VALUES ('Empresa ABC Ltda');
INSERT INTO cliente (nome) VALUES ('Comércio XYZ');
INSERT INTO cliente (nome) VALUES ('Indústria 123');

-- Inserir produtos
INSERT INTO produto (nome, custo, preco_venda, permite_desconto, estoque) 
VALUES ('Produto A', 50.00, 100.00, 'S', 100);

INSERT INTO produto (nome, custo, preco_venda, permite_desconto, estoque) 
VALUES ('Produto B', 80.00, 150.00, 'N', 50);

INSERT INTO produto (nome, custo, preco_venda, permite_desconto, estoque) 
VALUES ('Produto C', 30.00, 60.00, 'S', 200);

-- Inserir lançamentos (dívidas) para clientes
INSERT INTO tabela_lancamento (id_cliente, valor, vencimento) 
VALUES (1, 500.00, SYSDATE + 30);

INSERT INTO tabela_lancamento (id_cliente, valor, vencimento) 
VALUES (1, 750.00, SYSDATE + 60);

INSERT INTO tabela_lancamento (id_cliente, valor, vencimento) 
VALUES (2, 1200.00, SYSDATE + 15);

COMMIT;