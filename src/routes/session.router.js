import { Router } from "express";
import UserModel from "../dao/models/user.model.js";
import { createHash, isValidPassword } from "../utils.js";

const router = Router()

//Vista para registrar usuarios
router.get('/register', (req, res) => {
    res.render('sessions/register')
})

// API para crear usuarios en la DB
router.post('/register', async(req, res) => {
    const userNew = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        age: req.body.age,
        email: req.body.email,
        password: createHash(req.body.password)
    }
    console.log(userNew);

    const user = new UserModel(userNew)
    await user.save()

    res.redirect('/session/login')
})

// Vista de Login
router.get('/login', (req, res) => {
    res.render('sessions/login')
})

// API para login
router.post('/login', async (req, res) => {
    const { email, password } = req.body

    // const user = await UserModel.findOne({email, password}).lean().exec()
    const user = await UserModel.findOne({email}).lean().exec()
    if(!user) {
        return res.status(401).render('errors/base', {
            error: 'User not found!'
        })
    }

    if (!isValidPassword(user, password)) {
        return res.status(403).json({ status: 'error', error: 'Incorrect pass'})
    } 
    req.session.user = user.email
    res.redirect('/products')
})

// Cerrar Session
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if(err) {
            console.log(err);
            res.status(500).render('errors/base', {error: err})
        } else res.redirect('/session/login')
    })
})



export default router