const request = require('supertest');
const app = require('../app');
const db = require('../models/db');

let adminToken;
let userToken;

// Logins
beforeAll(async () => {
    const adminLoginRes = await request(app)
        .post('/users/login')
        .send({
            email: 'admin@admin.com',
            password: 'Esmad'
        });
    adminToken = adminLoginRes.body.accessToken;

    const userLoginRes = await request(app)
        .post('/users/login')
        .send({
            email: 'mario@mario.com',
            password: 'mario'
        });
    userToken = userLoginRes.body.accessToken;
});

afterAll(async () => {
    await db.sequelize.close();
});


describe('Testes de Integração para as Rotas de Eventos (/events)', () => {

    // Testes para GET /events
    describe('GET /events', () => {
        it('Deve retornar uma lista de eventos públicos para um utilizador não autenticado', async () => {
            const res = await request(app).get('/events?pageSize=10');

            expect(res.statusCode).toEqual(200);
            expect(res.body.data).toBeInstanceOf(Array);
            expect(res.body.data.some(event => event.eventId === 16)).toBe(false);
            expect(res.body.data.some(event => event.eventId === 10)).toBe(true);
        });

        it('Deve retornar TODOS os eventos (públicos e privados) para um admin', async () => {
            const res = await request(app)
                .get('/events?pageSize=20')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.data.some(event => event.eventId === 16)).toBe(true);
        });
    });

    // Testes para GET /events/:eventId
    describe('GET /events/:eventId', () => {
        it('Deve retornar os detalhes de um evento público específico', async () => {
            const res = await request(app).get('/events/10');
            expect(res.statusCode).toEqual(200);
            expect(res.body.eventId).toEqual(10);
            expect(res.body.title).toContain('Baile Room');
        });

        it('Deve retornar 401 ao tentar aceder a um evento privado sem autenticação', async () => {
            const res = await request(app).get('/events/16');
            expect(res.statusCode).toEqual(401);
        });

        it('Deve permitir que um admin veja um evento privado', async () => {
            const res = await request(app)
                .get('/events/16')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body.eventId).toEqual(16);
        });

        it('Deve retornar 404 para um evento que não existe', async () => {
            const res = await request(app).get('/events/99999');
            expect(res.statusCode).toEqual(404);
        });
    });

    // Testes para POST /events
    describe('POST /events', () => {
        let newEventId;

        it('Deve criar um novo evento com sucesso', async () => {
            const res = await request(app)
                .post('/events')
                .set('Authorization', `Bearer ${userToken}`)
                .field('title', 'Evento de Teste de Integração')
                .field('description', 'Descrição do evento de teste')
                .field('eventType', 'Teste')
                .field('eventDate', '2028-12-31')
                .field('eventTime', '23:00:00')
                .field('location', 'Mundo dos Testes')
                .field('maxParticipants', '100')
                .field('isPublic', 'true');

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('eventId');
            newEventId = res.body.eventId;
        });

        // Apaga o evento criado
        afterAll(async () => {
            if (newEventId) {
                await request(app)
                    .delete(`/events/${newEventId}`)
                    .set('Authorization', `Bearer ${adminToken}`);
            }
        });
    });

    // Testes para PATCH /events/:eventId
    describe('PATCH /events/:eventId', () => {
        it('Deve atualizar um evento com sucesso', async () => {
            const res = await request(app)
                .patch('/events/13')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ title: 'CUPRA PULSE - Título Atualizado' });

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toEqual('Event partially updated successfully.');

            const verifyRes = await request(app).get('/events/13');
            expect(verifyRes.body.title).toEqual('CUPRA PULSE - Título Atualizado');
        });

        it('Deve impedir a atualização por um utilizador não autorizado', async () => {
            const evilUserRes = await request(app)
                .post('/users/login')
                .send({ email: 'user21@example.com', password: 'password123' });
            const evilToken = evilUserRes.body.accessToken;

            const res = await request(app)
                .patch('/events/10')
                .set('Authorization', `Bearer ${evilToken}`)
                .send({ title: 'Tentativa Maliciosa' });

            expect(res.statusCode).toEqual(401);
        });
    });

    // Testes para DELETE /events/:eventId
    describe('DELETE /events/:eventId', () => {
        it('Deve apagar um evento com sucesso', async () => {
            const createRes = await request(app)
                .post('/events')
                .set('Authorization', `Bearer ${userToken}`)
                .field('title', 'Evento Para Apagar')
                .field('description', 'Este evento será apagado')
                .field('eventType', 'Descartável')
                .field('eventDate', '2028-01-01')
                .field('eventTime', '12:00:00')
                .field('location', 'Lixeira')
                .field('isPublic', 'true');

            const eventIdToDelete = createRes.body.eventId;

            const deleteRes = await request(app)
                .delete(`/events/${eventIdToDelete}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(deleteRes.statusCode).toEqual(204);

            const verifyRes = await request(app).get(`/events/${eventIdToDelete}`);
            expect(verifyRes.statusCode).toEqual(404);
        });
    });
});