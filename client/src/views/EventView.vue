<template>
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
        <!-- Join / Waitlist Button -->
        <button
          @click="handleJoinEvent"
          class="px-4 py-1 text-sm font-medium rounded border transition"
          :class="evento.cheio
            ? 'bg-transparent text-yellow-400 border-yellow-400 hover:bg-yellow-400 hover:text-black'
            : 'bg-[#FFD300] text-black hover:bg-white'"
        >
          {{ evento.cheio ? 'Join Waitlist' : 'Join Event' }}
        </button>
        <!-- Favorite Button -->
        <button @click="toggleFavorite" class="p-2 rounded-full hover:bg-stone-700 transition">
          <svg
            :class="isFavorited ? 'text-red-500' : 'text-white'"
            class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
          </svg>
        </button>
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
        <input v-model="newComment" placeholder="Your comment..." class="w-full p-2 rounded bg-stone-800 border border-stone-700" />
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
</template>

<script>
import { userStore } from '../stores/userStore';
import { authStore } from '../stores/authStore';
import { eventosService } from '../api/eventos';

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
    };
  },
  computed: {
    profileImage() {
      return userStore.profileImage || '/defaultProfile.svg';
    },
    username() {
      return userStore.username || 'User';
    },
    userId() {
        return userStore.userId;
    },
    isLoggedIn() {
        return authStore.isLoggedIn();
    },
    formattedDate() {
        if (!this.evento || !this.evento.data) return '';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(this.evento.data + 'T00:00:00').toLocaleDateString('pt-PT', options);
    }
  },
  async created() {
    const eventId = this.$route.params.id;
    if (eventId && !isNaN(parseInt(eventId))) {
      await this.loadEvent(eventId);
      await this.loadComments(eventId);
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
          nomeAutor: response.organizer ? response.organizer.organizerName : 'Unknown Author',
          imagem: response.image || '/images/default-event.png',
          descricao: response.description,
          data: response.date,
          hora: response.time,
          localizacao: response.location,
          tipoEvento: response.eventType,
          linksRelevantes: response.linksRelevantes,
          cheio: response.maxParticipants !== null && response.currentParticipants >= response.maxParticipants,
        };
      } catch (err) {
        this.error = err.message || 'Failed to load event details.';
        console.error(err);
      } finally {
        this.isLoading = false;
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
        const response = await eventosService.addCommentToEvent(this.evento.id, text);
        const newCommentData = response.comment;
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
    toggleFavorite() {
      this.isFavorited = !this.isFavorited;
      // TODO: Implementar chamada à API para adicionar/remover favorito
      alert('Favorite functionality not implemented yet.');
    },
    handleJoinEvent() {
      // TODO: Implementar chamada à API para se inscrever no evento ou lista de espera
      if (this.evento.cheio) {
        alert("Waitlist functionality not implemented yet.");
      } else {
        alert("Join event functionality not implemented yet.");
      }
    },
  }
};
</script>