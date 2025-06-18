<template>
  <div class="px-10 py-10 text-white font-sans max-w-6xl mx-auto">
    <!-- Event Image -->
    <div class="relative w-full mx-auto rounded-xl overflow-hidden mb-5">
      <img :src="evento.imagem" alt="Event Image" class="w-full h-[300px] object-cover" />
    </div>

    <!-- Info + Buttons -->
    <div class="flex items-start justify-between mb-[15px]">
      <p class="text-base text-stone-50">{{ evento.data }}, {{ evento.fullAddress }}</p>
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
        <button @click="toggleFavorite" class="focus:outline-none" :aria-label="isFavorited ? 'Remove from favorites' : 'Add to favorites'">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
            :class="isFavorited ? 'text-red-500' : 'text-white'"
            class="w-6 h-6 transition-colors duration-200"
          >
            <path
              fill-rule="evenodd"
              d="M12.001 4.529c2.349-2.532 6.364-2.532 8.713 0 2.295 2.474 2.31 6.415.043 8.902l-7.816 7.887a1 1 0 01-1.42 0l-7.816-7.887c-2.268-2.487-2.252-6.428.043-8.902 2.35-2.532 6.364-2.532 8.713 0z"
              clip-rule="evenodd"
            />
          </svg>
        </button>

        <p class="text-base text-stone-50">{{ evento.tipoEvento }}, {{ evento.hora }}</p>
      </div>
    </div>

    <!-- Title & Author -->
    <h2 class="mt-5 text-4xl font-bold mb-[2px]">{{ evento.titulo }}</h2>
    <p class="text-base text-stone-50 mb-[10px]">{{ evento.nomeAutor }}</p>

    <!-- Description & Links -->
    <div class="mt-5 text-base text-stone-50 max-w-[1400px]">
      <p>{{ evento.descricao }}</p>
      <h2 class="text-2xl font-bold mb-[10px] mt-10">Important Links</h2>
      <a :href="evento.linksRelevantes" target="_blank" class="font-bold text-[#FFD300] hover:text-white mt-5">
        <p>Youtube</p>
      </a>
    </div>

    <!-- Comments -->
    <div class="mt-10 max-w-[1400px]">
      <h3 class="text-xl font-semibold mb-4">Comments</h3>
      <form @submit.prevent="addComment" class="mb-6">
        <input v-model="newComment" placeholder="Your comment..." class="w-full p-2 rounded bg-stone-800 border border-stone-700" />
        <button type="submit" class="mt-5 px-4 py-2 bg-[#FFD300] text-black rounded hover:bg-white">Post Comment</button>
      </form>

      <div class="mt-5 space-y-4">
        <!-- Static Comments -->
        <div class="flex items-start gap-3">
          <img src="/defaultProfile.svg" class="w-10 h-10 rounded-full" />
          <div><p class="font-semibold">UserName</p><p>This is a comment.</p></div>
        </div>
        <div class="flex items-start gap-3">
          <img src="/defaultProfile.svg" class="w-10 h-10 rounded-full" />
          <div><p class="font-semibold">UserName2</p><p>This is a second comment.</p></div>
        </div>

        <!-- Dynamic Comments -->
        <div v-for="(comment, index) in comments" :key="index" class="flex items-start gap-3">
          <img :src="profileImage" class="w-10 h-10 rounded-full" />
          <div>
            <p class="font-semibold">{{ comment.username }}</p>
            <p>{{ comment.text }}</p>
            <button
              v-if="comment.username === username"
              @click="deleteComment(index)"
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

export default {
  name: 'EventView',
  data() {
    return {
      evento: {
        id: null,
        titulo: '',
        nomeAutor: '',
        imagem: '',
        descricao: '',
        data: '',
        hora: '',
        localizacao: '',
        fullAddress: '',
        tipoEvento: '',
        linksRelevantes: '',
        cheio: false // <- usado agora no lugar de "lotado"
      },
      newComment: '',
      comments: [],
      isFavorited: false
    };
  },
  computed: {
    profileImage() {
      return userStore.profileImage || '/defaultProfile.svg';
    },
    username() {
      return userStore.username || 'User';
    }
  },
  mounted() {
    const id = parseInt(this.$route.params.id);
    this.loadEvent(id);
  },
  methods: {
    loadEvent(id) {
      const eventos = [
        {
          id: 1,
          titulo: "Sunset Party",
          nomeAutor: "John Doe",
          imagem: "/images/evento1.png",
          descricao: "A sunset-themed party with music and drinks.",
          data: "2025-05-25",
          hora: "18:00",
          localizacao: "Porto",
          fullAddress: "Rua do Porto 69, Porto",
          tipoEvento: "Party",
          linksRelevantes: "https://www.youtube.com/",
          cheio: false
        },
        {
          id: 2,
          titulo: "Tech Meetup",
          nomeAutor: "Jane Smith",
          imagem: "/images/evento2.jpg",
          descricao: "Networking and talks about tech.",
          data: "2025-06-01",
          hora: "15:00",
          localizacao: "Lisbon",
          fullAddress: "Rua do Porto 69, Porto",
          tipoEvento: "Workshop",
          linksRelevantes: "https://www.youtube.com/",
          cheio: true
        }
      ];

      const found = eventos.find(e => e.id === id);
      if (found) {
        this.evento = found;
      } else {
        this.evento.titulo = "Event Not Found";
      }
    },
    toggleFavorite() {
      this.isFavorited = !this.isFavorited;
    },
    handleJoinEvent() {
      if (this.evento.cheio) {
        alert("You've been added to the waitlist.");
      } else {
        alert("Confirmed! You’re now registered for the event.");
      }
    },
    addComment() {
      const text = this.newComment.trim();
      if (text) {
        this.comments.push({
          username: this.username,
          text
        });
        this.newComment = '';
      }
    },
    deleteComment(index) {
      this.comments.splice(index, 1);
    }
  }
};
</script>
