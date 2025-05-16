<template>
  <div class="px-10 py-16 text-white font-sans max-w-6xl mx-auto">
    <div class="flex items-start justify-between mb-12">
      <!-- user info + change user/password -->
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
              class="px-6 py-2 ml-2 text-sm font-medium border border-white text-ehite rounded-md hover:bg-[white]  hover:text-black transition duration-200"
            >
              Save
            </button>
          </div>
        </div>
        <p class="text-lg text-stone-300">Welcome back!</p>

        <div class="flex gap-4 mt-4">
          <button
            @click="toggleUsernameEdit"
            class="px-4 py-2 border border-white text-white rounded-md hover:bg-white hover:text-black transition"
          >
            Change Username
          </button>
          <button
            class="px-4 py-2 border border-white text-white rounded-md hover:bg-white hover:text-black transition"
          >
            Change Password
          </button>
        </div>
      </div>

      <!-- profile pic -->
      <div class="flex flex-col items-center gap-3">
        <img
          :src="profileImage"
          alt="Profile"
          class="w-32 h-32 rounded-full border-4 border-white object-cover cursor-pointer hover:opacity-80 transition"
          @click="triggerFileUpload"
        />
        <input
          type="file"
          @change="handleImageUpload"
          class="hidden"
          ref="fileInput"
          accept="image/*"
        />
      </div>
    </div>

    <!-- events -->
    <div class="mb-12">
      <h2 class="text-2xl font-semibold mb-3">Saved Events</h2>
      <div class="text-stone-400" v-if="!events.length">No events saved yet.</div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6" v-else>
        <div
          v-for="(event, index) in events"
          :key="index"
          class="bg-stone-800 rounded-xl p-4"
        >
          <img :src="event.image" class="w-full h-40 object-cover rounded-md mb-2" />
          <h3 class="font-semibold text-white">{{ event.title }}</h3>
          <p class="text-sm text-stone-400">{{ event.date }}</p>
        </div>
      </div>
    </div>

    <!-- waitlist -->
    <div class="mb-12">
      <h2 class="text-2xl font-semibold mb-3">Waitlist</h2>
      <ul class="list-disc pl-5 space-y-1">
        <li
          v-for="(item, index) in waitlist"
          :key="index"
          class="text-stone-300"
        >
          {{ item.name }} - Requested on {{ item.date }}
        </li>
      </ul>
    </div>

    <!-- notifications -->
    <div class="mb-12">
      <h2 class="text-2xl font-semibold mb-3">Notifications</h2>
      <ul class="space-y-3">
        <li
          v-for="(note, index) in notifications"
          :key="index"
          class="bg-stone-800 rounded-lg px-4 py-3"
        >
          <p class="text-white">{{ note.message }}</p>
          <p class="text-sm text-stone-400">{{ note.date }}</p>
        </li>
      </ul>
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

  },
    data() {
      return {
            newUsername: '',
            editingUsername: false,
            username: userStore.username, 
        events: [
          { image: "/event1.jpg", title: "Sunset Party", date: "May 25, 2025" },
          { image: "/event2.jpg", title: "Tech Meetup", date: "Jun 1, 2025" }
        ],
        waitlist: [
          { name: "Hidden Festival", date: "May 12, 2025" },
          { name: "Jazz Night", date: "May 14, 2025" }
        ],
        notifications: [
          { message: "Your ticket to Sunset Party was approved!", date: "May 10, 2025" },
          { message: "Event Tech Meetup is starting soon!", date: "May 15, 2025" }
        ]
      };
    },

    

  //profile picture and username
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
    }
  }
};
</script>




<style scoped>
</style>
