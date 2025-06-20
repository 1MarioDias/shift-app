const request = require('supertest');
const app = require('../app');
const db = require('../models/db');
const User = require('../models/users.model');

let adminToken;
let regularUserToken;
let adminUserId;

// Logins
beforeAll(async () => {
    const adminLoginRes = await request(app)
        .post('/users/login')
        .send({
            email: 'admin@admin.com',
            password: 'Esmad'
        });
    adminToken = adminLoginRes.body.accessToken;
    adminUserId = adminLoginRes.body.user.userId;

    const userLoginRes = await request(app)
        .post('/users/login')
        .send({
            email: 'bbb@bbb.com',
            password: 'bbb'
        });
    regularUserToken = userLoginRes.body.accessToken;
});

afterAll(async () => {
    // Limpa utilizadores criados durante os testes
    await User.destroy({ where: { email: 'test.register@example.com' } });
    await db.sequelize.close();
});

describe('Testes de Integração para as Rotas de Utilizadores (/users)', () => {

    // Testes para POST /users (Registo)
    describe('POST /users', () => {
        it('Deve registar um novo utilizador com sucesso', async () => {
            const res = await request(app)
                .post('/users')
                .send({
                    username: 'Test Register',
                    email: 'test.register@example.com',
                    password: 'password123'
                });
            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('userId');
            expect(res.body.email).toBe('test.register@example.com');
        });

        it('Não deve registar um utilizador com um email que já existe', async () => {
            const res = await request(app)
                .post('/users')
                .send({
                    username: 'Marito',
                    email: 'bbb@bbb.com',
                    password: 'password123'
                });
            expect(res.statusCode).toEqual(400);
            expect(res.body.error).toContain('The provided EMAIL is already in use.');
        });

        it('Não deve registar um utilizador sem os campos obrigatórios', async () => {
            const res = await request(app)
                .post('/users')
                .send({
                    username: 'IncompleteUser'
                });
            expect(res.statusCode).toEqual(400);
            expect(res.body.error).toContain('The EMAIL field is required.');
        });
    });

    // Testes para GET /users/me (Perfil do Utilizador)
    describe('GET /users/me', () => {
        it('Deve retornar o perfil do utilizador autenticado', async () => {
            const res = await request(app)
                .get('/users/me')
                .set('Authorization', `Bearer ${regularUserToken}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body.userId).toEqual(26);
            expect(res.body.email).toBe('bbb@bbb.com');
        });

        it('Deve retornar 401 se não for fornecido um token', async () => {
            const res = await request(app).get('/users/me');
            expect(res.statusCode).toEqual(401);
        });
    });

    // Testes para GET /users (Admin)
    describe('GET /users', () => {
        it('Deve retornar uma lista de todos os utilizadores para um admin', async () => {
            const res = await request(app)
                .get('/users')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body.data).toBeInstanceOf(Array);
            expect(res.body.data.length).toBeGreaterThan(0);
        });

        it('Deve retornar 403 se um utilizador regular tentar aceder', async () => {
            const res = await request(app)
                .get('/users')
                .set('Authorization', `Bearer ${regularUserToken}`);
            expect(res.statusCode).toEqual(403);
        });
    });

    // Testes para DELETE /users/:userId (Admin)
    describe('DELETE /users/:userId', () => {
        let userToDeleteId;

        beforeAll(async () => {
            const tempUser = await User.create({
                nome: 'User To Delete',
                email: 'delete.me@example.com',
                password: '123',
                tipoUtilizador: 'Utilizador',
                dataRegisto: new Date()
            });
            userToDeleteId = tempUser.idUtilizador;
        });

        it('Deve permitir que um admin apague outro utilizador', async () => {
            const res = await request(app)
                .delete(`/users/${userToDeleteId}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.statusCode).toEqual(204);
        });

        it('Não deve permitir que um admin se apague a si próprio', async () => {
            const res = await request(app)
                .delete(`/users/${adminUserId}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.statusCode).toEqual(403);
            expect(res.body.error).toBe('Administrators cannot delete their own account.');
        });

        it('Não deve permitir que um utilizador regular apague outro utilizador', async () => {
            const res = await request(app)
                .delete('/users/3')
                .set('Authorization', `Bearer ${regularUserToken}`);
            expect(res.statusCode).toEqual(403);
        });
    });
});