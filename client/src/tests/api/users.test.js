import { userService } from '../../api/user';
import { authStore } from '../../stores/authStore';

// Simular o authStore e o fetch
jest.mock('../../stores/authStore');
global.fetch = jest.fn();

describe('Serviço de Utilizador', () => {
  beforeEach(() => {
    fetch.mockClear();
    authStore.isLoggedIn.mockClear();
    authStore.getAuthHeaders.mockClear();
  });

  it('getProfile: deve ir buscar o perfil do utilizador autenticado', async () => {
    authStore.isLoggedIn.mockReturnValue(true);
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ id: 1 }) });
    await userService.getProfile();
    expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:3000/users/me', expect.any(Object));
  });

  it('getFavorites: deve ir buscar os favoritos do utilizador', async () => {
    authStore.isLoggedIn.mockReturnValue(true);
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: [] }) });
    await userService.getFavorites();
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('http://127.0.0.1:3000/favorites'), expect.any(Object));
  });

  it('addFavorite: deve adicionar um evento aos favoritos', async () => {
    authStore.isLoggedIn.mockReturnValue(true);
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    await userService.addFavorite(1);
    expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:3000/favorites/1', expect.objectContaining({ method: 'POST' }));
  });

  it('removeFavorite: deve remover um evento dos favoritos', async () => {
    authStore.isLoggedIn.mockReturnValue(true);
    fetch.mockResolvedValueOnce({ ok: true, status: 204 });
    await userService.removeFavorite(1);
    expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:3000/favorites/1', expect.objectContaining({ method: 'DELETE' }));
  });

  it('getParticipations: deve ir buscar os eventos em que o utilizador participa', async () => {
    authStore.isLoggedIn.mockReturnValue(true);
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: [] }) });
    await userService.getParticipations();
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('http://127.0.0.1:3000/users/me/participations'), expect.any(Object));
  });

  it('getWaitlist: deve ir buscar os eventos em que o utilizador está em lista de espera', async () => {
    authStore.isLoggedIn.mockReturnValue(true);
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: [] }) });
    await userService.getWaitlist();
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('http://127.0.0.1:3000/users/me/waitlist'), expect.any(Object));
  });
});