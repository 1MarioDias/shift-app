import { notificationsService } from '../../api/notifications';
import { authStore } from '../../stores/authStore';

// Simular o authStore e o fetch
jest.mock('../../stores/authStore');
global.fetch = jest.fn();

describe('Serviço de Notificações', () => {
  beforeEach(() => {
    fetch.mockClear();
    authStore.isLoggedIn.mockClear();
    authStore.getAuthHeaders.mockClear();
  });

  it('listUserNotifications: deve ir buscar as notificações se o utilizador tiver login', async () => {
    authStore.isLoggedIn.mockReturnValue(true);
    const resposta = { data: [{ id: 1, message: 'Nova notificação' }] };
    fetch.mockResolvedValueOnce({ ok: true, json: async () => resposta });

    const resultado = await notificationsService.listUserNotifications();

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('http://127.0.0.1:3000/notifications'), expect.any(Object));
    expect(resultado).toEqual(resposta);
  });

  it('listUserNotifications: deve dar erro se o utilizador não tiver login', async () => {
    authStore.isLoggedIn.mockReturnValue(false);
    await expect(notificationsService.listUserNotifications()).rejects.toThrow('Authentication required.');
  });

  it('updateNotificationStatus: deve marcar uma notificação como lida', async () => {
    authStore.isLoggedIn.mockReturnValue(true);
    const idNotificacao = 1;
    const resposta = { message: 'Notification updated' };
    fetch.mockResolvedValueOnce({ ok: true, json: async () => resposta });

    await notificationsService.updateNotificationStatus(idNotificacao);

    expect(fetch).toHaveBeenCalledWith(`http://127.0.0.1:3000/notifications/${idNotificacao}`, expect.objectContaining({
      method: 'PATCH',
      body: JSON.stringify({ isRead: true }),
    }));
  });
});