<template>
  <div class="px-10 py-16 text-white font-sans max-w-6xl mx-auto">
    <!-- User Info -->
    <div class="flex items-start justify-between mb-12">
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-3xl font-bold" v-if="!editingUsername">{{ username }}</h1>
          <div v-else class="flex items-center gap-2">
            <input
              v-model="newUsername"
              class="bg-transparent border-b border-white focus:outline-none text-white text-3xl"
              pattern="^[a-zA-Z0-9_]+$"
              placeholder="Enter new username"
            />
            <button
              @click="saveUsername"
              class="px-6 py-2 ml-2 text-sm font-medium border border-white text-white rounded-md hover:bg-white hover:text-black transition"
            >
              Save
            </button>
          </div>
        </div>
        <p class="text-lg text-stone-300">Welcome back!</p>

        <div class="flex gap-4 mt-4">
          <button @click="toggleUsernameEdit" class="px-4 py-2 border border-white rounded-md hover:bg-white hover:text-black">
            Change Username
          </button>
          <button class="px-4 py-2 border border-white rounded-md hover:bg-white hover:text-black">
            Change Password
          </button>
        </div>
      </div>

      <!-- Profile Picture -->
      <div class="flex flex-col items-center gap-3">
        <img
          :src="profileImage"
          alt="Profile"
          class="w-32 h-32 rounded-full border-4 border-white object-cover cursor-pointer hover:opacity-80"
          @click="triggerFileUpload"
        />
        <input type="file" @change="handleImageUpload" class="hidden" ref="fileInput" accept="image/*" />
      </div>
    </div>

    <!-- Saved Events -->
    <div class="mb-12">
      <h2 class="text-2xl font-semibold mb-3">Saved Events</h2>
      <div class="text-stone-400" v-if="!events.length">No events saved yet.</div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6" v-else>
        <div
          v-for="(event, index) in events"
          :key="index"
          class="relative bg-stone-800 rounded-xl p-4 hover:bg-stone-700 transition"
        >
          <router-link :to="`/event/${event.id}`" class="block">
            <img :src="event.image" class="w-full h-40 object-cover rounded-md mb-2" />
            <h3 class="font-semibold">{{ event.title }}</h3>
            <p class="text-sm text-stone-400">{{ event.date }}</p>
          </router-link>
          <button
            @click.stop="removeFavorite(index)"
            class="absolute top-2 right-2 bg-white/10 text-white hover:bg-red-600 rounded-full w-7 h-7 flex items-center justify-center"
            title="Remove from favorites"
          >
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="4" y1="4" x2="16" y2="16" />
              <line x1="16" y1="4" x2="4" y2="16" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Waitlist -->
    <div class="mb-12">
      <h2 class="text-2xl font-semibold mb-3">Waitlist</h2>
      <ul class="list-disc pl-5 space-y-1">
        <li v-for="(item, index) in waitlist" :key="index" class="text-stone-300">
          {{ item.name }} - Requested on {{ item.date }}
        </li>
      </ul>
    </div>

    <!-- Notifications -->
    <div class="mb-12">
      <h2 class="text-2xl font-semibold mb-3">Notifications</h2>

      <!-- Unread -->
      <h3 class="text-xl font-semibold mb-2">Unread</h3>
      <ul class="space-y-3 mb-6" v-if="unreadNotifications.length">
        <li
          v-for="(note, index) in unreadNotifications"
          :key="'unread-' + index"
          class="bg-stone-800 rounded-lg px-4 py-3"
        >
          <p class="text-white">{{ note.message }}</p>
          <p class="text-sm text-stone-400">{{ note.date }}</p>
          <button
            @click="markAsRead(note)"
            class="mt-2 px-3 py-1 text-sm bg-[#FFD300] text-black rounded hover:bg-white"
          >
            Mark as Read
          </button>
        </li>
      </ul>
      <p v-else class="text-stone-400 mb-6">No unread notifications.</p>

      <!-- Read -->
      <h3 class="text-xl font-semibold mb-2">Read</h3>
      <ul class="space-y-3" v-if="readNotifications.length">
        <li
          v-for="(note, index) in readNotifications"
          :key="'read-' + index"
          class="bg-stone-800 rounded-lg px-4 py-3"
        >
          <p class="text-white">{{ note.message }}</p>
          <p class="text-sm text-stone-400">{{ note.date }}</p>
          <button
            @click="markAsUnread(note)"
            class="mt-2 px-3 py-1 text-sm bg-stone-600 text-white rounded hover:bg-stone-500"
          >
            Mark as Unread
          </button>
        </li>
      </ul>
      <p v-else class="text-stone-400">No read notifications.</p>
    </div>
  </div>
</template>

<script>
import { userStore } from '../stores/userStore';

export default {
  name: "UserView",
  computed: {
    profileImage: {
      get() {
        return userStore.profileImage || '/defaultProfile.svg';
      },
      set(value) {
        userStore.profileImage = value;
        localStorage.setItem("userProfileImage", value);
      }
    },
    unreadNotifications() {
      return this.notifications.filter(n => !n.read);
    },
    readNotifications() {
      return this.notifications.filter(n => n.read);
    }
  },
  data() {
    return {
      newUsername: '',
      editingUsername: false,
      username: userStore.username,
      events: [
        { id: 1, image: "/images/evento1.png", title: "Sunset Party", date: "May 25, 2025" },
        { id: 2, image: "/images/evento2.jpg", title: "Tech Meetup", date: "Jun 1, 2025" }
      ],
      waitlist: [
        { name: "Hidden Festival", date: "May 12, 2025" },
        { name: "Jazz Night", date: "May 14, 2025" }
      ],
      notifications: [
        { message: "Your ticket to Sunset Party was approved!", date: "May 10, 2025", read: false },
        { message: "Event Tech Meetup is starting soon!", date: "May 15, 2025", read: true }
      ]
    };
  },
  mounted() {
    const storedImage = localStorage.getItem("userProfileImage");
    if (!userStore.profileImage && storedImage) {
      userStore.profileImage = storedImage;
    }

    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      this.username = storedUsername;
      userStore.username = storedUsername;
    }

    this.newUsername = this.username;
  },
  methods: {
    handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const imageURL = URL.createObjectURL(file);
        this.profileImage = imageURL;
      }
    },
    triggerFileUpload() {
      this.$refs.fileInput.click();
    },
    toggleUsernameEdit() {
      this.editingUsername = true;
      this.newUsername = this.username;
    },
    saveUsername() {
      const valid = /^[a-zA-Z0-9_]+$/.test(this.newUsername);
      if (valid && this.newUsername.trim() !== "") {
        this.username = this.newUsername;
        this.editingUsername = false;
        localStorage.setItem("username", this.username);
      } else {
        alert("Invalid username. Only letters, numbers, and underscores are allowed.");
      }
    },
    removeFavorite(index) {
      this.events.splice(index, 1);
    },
    markAsRead(notification) {
      notification.read = true;
    },
    markAsUnread(notification) {
      notification.read = false;
    }
  }
};
</script>

<style scoped>
</style>
