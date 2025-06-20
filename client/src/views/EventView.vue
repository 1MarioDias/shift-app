<template>
  <div>
  <div v-if="isLoading" class="flex justify-center items-center h-screen">
    <p class="text-white text-2xl">Loading Event...</p>
  </div>
  <div v-else-if="error" class="flex justify-center items-center h-screen">
    <p class="text-red-500 text-2xl">{{ error }}</p>
  </div>
  <div v-else-if="evento" class="px-10 py-10 text-white font-sans max-w-6xl mx-auto">
    <!-- Event Image -->
    <div class="relative w-full mx-auto rounded-xl overflow-hidden mb-5">
      <img :src="evento.imagem" alt="Event Image" class="w-full h-[300px] object-cover" />
    </div>

    <!-- Info + Buttons -->
    <div class="flex items-start justify-between mb-[15px]">
      <p class="text-base text-stone-50">{{ formattedDate }}, {{ evento.localizacao }}</p>
      <div class="flex items-center gap-4">
        <!-- Join / Favorite Buttons -->
        <div v-if="isLoggedIn" class="flex items-center gap-4">
          <button
            @click="handleParticipation"
            :disabled="isProcessingParticipation"
            class="px-4 py-1 text-sm font-medium rounded border transition"
            :class="participationButtonClass"
          >
            {{ participationButtonText }}
          </button>
          <button @click="toggleFavorite" :disabled="isProcessingFavorite" class="p-2 rounded-full hover:bg-stone-700 transition">
            <svg
              :class="isFavorited ? 'text-red-500' : 'text-white'"
              class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
        <!-- Admin/Owner Buttons -->
        <div v-if="canManageEvent" class="flex items-center gap-4">
          <button @click="openEditModal" class="px-4 py-1 text-sm font-medium rounded border border-stone-500 text-stone-300 hover:bg-stone-700 transition">
            Edit Event
          </button>
          <button
            @click="handleDeleteEvent"
            :disabled="isProcessingDelete"
            class="px-4 py-1 text-sm font-medium rounded bg-red-800 text-white hover:bg-red-700 transition disabled:opacity-50"
          >
            <span v-if="isProcessingDelete">Deleting...</span>
            <span v-else>Delete</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Title -->
    <h1 class="text-4xl font-bold mb-[10px]">{{ evento.titulo }}</h1>
    <p class="text-base text-stone-50 mb-[10px]">by {{ evento.nomeAutor }}</p>

    <!-- Description & Links -->
    <div class="mt-5 text-base text-stone-50 max-w-[1400px]">
      <p class="whitespace-pre-wrap">{{ evento.descricao }}</p>
      <div v-if="evento.linksRelevantes">
        <h2 class="text-2xl font-bold mb-[10px] mt-10">Important Links</h2>
        <a :href="evento.linksRelevantes" target="_blank" class="font-bold text-[#FFD300] hover:text-white mt-5">
          <p>{{ evento.linksRelevantes }}</p>
        </a>
      </div>
    </div>

    <!-- Comments -->
    <div class="mt-10 max-w-[1400px]">
      <h3 class="text-xl font-semibold mb-4">Comments ({{ comments.length }})</h3>
      <form @submit.prevent="addComment" class="mb-6" v-if="isLoggedIn">
        <input v-model="newComment" placeholder="Your comment..." class="w-full p-3 rounded-md bg-black/20 backdrop-blur-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#FFD300] focus:border-transparent transition" />
        <button type="submit" class="mt-2 px-4 py-1 text-sm font-medium rounded bg-[#FFD300] text-black hover:bg-white">Post Comment</button>
      </form>
      <div class="space-y-4">
        <div v-if="comments.length === 0">
            <p>No comments yet. Be the first to comment!</p>
        </div>
        <div v-for="(comment, index) in comments" :key="comment.id" class="flex items-start space-x-3">
          <img :src="profileImage" alt="User" class="w-10 h-10 rounded-full" />
          <div>
            <p class="font-semibold">{{ comment.username }}</p>
            <p class="text-stone-300">{{ comment.text }}</p>
            <button
              v-if="comment.userId === userId"
              @click="deleteComment(comment.id, index)"
              class="text-sm text-red-400 hover:text-red-600 mt-1"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- Edit Event Modal -->
  <div v-if="isEditModalVisible" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
    <div class="bg-stone-900/70 border border-stone-700 rounded-xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-3xl font-bold text-[#FFD300]">Edit Event</h2>
      </div>
      <form @submit.prevent="handleUpdateEvent" class="space-y-5">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Title</label>
          <input type="text" v-model="editableEventData.title" class="w-full bg-black/20 backdrop-blur-lg border rounded-md p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFD300] border-white/10" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Description</label>
          <textarea v-model="editableEventData.description" rows="4" class="w-full bg-black/20 backdrop-blur-lg border rounded-md p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFD300] border-white/10"></textarea>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Location</label>
            <input type="text" v-model="editableEventData.location" class="w-full bg-black/20 backdrop-blur-lg border rounded-md p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFD300] border-white/10" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Event Type</label>
            <select v-model="editableEventData.eventType" class="w-full bg-black/20 backdrop-blur-lg border rounded-md p-3 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#FFD300] border-white/10">
              <option class="text-black">Party</option>
              <option class="text-black">Festival</option>
              <option class="text-black">Concert</option>
              <option class="text-black">Workshop</option>
              <option class="text-black">Other</option>
            </select>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Date</label>
            <input type="date" v-model="editableEventData.eventDate" class="w-full bg-black/20 backdrop-blur-lg border rounded-md p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFD300] border-white/10" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Time</label>
            <input type="time" v-model="editableEventData.eventTime" class="w-full bg-black/20 backdrop-blur-lg border rounded-md p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFD300] border-white/10" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Relevant Link (Optional)</label>
          <input type="url" v-model="editableEventData.linksRelevantes" placeholder="https://example.com" class="w-full bg-black/20 backdrop-blur-lg border rounded-md p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFD300] border-white/10" />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Max Participants (Optional)</label>
            <input type="number" v-model.number="editableEventData.maxParticipants" placeholder="Leave empty for unlimited" class="w-full bg-black/20 backdrop-blur-lg border rounded-md p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFD300] border-white/10" />
          </div>
        </div>
        <div class="mt-6 flex justify-end gap-4">
          <button type="button" @click="closeEditModal" class="px-4 py-2 rounded border border-stone-600 hover:bg-stone-700 transition">Cancel</button>
          <button type="submit" :disabled="isProcessingUpdate" class="px-4 py-2 rounded bg-[#FFD300] text-black hover:bg-white transition disabled:opacity-50">
            <span v-if="isProcessingUpdate">Saving...</span>
            <span v-else>Save Changes</span>
          </button>
        </div>
      </form>
    </div>
  </div>
  </div>
