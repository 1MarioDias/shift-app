<template>
  <section class="px-10 py-10 text-white font-sans">
    <div v-if="isLoading" class="text-center">Loading profile...</div>
    <div v-else-if="error" class="text-center text-red-500">{{ error }}</div>
    <div v-else-if="user" class="max-w-6xl mx-auto">
      <!-- User Info -->
      <div class="flex items-center gap-6 mb-12">
        <img :src="profileImage" alt="Profile" class="w-24 h-24 rounded-full object-cover border-2 border-stone-600">
        <div>
          <h1 class="text-4xl font-bold">{{ user.name }}</h1>
          <p class="text-stone-400">{{ user.email }}</p>
          <p class="text-stone-500 text-sm">Member since {{ formattedJoinDate }}</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="mb-8">
        <div class="flex border-b border-stone-700">
          <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
            :class="['py-2 px-4 text-sm font-medium', activeTab === tab.id ? 'border-b-2 border-yellow-400 text-yellow-400' : 'text-stone-400 hover:text-white']">
            {{ tab.name }}
          </button>
        </div>
      </div>

      <!-- Tab Content -->
      <div>
        <div v-if="activeTab === 'favorites'">
          <EventList :events="favorites" :on-action="unfavorite" action-label="Unfavorite"
            empty-message="You have no favorite events yet." />
        </div>
        <div v-if="activeTab === 'attending'">
          <EventList :events="participations" :on-action="cancel" action-label="Cancel"
            empty-message="You are not attending any events." action-context="participation" />
        </div>
        <div v-if="activeTab === 'waitlist'">
          <EventList :events="waitlist" :on-action="cancel" action-label="Leave Waitlist"
            empty-message="You are not on any waitlists." action-context="waitlist" />
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { userService } from '../api/user';
import { eventosService } from '../api/eventos';
import { userStore } from '../stores/userStore';
import EventList from '../components/EventListProfile.vue'; // Assuming a reusable component

export default {
  name: 'ProfileView',
  components: { EventList },
  data() {
    return {
      user: null,
      favorites: [],
      participations: [],
      waitlist: [],
      isLoading: true,
      error: null,
      activeTab: 'favorites',
      tabs: [
        { id: 'favorites', name: 'Favorites' },
        { id: 'attending', name: 'Attending' },
        { id: 'waitlist', name: 'Waitlisted' },
      ],
    };
  },
  computed: {
    profileImage() {
      return userStore.profileImage || '/defaultProfile.svg';
    },
    formattedJoinDate() {
      if (!this.user || !this.user.createdAt) return '';
      return new Date(this.user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    }
  },
  async created() {
    this.loadProfileData();
  },
  methods: {
    async loadProfileData() {
      this.isLoading = true;
      try {
        const [userRes, favRes, partRes, waitRes] = await Promise.all([
          userService.getProfile(),
          userService.getFavorites(),
          userService.getParticipations(),
          userService.getWaitlist()
        ]);
        this.user = userRes;
        this.favorites = favRes.data;
        this.participations = partRes.data;
        this.waitlist = waitRes.data;
      } catch (err) {
        this.error = err.message || 'Failed to load profile data.';
        console.error(err);
      } finally {
        this.isLoading = false;
      }
    },
    async unfavorite(eventId) {
      if (!confirm('Are you sure you want to remove this event from your favorites?')) return;
      try {
        await userService.removeFavorite(eventId);
        this.favorites = this.favorites.filter(event => event.eventId !== eventId);
      } catch (error) {
        alert(`Error: ${error.message}`);
      }
    },
    async cancel(eventId, context) {
      const message = context === 'participation'
        ? 'Are you sure you want to cancel your participation in this event?'
        : 'Are you sure you want to leave the waitlist for this event?';
      if (!confirm(message)) return;

      try {
        await eventosService.cancelParticipation(eventId);
        if (context === 'participation') {
          this.participations = this.participations.filter(event => event.eventId !== eventId);
        } else {
          this.waitlist = this.waitlist.filter(event => event.eventId !== eventId);
        }
      } catch (error) {
        alert(`Error: ${error.message}`);
      }
    }
  }
};
</script>