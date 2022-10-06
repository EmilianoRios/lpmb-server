const express = require("express");
const router = express.Router();
const { Administradores } = require("../models");
const bcrypt = require("bcryptjs");
const { sign } = require("jsonwebtoken");
const { validateToken } = require("../middlewares/AuthMiddleware")

router.post("/", async (req, res) => {
    const { usuario, nombres, apellidos, correo, contrasena, rol } = req.body;
    bcrypt.hash(contrasena, 10).then((hash) => {
        Administradores.create({
            usuario: usuario,
            nombres: nombres,
            apellidos: apellidos,
            correo: correo,
            contrasena: hash,
            rol: rol
        });
        return res.json("Creado correctamente.");
    });
});

router.post("/login", async (req, res) => {
    const { usuario, contrasena } = req.body;

    const user = await Administradores.findOne({ where: { usuario: usuario }, });

    if (!user) return res.json({ error: "Usuario o contraseña incorrectas" });

    bcrypt.compare(contrasena, user.contrasena).then(async (match) => {
        if (!match) return res.json({ error: "Usuario o contraseña incorrectas" });

        const accessToken = sign(
            { usuario: user.usuario, rol: user.rol, id: user.id },
            "importantsecret"
        );
        return res.json({ token: accessToken, rol: user.rol, usuario: user.usuario, id: user.id });
    });
});

router.get('/auth', validateToken, (req, res) => {
    return res.json(req.user);
})

module.exports = router;