</template>

<script>
import { userStore } from '../stores/userStore';
import { authStore } from '../stores/authStore';
import { eventosService } from '../api/eventos';
import { userService } from '../api/user';

export default {
  name: 'EventView',
  data() {
    return {
      evento: null,
      isLoading: true,
      error: null,
      newComment: '',
      comments: [],
      isFavorited: false,
      userParticipationStatus: 'none', // 'none', 'attending', 'waitlisted'
      isLoadingStatus: true,
      isProcessingFavorite: false,
      isProcessingParticipation: false,
      isProcessingDelete: false,
      isProcessingUpdate: false,
      isEditModalVisible: false,
      editableEventData: {},
      currentUser: null,
    };
  },
  computed: {
    profileImage() {
      return userStore.profileImage || '/defaultProfile.svg';
    },
    userId() {
        // Corrigido: Usa os dados do utilizador obtidos via API.
        return this.currentUser ? this.currentUser.userId : null;
    },
    isLoggedIn() {
        return authStore.isLoggedIn();
    },
    isAdmin() {
        // Corrigido: Usa os dados do utilizador obtidos via API.
        return this.currentUser ? this.currentUser.role === 'Administrador' : false;
    },
    isAuthor() {
        // Esta verificação agora funcionará corretamente.
        if (!this.isLoggedIn || !this.evento || this.evento.idAutor == null || this.userId == null) {
            return false;
        }
        return String(this.evento.idAutor) === String(this.userId);
    },
    canManageEvent() {
        return this.isAuthor || this.isAdmin;
    },
    formattedDate() {
        if (!this.evento || !this.evento.data) return '';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(this.evento.data + 'T00:00:00').toLocaleDateString('pt-PT', options);
    },
    participationButtonText() {
        if (this.isProcessingParticipation) return 'Processing...';
        switch (this.userParticipationStatus) {
            case 'attending': return 'Cancel Registration';
            case 'waitlisted': return 'Leave Waitlist';
            default: return this.evento.cheio ? 'Join Waitlist' : 'Join Event';
        }
    },
    participationButtonClass() {
        switch (this.userParticipationStatus) {
            case 'attending':
            case 'waitlisted':
                return 'bg-red-600 text-white border-red-600 hover:bg-red-700';
            default:
                return this.evento.cheio
                    ? 'bg-transparent text-yellow-400 border-yellow-400 hover:bg-yellow-400 hover:text-black'
                    : 'bg-[#FFD300] text-black hover:bg-white';
        }
    }
  },
  async created() {
    const eventId = this.$route.params.id;
    if (eventId && !isNaN(parseInt(eventId))) {
      await this.loadEvent(eventId);
      await this.loadComments(eventId);
      if (this.isLoggedIn) {
          await this.loadUserStatus(eventId);
      }
    } else {
        this.error = "Invalid or missing Event ID.";
        this.isLoading = false;
    }
  },
  methods: {
    async loadEvent(id) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await eventosService.getEventById(id);
        this.evento = {
          id: response.eventId,
          titulo: response.title,
          idAutor: response.organizer ? response.organizer.organizerId : null,
          nomeAutor: response.organizer ? response.organizer.organizerName : 'Unknown Author',
          imagem: response.image || '/images/default-event.png',
          descricao: response.description,
          data: response.date,
          hora: response.time,
          localizacao: response.location,
          tipoEvento: response.eventType,
          linksRelevantes: response.linksRelevantes,
          cheio: response.maxParticipants !== null && response.currentParticipants >= response.maxParticipants,
          maxParticipants: response.maxParticipants,
          isPublic: response.isPublic
        };
      } catch (err) {
        this.error = err.message || 'Failed to load event details.';
        console.error(err);
      } finally {
        this.isLoading = false;
      }
    },
    async loadUserStatus(eventId) {
        this.isLoadingStatus = true;
        try {
            const [favRes, partRes, waitRes] = await Promise.all([
                userService.getFavorites({ pageSize: 1000 }),
                userService.getParticipations({ pageSize: 1000 }),
                userService.getWaitlist({ pageSize: 1000 })
            ]);

            this.isFavorited = favRes.data.some(e => e.eventId === parseInt(eventId));
            
            if (partRes.data.some(e => e.eventId === parseInt(eventId))) {
                this.userParticipationStatus = 'attending';
            } else if (waitRes.data.some(e => e.eventId === parseInt(eventId))) {
                this.userParticipationStatus = 'waitlisted';
            } else {
                this.userParticipationStatus = 'none';
            }
        } catch (error) {
            console.error("Failed to load user's event status:", error);
        } finally {
            this.isLoadingStatus = false;
        }
    },
    async loadComments(eventId) {
        try {
            const response = await eventosService.getCommentsForEvent(eventId);
            this.comments = response.data.map(comment => ({
                id: comment.commentId,
                username: comment.user.userName,
                text: comment.text,
                userId: comment.user.userId
            }));
        } catch (error) {
            console.error('Failed to load comments:', error);
        }
    },
    async addComment() {
      const text = this.newComment.trim();
      if (!text || !this.evento) return;

      try {
        const newCommentData = await eventosService.addCommentToEvent(this.evento.id, text);
        this.comments.unshift({
            id: newCommentData.commentId,
            username: newCommentData.user.userName,
            text: newCommentData.text,
            userId: newCommentData.user.userId
        });
        this.newComment = '';
      } catch (error) {
          console.error('Failed to add comment:', error);
          alert(`Error: ${error.message}`);
      }
    },
    async deleteComment(commentId, index) {
        if (!confirm('Are you sure you want to delete this comment?')) return;
        try {
            await eventosService.deleteComment(commentId);
            this.comments.splice(index, 1);
        } catch (error) {
            console.error('Failed to delete comment:', error);
            alert(`Error: ${error.message}`);
        }
    },
    canDeleteComment(comment) {
      if (!this.isLoggedIn) return false;
      // Esta verificação agora funcionará corretamente.
      return this.isAdmin || (comment.user && String(comment.user.userId) === String(this.userId));
    },
    async toggleFavorite() {
      if (!this.evento) return;
      this.isProcessingFavorite = true;
      try {
        if (this.isFavorited) {
          await userService.removeFavorite(this.evento.id);
          this.isFavorited = false;
        } else {
          await userService.addFavorite(this.evento.id);
          this.isFavorited = true;
        }
      } catch (error) {
        alert(`Error: ${error.message}`);
      } finally {
        this.isProcessingFavorite = false;
      }
    },
    async handleParticipation() {
      if (!this.evento) return;
      this.isProcessingParticipation = true;
      try {
        if (this.userParticipationStatus === 'attending' || this.userParticipationStatus === 'waitlisted') {
          await eventosService.cancelParticipation(this.evento.id);
          this.userParticipationStatus = 'none';
          alert('Your registration has been successfully cancelled.');
        } else {
          const response = await eventosService.registerForEvent(this.evento.id);
          alert(response.message);
          this.userParticipationStatus = response.participation.status === 'confirmado' ? 'attending' : 'waitlisted';
        }
      } catch (error) {
        alert(`Error: ${error.message}`);
      } finally {
        this.isProcessingParticipation = false;
      }
    },
    async handleDeleteEvent() {
      if (!confirm('Are you sure you want to permanently delete this event? This action cannot be undone.')) {
        return;
      }
      this.isProcessingDelete = true;
      try {
        await eventosService.deleteEvent(this.evento.id);
        alert('Event deleted successfully.');
        this.$router.push('/');
      } catch (error) {
        alert(`Error deleting event: ${error.message}`);
        console.error(error);
      } finally {
        this.isProcessingDelete = false;
      }
    },
    openEditModal() {
      this.editableEventData = {
        title: this.evento.titulo,
        description: this.evento.descricao,
        location: this.evento.localizacao,
        eventType: this.evento.tipoEvento,
        eventDate: this.evento.data,
        eventTime: this.evento.hora,
        maxParticipants: this.evento.maxParticipants,
        isPublic: this.evento.isPublic,
        linksRelevantes: this.evento.linksRelevantes || '',
      };
      this.isEditModalVisible = true;
    },
    closeEditModal() {
      this.isEditModalVisible = false;
    },
    async handleUpdateEvent() {
      this.isProcessingUpdate = true;
      const payload = {};
      const originalEvent = {
        title: this.evento.titulo,
        description: this.evento.descricao,
        location: this.evento.localizacao,
        eventType: this.evento.tipoEvento,
        eventDate: this.evento.data,
        eventTime: this.evento.hora,
        maxParticipants: this.evento.maxParticipants,
        isPublic: this.evento.isPublic,
        linksRelevantes: this.evento.linksRelevantes || '',
      };

      // Compara cada campo e adiciona ao payload se for diferente
      for (const key in this.editableEventData) {
        if (this.editableEventData[key] !== originalEvent[key]) {
          payload[key] = this.editableEventData[key];
        }
      }
      
      // Trata o caso de o campo de participantes ser esvaziado
      if (payload.maxParticipants === '') {
        payload.maxParticipants = null;
      }

      if (Object.keys(payload).length === 0) {
        this.isProcessingUpdate = false;
        this.closeEditModal();
        return;
      }

      try {
        await eventosService.patchEvent(this.evento.id, payload);
        alert('Event updated successfully!');
        this.closeEditModal();
        await this.loadEvent(this.evento.id); // Recarrega os dados do evento
      } catch (error) {
        alert(`Error updating event: ${error.message}`);
        console.error(error);
      } finally {
        this.isProcessingUpdate = false;
      }
    },
  },
  async created() {
    // Primeiro, vai buscar os dados do utilizador autenticado à API.
    if (authStore.isLoggedIn()) {
        try {
            this.currentUser = await userService.getProfile();
        } catch (error) {
            console.error("Failed to fetch current user profile:", error);
        }
    }

    // Depois, carrega os dados do evento e comentários.
    const eventId = this.$route.params.id;
    await this.loadEvent(eventId);
    await this.loadComments(eventId);
    if (this.isLoggedIn) {
        await this.loadUserStatus(eventId);
    }
  },
};
</script>