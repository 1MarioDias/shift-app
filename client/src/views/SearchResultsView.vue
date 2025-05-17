<template>
  <div class="-mt-15 min-h-screen px-10 py-16 text-white font-sans max-w-7xl mx-auto">
    <!-- Search Filters -->
    <div class="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <label class="block text-sm font-medium mb-1">Event Type</label>
        <select v-model="filters.eventType" class="w-full bg-stone-800 border border-stone-600 rounded-md px-3 py-2">
          <option value="">All Types</option>
          <option value="Party">Party</option>
          <option value="Festival">Festival</option>
          <option value="Workshop">Workshop</option>
          <option value="Concert">Concert</option>
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
        :key="event.id"
        class="cursor-pointer bg-stone-800 rounded-lg p-5 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-stone-700 transition"
        @click="goToEvent(event.id)"
      >
        <div class="w-full md:w-98 h-40 flex-shrink-0">
          <img :src="event.image" alt="Image" class="w-full h-full object-cover rounded-md" />
        </div>
        <div class="flex-1">
          <h3 class="text-3xl font-semibold">{{ event.title }}</h3>
          <p class="text-lg text-stone-300">{{ event.date }} - {{ event.location }}</p>
          <p class="text-lg text-stone-400 mt-5">{{ event.type }} • {{ event.time }}</p>
        </div>
      </div>
    </div>

    <!-- Leaflet Map -->
    <div v-else id="map" class="h-[500px] rounded-lg"></div>
  </div>
</template>

<script>
import L from 'leaflet';

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

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
      events: [
        {
          id: 1,
          title: "Sunset Party",
          location: "Porto",
          coords: [41.1496, -8.6109],
          date: "2025-05-25",
          time: "18:00",
          type: "Party",
          image: "/images/evento1.png"
        },
        {
          id: 2,
          title: "Tech Meetup",
          location: "Lisbon",
          coords: [38.7169, -9.1399],
          date: "2025-06-01",
          time: "15:00",
          type: "Workshop",
          image: "/images/evento2.jpg"
        }
      ]
    }
  },
  watch: {
    mapMode(newVal) {
      if (newVal) {
        this.$nextTick(() => this.initializeMap());
      }
    }
  },
  methods: {
    goToEvent(id) {
      this.$router.push({ name: 'EventView', params: { id } });
    },
    initializeMap() {
      if (this.map) {
        this.map.remove();
      }

      this.map = L.map('map').setView([39.5, -8], 6);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(this.map);

      this.events.forEach(event => {
        if (event.coords) {
          const popupContent = `
            <div style="max-width: 200px; cursor:pointer;" onclick="window.location.href='/event/${event.id}'">
              <img src="${event.image}" alt="${event.title}" style="width: 100%; border-radius: 8px; margin-bottom: 8px;" />
              <strong>${event.title}</strong><br />
              ${event.date} - ${event.location}<br />
              <span style="color: gray;">${event.type} • ${event.time}</span>
            </div>
          `;
          L.marker(event.coords, { icon: defaultIcon })
            .addTo(this.map)
            .bindPopup(popupContent);
        }
      });
    }
  }
}
</script>

<style scoped>
#map {
  width: 100%;
}
</style>
