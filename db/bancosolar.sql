DROP TABLE IF EXISTS usuarios;
CREATE TABLE usuarios(
    id SERIAL, 
    nombre VARCHAR(50) UNIQUE NOT NULL, 
    balance FLOAT NOT NULL CHECK(balance >= 0),
    PRIMARY KEY(id)
);

DROP TABLE IF EXISTS transferencias;
CREATE TABLE transferencias(
    id SERIAL, 
    emisor_id INT NOT NULL, 
    receptor_id INT NOT NULL, 
    monto FLOAT NOT NULL, 
    fecha TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (emisor_id) REFERENCES usuarios(id), 
    FOREIGN KEY (receptor_id) REFERENCES usuarios(id),
    PRIMARY KEY(id)
);