const request = require('supertest');
const app = require('../app');
const db = require('../models/db');
const Comment = require('../models/comments.model');

let adminToken;
let userToken;
let otherUserToken;

beforeAll(async () => {
    // Login como Admin
    const adminLoginRes = await request(app)
        .post('/users/login')
        .send({ email: 'admin@admin.com', password: 'Esmad' });
    adminToken = adminLoginRes.body.accessToken;

    // User 36
    const userLoginRes = await request(app)
        .post('/users/login')
        .send({ email: 'mario@mario.com', password: 'mario' });
    userToken = userLoginRes.body.accessToken;

    // User 30
    const otherUserLoginRes = await request(app)
        .post('/users/login')
        .send({ email: 'ddd@ddd.com', password: 'ddd' });
    otherUserToken = otherUserLoginRes.body.accessToken;
});

afterAll(async () => {
    await db.sequelize.close();
});

describe('Testes de Integração para as Rotas de Comentários', () => {

    // Testes para rotas em /events/:eventId/comments
    describe('GET /events/:eventId/comments', () => {
        it('Deve retornar os comentários de um evento público', async () => {
            const res = await request(app).get('/events/10/comments');
            expect(res.statusCode).toEqual(200);
            expect(res.body.data).toBeInstanceOf(Array);
            expect(res.body.data.length).toBeGreaterThan(0);
            // Verifica se o comentário de ID 7 ("Tetse") existe
            expect(res.body.data.some(c => c.commentId === 7)).toBe(true);
        });

        it('Deve permitir que um admin veja comentários de um evento privado', async () => {
            const res = await request(app)
                .get('/events/16/comments')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.statusCode).toEqual(200);
        });
    });

    describe('POST /events/:eventId/comments', () => {
        let newCommentId;

        it('Deve permitir que um utilizador autenticado adicione um comentário', async () => {
            const res = await request(app)
                .post('/events/11/comments')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ text: 'Comentário de teste de integração!' });

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('commentId');
            expect(res.body.text).toBe('Comentário de teste de integração!');
            newCommentId = res.body.commentId;
        });

        it('Não deve permitir adicionar um comentário vazio', async () => {
            const res = await request(app)
                .post('/events/11/comments')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ text: '   ' });
            expect(res.statusCode).toEqual(400);
        });

        // Limpeza do comentário criado
        afterAll(async () => {
            if (newCommentId) {
                await Comment.destroy({ where: { idComentario: newCommentId } });
            }
        });
    });

    // Testes para rotas em /comments (Admin)
    describe('GET /comments (Admin)', () => {
        it('Deve retornar uma lista de todos os comentários para um admin', async () => {
            const res = await request(app)
                .get('/comments')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body.data).toBeInstanceOf(Array);
            expect(res.body.pagination.totalItems).toBeGreaterThan(10);
        });

        it('Deve filtrar comentários por utilizador (userId)', async () => {
            const res = await request(app)
                .get('/comments?userId=30')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body.data.every(c => c.user.userId === 30)).toBe(true);
        });

        it('Deve retornar 403 para um utilizador não-admin', async () => {
            const res = await request(app)
                .get('/comments')
                .set('Authorization', `Bearer ${userToken}`);
            expect(res.statusCode).toEqual(403);
        });
    });

    describe('DELETE /comments/:commentId', () => {
        it('Deve permitir que um utilizador apague o seu próprio comentário', async () => {
            const commentRes = await request(app)
                .post('/events/12/comments')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ text: 'Comentário para apagar' });
            
            const commentId = commentRes.body.commentId;

            const deleteRes = await request(app)
                .delete(`/comments/${commentId}`)
                .set('Authorization', `Bearer ${userToken}`);
            
            expect(deleteRes.statusCode).toEqual(204);
        });

        it('Deve permitir que um admin apague o comentário de qualquer utilizador', async () => {
            const commentRes = await request(app)
                .post('/events/12/comments')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ text: 'Comentário para apagar' });
            
            const commentId = commentRes.body.commentId;
            
            const res = await request(app)
                .delete(`/comments/${commentId}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.statusCode).toEqual(204);
        });

        it('Não deve permitir que um utilizador apague o comentário de outro', async () => {
            const res = await request(app)
                .delete('/comments/32')
                .set('Authorization', `Bearer ${userToken}`);
            expect(res.statusCode).toEqual(403);
        });
    });
});