<template>
    <section class="px-20 max-md:px-10 max-sm:px-5">
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
        }
    },
    mounted() {
        this.fetchEvents();
    }
};
</script>