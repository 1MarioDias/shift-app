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
                 />
         </router-link>
     </div>
 </section>
</template>

<script>
import EventCard from "./EventCard.vue";
import { eventosService } from "../api/eventos";

export default {
    name: "FeaturedEvents",
    components: {
        EventCard,
    },
    data() {
        return {
            events: [],
            loading: true,
            error: null
        };
    },
    methods: {
        formatDate(dateStr) {
            if (!dateStr) return 'N/A';
            return new Date(dateStr).toLocaleDateString('en-US', { 
                weekday: 'short', 
                year: 'numeric',
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
                    this.error = 'Featured events data is not in the expected format.';
                }
            } catch (err) {
                this.error = err.message || 'Failed to fetch featured events.';
                console.error("Error in FeaturedEvents fetchEvents:", err);
                this.events = []; // Ensure events is an array on error
            } finally {
                this.loading = false;
            }
        }
    },
    mounted() {
        this.fetchEvents();
    }
};
</script>