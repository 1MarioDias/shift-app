import { adminService } from '../../api/adminService';
import { authStore } from '../../stores/authStore';

// Simular o authStore e o fetch
jest.mock('../../stores/authStore');
global.fetch = jest.fn();

describe('Serviço de Administração', () => {
  beforeEach(() => {
    fetch.mockClear();
    authStore.isAdmin.mockClear();
    authStore.getAuthHeaders.mockClear();
  });

  it('getUsers: deve ir buscar todos os utilizadores', async () => {
    authStore.isAdmin.mockReturnValue(true);
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: [] }) });
    await adminService.getUsers();
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('http://127.0.0.1:3000/users'), expect.any(Object));
  });

  it('getUsers: deve dar erro se não for admin', async () => {
    authStore.isAdmin.mockReturnValue(false);
    await expect(adminService.getUsers()).rejects.toThrow('Administrator privileges required.');
  });

  it('deleteUser: deve apagar um utilizador', async () => {
    authStore.isAdmin.mockReturnValue(true);
    fetch.mockResolvedValueOnce({ ok: true, status: 204 });
    await adminService.deleteUser(2);
    expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:3000/users/2', expect.objectContaining({ method: 'DELETE' }));
  });

  it('getComments: deve ir buscar todos os comentários', async () => {
    authStore.isAdmin.mockReturnValue(true);
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: [] }) });
    await adminService.getComments();
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('http://127.0.0.1:3000/comments'), expect.any(Object));
  });

  it('deleteComment: deve apagar qualquer comentário', async () => {
    authStore.isAdmin.mockReturnValue(true);
    fetch.mockResolvedValueOnce({ ok: true, status: 204 });
    await adminService.deleteComment(5);
    expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:3000/comments/5', expect.objectContaining({ method: 'DELETE' }));
  });
});