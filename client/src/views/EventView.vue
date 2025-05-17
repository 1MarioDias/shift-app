<template>
  <div class="px-10 py-10 text-white font-sans max-w-6xl mx-auto">
    <!-- Event Image -->
    <div class="relative w-full mx-auto rounded-xl overflow-hidden mb-5">
      <img :src="evento.imagem" alt="Event Image" class="w-full h-[300px] object-cover" />
    </div>

    <div class="flex items-start justify-between mb-[15px]">
      <p class="text-base text-stone-50">{{ evento.data }}, {{ evento.localizacao }}</p>
      <p class="text-base text-stone-50 text-right">{{ evento.tipoEvento }}, {{ evento.hora }}</p>
    </div>

    <h2 class="mt-5 text-4xl font-bold mb-[2px]">{{ evento.titulo }}</h2>
    <p class="text-base text-stone-50 mb-[10px]">{{ evento.nomeAutor }}</p>

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

      <!-- Hardcoded + Dynamic Comments -->
      <div class="mt-5 space-y-4">
        <div class="flex items-start gap-3">
          <img src="/defaultProfile.svg" class="w-10 h-10 rounded-full" />
          <div><p class="font-semibold">UserName</p><p>This is a comment.</p></div>
        </div>
        <div class="flex items-start gap-3">
          <img src="/defaultProfile.svg" class="w-10 h-10 rounded-full" />
          <div><p class="font-semibold">UserName2</p><p>This is a second comment.</p></div>
        </div>

        <div v-for="(comment, index) in comments" :key="index" class="flex items-start gap-3">
          <img :src="profileImage" class="w-10 h-10 rounded-full" />
          <div><p class="font-semibold">{{ username }}</p><p>{{ comment }}</p></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { userStore } from '../stores/userStore'

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
        tipoEvento: '',
        linksRelevantes: ''
      },
      newComment: '',
      comments: []
    };
  },
  computed: {
    profileImage() {
      return userStore.profileImage || '/defaultProfile.svg';
    }
  },
  mounted() {
    const id = parseInt(this.$route.params.id);
    this.loadEvent(id);

    const stored = localStorage.getItem(`comments-event-${id}`);
    if (stored) {
      this.comments = JSON.parse(stored);
    }
  },
  computed: {
    profileImage() {
        return userStore.profileImage || '/defaultProfile.svg';
    },
    username() {
        return userStore.username || 'User';
    }
    },

  methods: {
    loadEvent(id) {
      // Exemplo estático (futuramente pode vir de API)
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
          tipoEvento: "Party",
          linksRelevantes: "https://www.youtube.com/"
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
          tipoEvento: "Workshop",
          linksRelevantes: "https://www.youtube.com/"
        }
      ];

      const found = eventos.find(e => e.id === id);
      if (found) {
        this.evento = found;
      } else {
        this.evento.titulo = "Event Not Found";
      }
    },
    addComment() {
      const text = this.newComment.trim();
      if (text) {
        this.comments.push(text);
        localStorage.setItem(`comments-event-${this.evento.id}`, JSON.stringify(this.comments));
        this.newComment = '';
      }
    }
  }
}
</script>
