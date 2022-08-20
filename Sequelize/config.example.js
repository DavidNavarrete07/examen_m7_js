const Sequelize = require('sequelize');

const db = new Sequelize('name_bd', 'postgres', 'password_db', {
    host: 'localhost',
    dialect: 'postgres'
});

(async function () {
    try {
        await db.authenticate();
        console.log('Conexión establecida!');
    } catch (error) {
        console.error("Error en la conexión a BD: ");
    }
})();

module.exports = db;