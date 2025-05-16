<template>
  <div>
    <div 
      v-if="error" 
      class="mb-4 p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-xl text-red-500"
    >
      {{ error }}
    </div>

    <div 
      v-if="loading" 
      class="mb-4 p-4 bg-[#FFD300] bg-opacity-20 border border-[#FFD300] rounded-xl text-[#FFD300] text-center"
    >
      Loading events...
    </div>

    <AdminTable
      v-else
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
          <option value="Music">Music</option>
          <option value="Sports">Sports</option>
          <option value="Cultural">Cultural</option>
          <option value="DJ Set">DJ Set</option>
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
          <option value="">All Exclusiveness</option>
          <option :value="true">Public</option>
          <option :value="false">Private</option>
        </select>
      </template>

      <template #rows>
        <tr 
          v-for="event in events" 
          :key="event.eventId"
          class="border-b border-stone-700 hover:bg-white hover:bg-opacity-5"
        >
          <td class="py-3 px-4">
            <div class="flex items-center gap-3">
              <img 
                :src="`../../../public/images/${event.image}`"
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
                  ? 'bg-green-500 bg-opacity-20 text-stone-1000' 
                  : 'bg-yellow-500 bg-opacity-20 text-stone-1000'
              ]"
            >
              {{ event.isPublic ? 'Public' : 'Private' }}
            </span>
          </td>
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
  components: {
    AdminTable
  },
  data() {
    return {
      columns: [
        { key: 'title', label: 'Title', sortable: true },
        { key: 'eventType', label: 'Type', sortable: true },
        { key: 'date', label: 'Date', sortable: true },
        { key: 'location', label: 'Location', sortable: true },
        { key: 'exclusiveness', label: 'Exclusiveness', sortable: true }
      ],
      events: [],
      currentPage: 0,
      totalPages: 0,
      totalItems: 0,
      pageSize: 10,
      filters: {
        query: '',
        eventType: '',
        datetime: '',
        location: '',
        isPublic: ''
      },
      loading: false,
      error: null
    }
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    async fetchEvents() {
      try {
        this.loading = true;
        const response = await eventosService.getAdminEvents({
          page: this.currentPage,
          pageSize: this.pageSize,
          ...this.filters
        });

        this.events = response.data;
        this.totalItems = response.pagination.totalItems;
        this.totalPages = response.pagination.totalPages;
      } catch (err) {
        this.error = err.message;
        console.error('Failed to fetch events:', err);
      } finally {
        this.loading = false;
      }
    },
    async handleSearch(query) {
      this.filters.query = query;
      this.currentPage = 0;
      await this.fetchEvents();
    },
    async handleSort({ key, order }) {
      await this.fetchEvents();
    },
    async handlePageChange(page) {
      this.currentPage = page;
      await this.fetchEvents();
    },
    handleEdit(eventId) {
      // alterar isto
      console.log('Edit event:', eventId);
    },
    handleDelete(eventId) {
      // alterar isto
      console.log('Delete event:', eventId);
    }
  },
  watch: {
    'filters.eventType': function() {
      this.currentPage = 0;
      this.fetchEvents();
    },
    'filters.datetime': function() {
      this.currentPage = 0;
      this.fetchEvents();
    },
    'filters.isPublic': function() {
      this.currentPage = 0;
      this.fetchEvents();
    }
  },
  mounted() {
    this.fetchEvents();
  }
}
</script>