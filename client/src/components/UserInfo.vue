<template>
  <section class="px-20 py-12 max-md:px-10 max-sm:px-5 max-sm:py-10 mx-6">
    <!-- username and password change -->
    <div class="w-full flex items-center justify-between mb-6">
      <h1 class="text-4xl font-bold text-stone-50 max-md:text-3xl max-sm:text-2xl">
        {{ username }}
      </h1>
      <button class="text-sm text-stone-50 border border-stone-50 px-4 py-2 rounded hover:bg-stone-50 hover:text-black transition">
        Change Password
      </button>
    </div>
    <!-- saved events -->
    <!-- placeholder for user saved events using "featured events" -->
    <div class="mt-8 px-0">
      <h2 class="text-xl font-semibold text-stone-50">Saved Events</h2>
      <div v-if="loading" class="text-center text-stone-50">
        Loading...
      </div>
      <div v-else-if="error" class="text-center text-red-500">
        {{ error }}
      </div>
      <div v-else class="grid grid-cols-4 gap-14 max-md:grid-cols-2 max-sm:grid-cols-1">
        <EventCard 
          v-for="event in events" 
          :key="event.eventId"
          :image="event.image || `../../public/images/cardImage.png`"
          :type="event.eventType"
          :date="formatDate(event.date)"
          :location="event.location"
          :author="'SHIFT'"
          :title="event.title"
        />
      </div>
    </div>
  </section>
</template>

<script>
import EventCard from "./EventCard.vue";
import { eventosService } from "../api/eventos";

export default {
  name: "UserInfo",
  components: {
    EventCard,
  },
  props: {
    username: {
      type: String,
      default: "User",
    },
  },
  data() {
    return {
      events: [],
      loading: true,
      error: null,
    };
  },
  methods: {
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    },
    async fetchEvents() {
      try {
        this.loading = true;
        const response = await eventosService.getFeaturedEvents();
        this.events = response.data;
      } catch (err) {
        this.error = "Failed to load events. Launch the server and try again.";
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
  },
  mounted() {
    this.fetchEvents();
  },
};


</script>


