<template>
    <section class="mt-40 px-20 max-md:px-10 max-sm:px-5">
        <h2 class="mb-16 text-5xl font-bold text-center text-stone-50 max-md:text-4xl max-sm:text-3xl">
            FEATURED EVENTS
        </h2>
        <div v-if="loading" class="text-center text-stone-50">
            Loading...
        </div>
        <div v-else-if="error" class="text-center text-red-500">
            {{ error }}
        </div>
        <div v-else class="grid grid-cols-4 gap-14 max-md:grid-cols-2 max-sm:grid-cols-1">
         <router-link 
             v-for="event in events" 
             :key="event.eventId"
             :to="'/event/' + event.eventId"
             >
             <EventCard 
                 :image="event.image"
                 :type="event.eventType"
                 :date="formatDate(event.date)"
                 :location="event.location"
                 :author="event.authorName || 'Unknown Author'"
                 :title="event.title"
                 :is-logged-in="isLoggedIn"
                 :is-favorited="favoriteEventIds.has(event.eventId)"
                 :is-processing="isProcessingFavorite === event.eventId"
                 @toggle-favorite="handleToggleFavorite(event)"
                 />
         </router-link>
     </div>
 </section>
</template>

<script>
import EventCard from "./EventCard.vue";
import { eventosService } from "../api/eventos";
import { userService } from '../api/user';
import { authStore } from '../stores/authStore';

export default {
    name: "FeaturedEvents",
    components: {
        EventCard,
    },
    data() {
        return {
            events: [],
            loading: true,
            error: null,
            favoriteEventIds: new Set(),
            isProcessingFavorite: null,
        };
    },
    computed: {
        isLoggedIn() {
            return authStore.isLoggedIn();
        }
    },
    methods: {
        formatDate(dateStr) {
            if (!dateStr) return 'N/A';
            return new Date(dateStr).toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short',
                day: 'numeric',
            });
        },
        async fetchEvents() {
            try {
                this.loading = true;
                this.error = null; 
                const response = await eventosService.getFeaturedEvents(); 
                if (response && response.data) {
                    this.events = response.data; 
                } else {
                    this.events = []; // Ensure events is an array
                }
                if (this.isLoggedIn) {
                    await this.fetchUserFavorites();
                }
            } catch (err) {
                this.error = 'Failed to load events.';
                console.error(err);
            } finally {
                this.loading = false;
            }
        },
        async fetchUserFavorites() {
            try {
                const response = await userService.getFavorites({ pageSize: 1000 });
                this.favoriteEventIds = new Set(response.data.map(fav => fav.eventId));
            } catch (error) {
                console.error('Could not fetch user favorites:', error);
            }
        },
        async handleToggleFavorite(event) {
            if (!this.isLoggedIn) return;

            this.isProcessingFavorite = event.eventId;
            const isCurrentlyFavorited = this.favoriteEventIds.has(event.eventId);

            try {
                if (isCurrentlyFavorited) {
                    await userService.removeFavorite(event.eventId);
                    this.favoriteEventIds.delete(event.eventId);
                } else {
                    await userService.addFavorite(event.eventId);
                    this.favoriteEventIds.add(event.eventId);
                }
            } catch (error) {
                console.error('Failed to toggle favorite:', error);
                alert(`Error: ${error.message}`);
            } finally {
                this.isProcessingFavorite = null;
            }
        }
    },
    created() {
        this.fetchEvents();
    }
};
</script>