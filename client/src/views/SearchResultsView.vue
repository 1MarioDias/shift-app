<template>
  <div class="-mt-15 min-h-screen px-10 py-16 text-white font-sans max-w-7xl mx-auto">
    <!-- Search Filters -->
    <div class="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <label class="block text-sm font-medium mb-1">Event Type</label>
        <select v-model="filters.eventType" class="w-full bg-stone-800 border border-stone-600 rounded-md px-3 py-2">
          <option value="">All Types</option>
          <option value="Party">Party</option>
          <option value="Concert">Concert</option>
          <option value="Festival">Festival</option>
          <option value="Workshop">Workshop</option>
          <option value="Meeting">Meeting</option>
          <option value="Conference">Conference</option>
          <option value="Exhibition">Exhibition</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Location</label>
        <input v-model="filters.location" type="text" placeholder="Porto, Lisbon..." class="w-full bg-stone-800 border border-stone-600 rounded-md px-3 py-2">
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Date</label>
        <input v-model="filters.date" type="date" class="w-full bg-stone-800 border border-stone-600 rounded-md px-3 py-2">
      </div>
    </div>

    <!-- Results Header -->
    <div class="mt-15 flex justify-between items-center mb-6">
      <h2 class="text-2xl font-semibold">Results</h2>
      <div>
        <button @click="mapMode = false" class="mr-2 px-3 py-1 text-sm rounded-md" :class="{ 'bg-[#FFD300] text-black': !mapMode, 'bg-stone-700': mapMode }">List</button>
        <button @click="mapMode = true" class="px-3 py-1 text-sm rounded-md" :class="{ 'bg-[#FFD300] text-black': mapMode, 'bg-stone-700': !mapMode }">Map</button>
      </div>
    </div>

    <!-- Event List -->
    <div v-if="!mapMode" class="flex flex-col gap-6">
      <div
        v-for="event in events"
        :key="event._id"
        class="cursor-pointer bg-stone-800 rounded-lg p-5 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-stone-700 transition"
        @click="goToEvent(event._id)"
      >
        <div class="w-full md:w-98 h-40 flex-shrink-0">
          <img :src="event.image || '/defaultEvent.jpg'" alt="Image" class="w-full h-full object-cover rounded-md" />
        </div>
        <div class="flex-1">
          <h3 class="text-3xl font-semibold">{{ event.title || 'Untitled' }}</h3>
          <p class="text-lg text-stone-300">{{ formatDate(event.date) }} - {{ event.location || 'Unknown' }}</p>
          <p class="text-lg text-stone-400 mt-5">{{ event.eventType || 'Other' }} • {{ event.time || '00:00' }}</p>
        </div>
      </div>
    </div>

    <!-- Leaflet Map -->
    <div v-else id="map" class="h-[500px] rounded-lg z-0"></div>
  </div>
</template>

<script>
import L from 'leaflet';
import { eventosService } from '../api/eventos';

export default {
  name: "SearchResultsView",
  data() {
    return {
      mapMode: false,
      map: null,
      filters: {
        eventType: '',
        location: '',
        date: ''
      },
      events: []
    };
  },
  watch: {
    '$route.query': {
      immediate: true,
      handler(query) {
        this.filters.location = query.location || '';
        this.filters.eventType = query.eventType || '';
        this.filters.date = query.date || '';
        this.fetchEvents();
      }
    },
    filters: {
      deep: true,
      handler() {
        this.fetchEvents();
      }
    },
    mapMode(newVal) {
      if (newVal) {
        this.$nextTick(() => this.initializeMap());
      }
    },
    events() {
      if (this.mapMode) {
        this.$nextTick(() => this.initializeMap());
      }
    }
  },
  methods: {
    goToEvent(id) {
      if (!id) return;
      this.$router.push({ name: 'EventView', params: { id } });
    },
    async fetchEvents() {
      try {
        const params = {
          eventType: this.filters.eventType,
          location: this.filters.location,
          datetime: this.filters.date
        };

        const response = await eventosService.getPublicEvents(params);
        let allEvents = Array.isArray(response.data) ? response.data : [];

        if (this.filters.date) {
          const selectedDate = new Date(this.filters.date);
          allEvents = allEvents.filter(event => {
            const eventDate = new Date(event.date);
            return (
              eventDate.getFullYear() === selectedDate.getFullYear() &&
              eventDate.getMonth() === selectedDate.getMonth() &&
              eventDate.getDate() === selectedDate.getDate()
            );
          });
        }

        this.events = allEvents;
      } catch (error) {
        console.error('Erro ao buscar eventos:', error.message);
      }
    },
    formatDate(date) {
      if (!date) return 'N/A';
      const d = new Date(date);
      return d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
    },
    async initializeMap() {
      if (this.map) {
        this.map.remove();
      }

      this.map = L.map('map').setView([39.5, -8], 6);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(this.map);

      for (const event of this.events) {
        if (!event.latitude || !event.longitude) {
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(event.location)}`);
            const data = await response.json();
            if (data.length) {
              event.latitude = parseFloat(data[0].lat);
              event.longitude = parseFloat(data[0].lon);
            }
          } catch (err) {
            console.warn('Geocoding failed for', event.location);
            continue;
          }
        }

        if (event.latitude && event.longitude) {
          const marker = L.marker([event.latitude, event.longitude], {
            icon: L.divIcon({
              html: `<div style="font-size: 2rem; text-align: center;">📍</div>`,
              iconSize: [48, 48],
              iconAnchor: [0, 0],
              className: '' 
            })
          }).addTo(this.map);

          const popupContent = `
            <div style="max-width: 200px; cursor:pointer;" onclick="window.location.href='/event/${event._id}'">
              <img src="${event.image || '/defaultEvent.jpg'}" alt="${event.title}" style="width: 100%; border-radius: 8px; margin-bottom: 8px;" />
              <strong>${event.title}</strong><br />
              ${this.formatDate(event.date)} - ${event.location}<br />
              <span style="color: gray;">${event.eventType} • ${event.time}</span>
            </div>
          `;

          marker.bindPopup(popupContent, { className: 'custom-popup' });
        }
      }
    }
  }
};
</script>

<style scoped>
#map {
  width: 100%;
}



.leaflet-popup-content-wrapper {
  background: #fff;
  color: #111;
  border-radius: 10px;
  padding: 10px;
}

.leaflet-popup-tip {
  background: #fff;
}
</style>
