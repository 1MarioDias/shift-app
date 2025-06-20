import { eventosService } from '../../api/eventos';
import { authStore } from '../../stores/authStore';

// Simular o authStore e o fetch
jest.mock('../../stores/authStore');
global.fetch = jest.fn();

describe('Serviço de Eventos', () => {
  beforeEach(() => {
    fetch.mockClear();
    authStore.isLoggedIn.mockClear();
    authStore.isAdmin.mockClear();
    authStore.getAuthHeaders.mockClear();
  });

  // Testes de Gestão de Eventos
  describe('Gestão de Eventos', () => {
    it('getPublicEvents: deve ir buscar eventos públicos', async () => {
      const resposta = { data: [{ id: 1, titulo: 'Evento Público' }] };
      fetch.mockResolvedValueOnce({ ok: true, json: async () => resposta });
      await eventosService.getPublicEvents();
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('http://127.0.0.1:3000/events'));
    });

    it('getAdminEvents: deve ir buscar todos os eventos para um admin', async () => {
      authStore.isAdmin.mockReturnValue(true);
      const resposta = { data: [{ id: 2, titulo: 'Evento Privado' }] };
      fetch.mockResolvedValueOnce({ ok: true, json: async () => resposta });
      await eventosService.getAdminEvents();
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('http://127.0.0.1:3000/events'), expect.any(Object));
    });

    it('getEventById: deve ir buscar um evento específico', async () => {
      const resposta = { id: 1, titulo: 'Evento Específico' };
      fetch.mockResolvedValueOnce({ ok: true, json: async () => resposta });
      await eventosService.getEventById(1);
      expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:3000/events/1', expect.any(Object));
    });

    it('createEvent: deve criar um evento se o utilizador tiver login', async () => {
      authStore.isLoggedIn.mockReturnValue(true);
      const formData = new FormData();
      formData.append('titulo', 'Novo Evento');
      fetch.mockResolvedValueOnce({ ok: true, status: 201, json: async () => ({ id: 3 }) });
      await eventosService.createEvent(formData);
      expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:3000/events', expect.objectContaining({ method: 'POST' }));
    });

    it('patchEvent: deve atualizar um evento se o utilizador tiver permissão', async () => {
      authStore.isLoggedIn.mockReturnValue(true);
      const dados = { titulo: 'Título Atualizado' };
      fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ id: 1, ...dados }) });
      await eventosService.patchEvent(1, dados);
      expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:3000/events/1', expect.objectContaining({ method: 'PATCH' }));
    });

    it('deleteEvent: deve apagar um evento se o utilizador tiver permissão', async () => {
      authStore.isLoggedIn.mockReturnValue(true);
      fetch.mockResolvedValueOnce({ ok: true, status: 204 });
      const resultado = await eventosService.deleteEvent(1);
      expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:3000/events/1', expect.objectContaining({ method: 'DELETE' }));
      expect(resultado.success).toBe(true);
    });
  });

  // Testes de Comentários
  describe('Gestão de Comentários', () => {
    it('getCommentsForEvent: deve ir buscar os comentários de um evento', async () => {
      fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: [] }) });
      await eventosService.getCommentsForEvent(1);
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/comments'), expect.any(Object));
    });

    it('addCommentToEvent: deve adicionar um comentário a um evento', async () => {
      authStore.isLoggedIn.mockReturnValue(true);
      fetch.mockResolvedValueOnce({ ok: true, status: 201, json: async () => ({ id: 10 }) });
      await eventosService.addCommentToEvent(1, 'Ótimo evento!');
      expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:3000/events/1/comments', expect.objectContaining({ method: 'POST' }));
    });

    it('deleteComment: deve apagar um comentário', async () => {
      authStore.isLoggedIn.mockReturnValue(true);
      fetch.mockResolvedValueOnce({ ok: true, status: 204 });
      await eventosService.deleteComment(10);
      expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:3000/comments/10', expect.objectContaining({ method: 'DELETE' }));
    });
  });

  // Testes de Participações
  describe('Gestão de Participações', () => {
    it('registerForEvent: deve registar um utilizador num evento', async () => {
      authStore.isLoggedIn.mockReturnValue(true);
      fetch.mockResolvedValueOnce({ ok: true, status: 201, json: async () => ({ message: 'Success' }) });
      await eventosService.registerForEvent(1);
      expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:3000/events/1/participations', expect.objectContaining({ method: 'POST' }));
    });

    it('cancelParticipation: deve cancelar a participação num evento', async () => {
      authStore.isLoggedIn.mockReturnValue(true);
      fetch.mockResolvedValueOnce({ ok: true, status: 204 });
      await eventosService.cancelParticipation(1);
      expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:3000/events/1/participations', expect.objectContaining({ method: 'DELETE' }));
    });
  });
});