<template>
  <div>
    <div 
      v-if="error" 
      class="mb-4 p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-xl text-red-500"
    >
      {{ error }}
    </div>

    <AdminTable
      :columns="columns"
      :currentPage="currentPage"
      :totalPages="totalPages"
      :totalItems="totalItems"
      :pageSize="pageSize"
      searchPlaceholder="Search events by title or description..."
      @search="handleSearch"
      @sort="handleSort"
      @page-change="handlePageChange"
    >
      <template #filters>
        <select 
          v-model="filters.eventType"
          class="px-4 py-2 bg-black bg-opacity-30 rounded-xl text-stone-50 border border-stone-700 focus:border-[#FFD300]"
        >
          <option value="">All Types</option>
          <option v-for="type in eventTypesOptions" :key="type" :value="type">
            {{ type }}
          </option>
        </select>

        <input 
          type="date"
          v-model="filters.datetime"
          class="px-4 py-2 bg-black bg-opacity-30 rounded-xl text-stone-50 border border-stone-700 focus:border-[#FFD300]"
        />

        <select 
          v-model="filters.isPublic"
          class="px-4 py-2 bg-black bg-opacity-30 rounded-xl text-stone-50 border border-stone-700 focus:border-[#FFD300]"
        >
          <option value="">All (Public/Private)</option>
          <option value="true">Public Only</option>
          <option value="false">Private Only</option>
        </select>
      </template>

      <template #rows>
        <tr v-if="loading && !events.length"> {/* Show loading only if events are not yet populated */}
          <td :colspan="columns.length + 1" class="text-center py-4">
            <div class="p-4 bg-[#FFD300] bg-opacity-20 border border-[#FFD300] rounded-xl text-[#FFD300]">
              Loading events...
            </div>
          </td>
        </tr>
        <tr v-else-if="!events.length && !loading">
          <td :colspan="columns.length + 1" class="text-center py-4 text-stone-400">
            No events found matching your criteria.
          </td>
        </tr>
        <tr 
          v-else
          v-for="event in events" 
          :key="event.eventId"
          class="border-b border-stone-700 hover:bg-white hover:bg-opacity-5"
        >
          <td class="py-3 px-4">
            <div class="flex items-center gap-3">
              <img 
                :src="event.image ? `/images/${event.image}` : '/images/cardImage.png'"
                :alt="event.title"
                class="w-10 h-10 rounded-lg object-cover"
              />
              {{ event.title }}
            </div>
          </td>
          <td class="py-3 px-4">{{ event.eventType }}</td>
          <td class="py-3 px-4">{{ formatDate(event.date) }}</td>
          <td class="py-3 px-4">{{ event.location }}</td>
          <td class="py-3 px-4">
            <span 
              :class="[
                'px-2 py-1 rounded-full text-xs',
                event.isPublic 
                  ? 'bg-green-500 bg-opacity-20 text-stone-100' 
                  : 'bg-yellow-500 bg-opacity-20 text-stone-100'
              ]"
            >
              {{ event.isPublic ? 'Public' : 'Private' }}
            </span>
          </td>
          <td class="py-3 px-4">{{ event.authorName || 'N/A' }}</td>
          <td class="py-3 px-4">
            <div class="flex gap-2">
              <button 
                class="p-2 text-[#FFD300] hover:bg-[#FFD300] hover:text-black hover:bg-opacity-20 rounded-lg transition-colors"
                @click="handleEdit(event.eventId)"
              >
                Edit
              </button>
              <button 
                class="p-2 text-red-500 hover:bg-red-500 hover:text-black hover:bg-opacity-20 rounded-lg transition-colors"
                @click="handleDelete(event.eventId)"
              >
                Delete
              </button>
            </div>
          </td>
        </tr>
      </template>
    </AdminTable>
  </div>
</template>

<script>
import AdminTable from './AdminTable.vue';
import { eventosService } from '../../api/eventos';

