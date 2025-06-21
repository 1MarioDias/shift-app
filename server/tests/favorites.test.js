const request = require('supertest');
const app = require('../app');
const db = require('../models/db');
const FavoriteEvent = require('../models/favoriteEvents.model');

let userToken;
let otherUserToken;

beforeAll(async () => {
    // User 36
    const userLoginRes = await request(app)
        .post('/users/login')
        .send({ email: 'mario@mario.com', password: 'mario' });
    userToken = userLoginRes.body.accessToken;

    // User 21
    const otherUserLoginRes = await request(app)
        .post('/users/login')
        .send({ email: 'sofia@sofia.com', password: 'sofia' });
    otherUserToken = otherUserLoginRes.body.accessToken;
});

afterAll(async () => {
    await db.sequelize.close();
});

describe('Testes de Integração para as Rotas de Favoritos (/favorites)', () => {

    describe('GET /favorites', () => {
        it('Deve retornar a lista de eventos favoritos de um utilizador', async () => {
            const res = await request(app)
                .get('/favorites')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.data).toBeInstanceOf(Array);
        });

        it('Deve retornar 401 se o utilizador não estiver autenticado', async () => {
            const res = await request(app).get('/favorites');
            expect(res.statusCode).toEqual(401);
        });
    });

    describe('POST /favorites/:eventId', () => {
        afterAll(async () => {
            await FavoriteEvent.destroy({ where: { idUtilizador: 21, idEvento: 10 } });
        });

        it('Deve adicionar um evento aos favoritos com sucesso', async () => {
            // 1 não tem o evento 10 nos favoritos
            const res = await request(app)
                .post('/favorites/10')
                .set('Authorization', `Bearer ${otherUserToken}`);

            expect(res.statusCode).toEqual(200);
        });

        it('Deve retornar 400 se o evento já for um favorito', async () => {
            // 36 já tem o evento 10 nos favoritos
            const res = await request(app)
                .post('/favorites/10')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toEqual(400);
            expect(res.body.error).toContain('Event is already in favorites.');
        });

        it('Deve retornar 404 se o evento a favoritar não existir', async () => {
            const res = await request(app)
                .post('/favorites/99999')
                .set('Authorization', `Bearer ${userToken}`);
            expect(res.statusCode).toEqual(404);
        });
    });

    describe('DELETE /favorites/:eventId', () => {
        // fav temporário para o teste
        beforeAll(async () => {
            await FavoriteEvent.create({ idUtilizador: 36, idEvento: 11 });
        });

        it('Deve remover um evento dos favoritos com sucesso', async () => {
            const res = await request(app)
                .delete('/favorites/11')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toEqual(204);
        });

        it('Deve retornar 404 se tentar remover um evento que não está nos favoritos', async () => {
            // 21 não tem o evento 12 nos favoritos
            const res = await request(app)
                .delete('/favorites/12')
                .set('Authorization', `Bearer ${otherUserToken}`);
            expect(res.statusCode).toEqual(404);
        });
    });
});