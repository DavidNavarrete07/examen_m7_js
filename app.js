const express = require('express');
const fnUtil = require('./functionsUtils');
const { Usuario, Transferencia } = require('./Models/models.js');
const db = require('./Sequelize/config.js');
const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// routes for usuarios
app.get('/usuarios', async (req, res) => {
    const usuarios = await Usuario.findAll();
    res.json(usuarios);
});

app.post('/usuario', async (req, res) => {
    const form = await fnUtil.getForm(req);
    const nombre = form.nombre;
    const balance = parseInt(form.balance);
    if (isNaN(balance)) {
        console.log("El dato ingresado no es un número");
        res.statusCode = 400;
        return;
    } else {
        if (balance <= 0) {
            console.log("No se puede ingresar una cantidad menor a 0");
            res.statusCode = 400;
            return;
        } else {
            try {
                await Usuario.create({ nombre, balance });
                res.statusCode = 200;
            } catch (error) {
                console.log("Surgió un error en la creación del Usuario: " + error);
                res.statusCode = 500;
                return;
            }
        }
    }
    res.redirect('/');
});

app.put('/usuario', async (req, res) => {
    const form = await fnUtil.getForm(req);
    const usuarioId = parseInt(req.query.id);
    const nombre = form.name;
    const balance = parseInt(form.balance);
    if (balance <= 0) {
        console.log("No se puede ingresar una cantidad menor a 0");
        res.statusCode = 400;
        return;
    } else {
        try {
            await Usuario.update({ nombre, balance }, { where: { id: usuarioId } });
            res.statusCode = 200;
        } catch (error) {
            console.error("Surgió un error en la edición del Usuario: " + error);
            res.statusCode = 500;
            return res.redirect('/');
        }
    }
    const usuarios = await Usuario.findAll();
    res.json(usuarios);
});

app.delete('/usuario', async (req, res) => {
    const usuarioId = parseInt(req.query.id);
    if (!usuarioId) {
        console.log('El id del usuario no está definido o no es un número');
        res.statusCode = 400;
        return;
    } else {
        try {
            const transferenciasUsuario = await Transferencia.findAll({ where: { 'usuarioId': usuarioId } }, { raw: true });
            for (const transferencia of transferenciasUsuario) {
                await Transferencia.destroy({ where: { id: transferencia.id } });
            }
            const usuario = await Usuario.findOne({ where: { id: usuarioId } });
            usuario.destroy();
            res.statusCode = 200;
        } catch (error) {
            console.error("Surgió un error en la eliminación del usuario: " + error);
            res.statusCode = 500;
            return res.redirect('/');
        }
        const usuarios = await Usuario.findAll();
        res.json(usuarios);
    }
});
// End routes for usuarios

// Routes for transferencia
app.get('/transferencias', async (req, res) => {
    let arreglo = [];
    let emisor;
    let receptor;
    const transferencias = await Transferencia.findAll();
    for (const transferencia of transferencias) {
        emisor = await Usuario.findOne({ where: { id: transferencia.emisor_id } }, { attributes: ['nombre'] });
        receptor = await Usuario.findOne({ where: { id: transferencia.receptor_id } }, { attributes: ['nombre'] });
        (receptor === null) ? receptor = 'Eliminado' : receptor = receptor.nombre;
        emisor = emisor.nombre;
        arreglo.push([transferencia.id, emisor, receptor, transferencia.monto, transferencia.createdAt]);
    }
    res.send(arreglo);
});

app.post('/transferencia', async (req, res) => {
    const form = await fnUtil.getForm(req);
    const nombreEmisor = form.emisor;
    const nombreReceptor = form.receptor;
    const monto = parseInt(form.monto);

    let emisor = await Usuario.findOne({ where: { nombre: nombreEmisor }, attributes: ['id', 'balance'] });
    let receptor = await Usuario.findOne({ where: { nombre: nombreReceptor }, attributes: ['id', 'balance'] });

    if (nombreEmisor != nombreReceptor) {
        if (!nombreEmisor | !nombreReceptor | !monto) {
            console.error('Faltan datos');
            res.statusCode = 400;
        } else {
            if (monto > emisor.balance) {
                console.error('El monto a transferir no puede ser mayor al balance del emisor');
                res.statusCode = 400;
            } else {
                const transaccion = await db.transaction();
                try {
                    await Transferencia.create({
                        emisor_id: emisor.id,
                        receptor_id: receptor.id,
                        monto,
                        usuarioId: emisor.id
                    });

                    await Usuario.update({ balance: (emisor.balance - monto) }, { where: { id: emisor.id } });
                    await Usuario.update({ balance: (receptor.balance + monto) }, { where: { id: receptor.id } });
                    await transaccion.commit();

                } catch (error) {
                    console.error('Error en la transacción: ' + error);
                    await transaccion.rollback();
                    return res.redirect('/');
                }
            }
        }
    }else{
        console.log('No puedes transferirte a ti mismo...');
        return;
    }
    const usuarios = await Usuario.findAll();
    res.json(usuarios);
});

// End routes for transferencias

app.get('*', (req, res) => {
    res.statusCode = 404
    res.send('Ruta no implementada')
});

app.listen(3000, () => {
    console.log(`Servidor en puerto 3000`);
});