export default {
  name: 'AdminEventsTable',
  components: { AdminTable },
  data() {
    return {
      columns: [
        { key: 'title', label: 'Title', sortable: true },
        { key: 'eventType', label: 'Type', sortable: true },
        { key: 'data', label: 'Date', sortable: true },
        { key: 'location', label: 'Location', sortable: true },
        { key: 'isPublic', label: 'Status', sortable: true },
        { key: 'authorName', label: 'Author', sortable: true },
      ],
      events: [],
      eventTypesOptions: [], 
      currentPage: 0,
      totalPages: 0,
      totalItems: 0,
      pageSize: 10,
      filters: {
        query: '',
        eventType: '',
        datetime: '', 
        isPublic: '', 
        organizerId: '' 
      },
      loading: false, // General loading state for table data
      loadingTypes: false, // Specific loading state for event types
      error: null,
      sortBy: 'data', 
      sortOrder: 'asc',
      debounceTimeout: null
    };
  },
  methods: {
    formatDate(dateString) { 
      if (!dateString) return 'N/A';
      const parts = dateString.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return dateString; 
    },
    async fetchUniqueEventTypes() {
      this.loadingTypes = true;
      try {
        // Fetch a batch of events to extract types.
        // The backend caps pageSize for admin at 100.
        const response = await eventosService.getAdminEvents({ page: 0, pageSize: 100 });
        if (response && response.data) {
          const types = new Set(response.data.map(event => event.eventType).filter(Boolean));
          this.eventTypesOptions = Array.from(types).sort();
        }
      } catch (err) {
        console.error("Failed to fetch unique event types:", err.message);
        this.error = (this.error ? this.error + " " : "") + `Could not load event type filters: ${err.message}`;
        this.eventTypesOptions = []; 
      } finally {
        this.loadingTypes = false;
      }
    },
    async fetchEvents() {
      this.loading = true;
      // Preserve type filter error if it exists, otherwise clear general error
      if (!this.error || !this.error.includes("event type filters")) {
          this.error = null;
      }
      try {
        const paramsToPass = {
          page: this.currentPage,
          pageSize: this.pageSize,
          sortBy: this.sortBy,
          order: this.sortOrder,
          // Pass filters only if they have a non-empty value
          ...(this.filters.query && { query: this.filters.query }),
          ...(this.filters.eventType && { eventType: this.filters.eventType }),
          ...(this.filters.datetime && { datetime: this.filters.datetime }), 
          ...(this.filters.isPublic && { isPublic: this.filters.isPublic }), 
          ...(this.filters.organizerId && { organizerId: this.filters.organizerId }),
        };
        
        const response = await eventosService.getAdminEvents(paramsToPass);
        this.events = response.data; 
        this.totalItems = response.pagination.totalItems;
        this.totalPages = response.pagination.totalPages;
      } catch (err) {
        const newError = err.message || 'Failed to fetch events for admin.';
        this.error = (this.error ? this.error + " " : "") + newError;
        console.error("Error in AdminEventsTable fetchEvents:",err);
        this.events = [];
      } finally {
        this.loading = false;
      }
    },
    handleSearch(query) {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = setTimeout(() => {
        this.filters.query = query;
        this.currentPage = 0;
        this.fetchEvents();
      }, 500);
    },
    handleSort({ key, order }) {
      this.sortBy = key;
      this.sortOrder = order;
      this.fetchEvents();
    },
    handlePageChange(page) {
      this.currentPage = page;
      this.fetchEvents();
    },
    handleEdit(eventId) {
      console.log('Edit event:', eventId);
      // this.$router.push(`/admin/events/edit/${eventId}`);
    },
    async handleDelete(eventId) {
      if (confirm('Are you sure you want to delete this event?')) {
        try {
          // await eventosService.deleteAdminEvent(eventId); 
          console.log('Delete event (implement service):', eventId);
          // this.fetchEvents(); 
        } catch (err) {
          this.error = err.message || 'Failed to delete event.';
          alert(this.error);
        }
      }
    }
  },
  watch: {
    'filters.eventType': function() { this.currentPage = 0; this.fetchEvents(); },
    'filters.datetime': function() { this.currentPage = 0; this.fetchEvents(); },
    'filters.isPublic': function() { this.currentPage = 0; this.fetchEvents(); },
    'filters.organizerId': function() { this.currentPage = 0; this.fetchEvents(); }
  },
  async mounted() {
    // Fetch types and events concurrently or sequentially
    await this.fetchUniqueEventTypes(); // Fetch types first
    this.fetchEvents();                 // Then fetch events based on default/initial filters
  },
  beforeUnmount() {
    clearTimeout(this.debounceTimeout);
  }
};
</script>