const { DataTypes } = require('sequelize');
const db = require('../Sequelize/config.js');

const Usuario = db.define('usuario', {
    nombre: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false
    },
    balance: {
        type: DataTypes.FLOAT,
        allowNull: false
    }
}, { timestamps: true });

const Transferencia = db.define('transferencia', {
    emisor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Usuario,
            key: 'id'
        }
    },
    receptor_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Usuario,
            key: 'id'
        }, 
        onDelete: 'SET NULL'
    },
    monto: {
        type: DataTypes.FLOAT,
        allowNull: false
    }
}, { timestamps: true, freezeTableName: true, tableName: 'transferencias' });

Usuario.hasMany(Transferencia, { as: "transferencias", foreignKey: "usuarioId" });
Transferencia.belongsTo(Usuario, { as: 'usuario' });

try {
    db.sync();
} catch (error) {
    console.error("Error en la sincronización: " + error);
}

module.exports = { Usuario, Transferencia };