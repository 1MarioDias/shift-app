<template>
  <div class="px-10 py-10 text-white font-sans max-w-6xl mx-auto">
    <!-- event -->
    <div class="relative w-full mx-auto rounded-xl overflow-hidden mb-5">
      <img :src="imagem" alt="Event Image" class="w-full h-[300px] w-[1400px] object-cover" />
    </div>

    <div class="flex items-start justify-between mb-[15px]">
      <p class="text-base leading-relaxed text-stone-50 max-md:text-sm max-w-[700px]">
        {{ data }}, {{ localizacao }}
      </p>
      <p class="text-base leading-relaxed text-stone-50 max-md:text-sm max-w-[700px] text-right">
        {{ tipoEvento }}, {{ hora }}
      </p>
    </div>

    <h2 class="mt-5 text-4xl font-bold mb-[2px]">{{ titulo }}</h2>
    <p class="mt-1 text-base leading-relaxed text-stone-50 max-md:text-sm max-w-[700px] mb-[10px]">{{ nomeAutor }}</p>

    <div class="mt-5 text-base leading-relaxed text-stone-50 max-md:text-sm max-w-[1400px]">
      <p>{{ descricao }}</p>
      <h2 class=" text-2xl font-bold mb-[10px] mt-10">Important Links</h2>
      <a :href="linksRelevantes" target="_blank" v-if="linksRelevantes" class="font-bold text-[#FFD300] hover:text-white mt-5">
        <p>Youtube</p>
      </a>
    </div>

    <!-- Comment Section -->
    <div class="mt-10 max-w-[1400px]">
      <h3 class="text-xl font-semibold mb-4">Comments</h3>

      <form @submit.prevent="addComment" class="mb-6">
        <input
          v-model="newComment"
          placeholder="Your comment..."
          class="w-full p-2 rounded bg-stone-800 text-white border border-stone-700"
        />
        <button
          type="submit"
          class="mt-5 px-4 py-2 bg-[#FFD300] text-black rounded hover:bg-white"
        >
          Post Comment
        </button>
      </form>

      <!-- Hardcoded Comments -->
      <div class="mt-5 space-y-4">
        <div class="flex items-start gap-3">
          <img src="/defaultProfile.svg" alt="User" class="mb-3 w-10 h-10 rounded-full object-cover" />
          <div>
            <p class="font-semibold">UserName</p>
            <p>This is a comment.</p>
          </div>
        </div>
        <div class="flex items-start gap-3">
          <img src="/defaultProfile.svg" alt="User" class="mb-3 w-10 h-10 rounded-full object-cover" />
          <div>
            <p class="font-semibold">UserName2</p>
            <p>This is a second comment.</p>
          </div>
        </div>

        <!-- Dynamic Comments -->
        <div
          v-for="(comment, index) in comments"
          :key="index"
          class="flex items-start gap-3"
        >
          <img :src="profileImage" alt="User" class="mb-3 w-10 h-10 rounded-full object-cover" />
          <div>
            <p class="font-semibold">User1</p>
            <p>{{ comment }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>




<script>
import { userStore } from '../stores/userStore'

export default {
  name: 'Event',

  data() {
    return {
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
    const stored = localStorage.getItem(`comments-event-${this.idEvent}`);
    if (stored) {
      this.comments = JSON.parse(stored);
    }
  },

  methods: {
    addComment() {
      const text = this.newComment.trim();
      if (text) {
        this.comments.push(text);
        localStorage.setItem(`comments-event-${this.idEvent}`, JSON.stringify(this.comments));
        this.newComment = '';
      }
    }
  },

  props: {
    nomeAutor: {
      type: String,
      default: "Author Name"
    },
    titulo: {
      type: String,
      default: "Event Title"
    },
    idEvent: {
      type: Number,
      default: 1
    },
    idAutor: {
      type: Number,
      default: 1
    },
    dataCriacao: {
      type: String,
      default: "1/1/2000"
    },
    imagem: {
      type: String,
      default: "../../public/images/evento1.png"
    },
    descricao: {
      type: String,
      default: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nunc odio, dictum sit amet dignissim vitae, pretium vitae lorem. Nullam magna nulla, eleifend cursus enim at, egestas posuere eros. Integer dignissim et lacus id aliquam. Curabitur semper sed libero in vestibulum. Interdum et malesuada fames ac ante ipsum primis in faucibus. Donec rhoncus neque nec dui auctor, a eleifend nunc faucibus. Curabitur sit amet erat dolor. Nulla et nisl felis. Duis ultricies erat ac metus posuere, sit amet auctor ante facilisis. Etiam quis euismod quam, id tristique est. Curabitur in felis ex. Morbi diam massa, fermentum vel aliquet ac, placerat at leo. Vivamus semper ut arcu eget imperdiet. Etiam id risus semper, commodo sem ut, porta purus. Nulla in commodo mauris. Curabitur pharetra elementum lobortis. Suspendisse sit amet tellus dolor. Aliquam commodo aliquet ultrices. Suspendisse ullamcorper in dolor id lobortis. Pellentesque mollis in lorem non suscipit. Fusce mattis aliquam justo vel aliquam. Cras vel nisl leo. Nulla facilisi. Praesent maximus, justo eget laoreet tincidunt, risus elit rutrum lorem, quis auctor nibh magna sit amet eros. Cras sed urna eget dui congue egestas nec et justo. Maecenas commodo sed lacus non semper. Ut porttitor ultricies turpis, sit amet convallis felis feugiat et. Phasellus malesuada condimentum felis, at blandit quam imperdiet ac. Phasellus congue tortor sit amet pulvinar finibus. Cras placerat eu est vitae auctor. Nunc nunc lacus, congue vitae molestie non, tincidunt id magna."
    },
    data: {
      type: String,
      default: "1/1/2025"
    },
    hora: {
      type: String,
      default: "12:00"
    },
    localizacao: {
      type: String,
      default: "Porto"
    },
    tipoEvento: {
      type: String,
      default: "Party"
    },
    maxParticipantes: {
      type: Number,
      default: 200
    },
    estado: {
      type: String,
      default: ""
    },
    visualizacoes: {
      type: Number,
      default: 2
    },
    linksRelevantes: {
      type: String,
      default: "https://www.youtube.com/"
    },
    isPublic: {
      type: Boolean,
      default: true
    }
  }
};
</script>
