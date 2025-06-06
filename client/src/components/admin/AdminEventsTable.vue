<template>
  <div>
    <!-- Notification Pop-up -->
    <div 
      v-if="notification.show" 
      :class="[
        'fixed top-20 right-4 p-4 rounded-xl shadow-lg max-w-sm w-full z-[100] transition-all duration-300 transform',
        notification.type === 'success' 
          ? 'bg-[#1C1C1E] border border-[#FFD300]' 
          : 'bg-[#1C1C1E] border border-[#FF004D]'
      ]"
      style="margin-top: 1rem;" 
    >
      <div class="flex items-start">
        <div class="ml-3 w-0 flex-1 pt-0.5">
          <p 
            :class="[
              'text-sm font-medium',
              notification.type === 'success' ? 'text-[#FFD300]' : 'text-[#FF004D]'
            ]"
          >
            {{ notification.message }}
          </p>
        </div>
        <div class="ml-4 flex-shrink-0 flex">
          <button 
            @click="closeNotification"
            class="inline-flex text-stone-400 hover:text-stone-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <span class="sr-only">Close</span>
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
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
          class="px-4 py-2 bg-black bg-opacity-30 rounded-xl text-stone-50 border border-stone-700 focus:border-[#FFD300] transition-colors"
        >
          <option value="">All Types</option>
          <option v-for="type in eventTypesOptions" :key="type" :value="type">{{ type }}</option>
        </select>

        <input 
          type="date"
          v-model="filters.datetime"
          class="px-4 py-2 bg-black bg-opacity-30 rounded-xl text-stone-50 border border-stone-700 focus:border-[#FFD300] transition-colors"
        />

        <select 
          v-model="filters.isPublic"
          class="px-4 py-2 bg-black bg-opacity-30 rounded-xl text-stone-50 border border-stone-700 focus:border-[#FFD300] transition-colors"
        >
          <option value="">All Statuses</option>
          <option :value="true">Public</option>
          <option :value="false">Private</option>
        </select>
         <input 
          type="text"
          v-model="filters.organizerId"
          placeholder="Organizer ID"
          class="px-4 py-2 bg-black bg-opacity-30 rounded-xl text-stone-50 placeholder-stone-500 border border-stone-700 focus:border-[#FFD300] transition-colors"
        />
      </template>

      <template #rows>
        <tr v-if="loading && !events.length">
          <td :colspan="columns.length + 1" class="text-center py-4 text-stone-400">Loading events...</td>
        </tr>
        <tr v-else-if="!events.length && !loading">
          <td :colspan="columns.length + 1" class="text-center py-4 text-stone-400">No events found.</td>
        </tr>
        <tr 
          v-for="event in events" 
          :key="event.eventId"
          class="border-b border-stone-700 hover:bg-white hover:bg-opacity-5"
        >
          <td class="py-3 px-4">{{ event.title }}</td>
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
                :disabled="isLoadingEventDetails"
              >
                {{ isLoadingEventDetails && currentEditingEventId === event.eventId ? 'Loading...' : 'Edit' }}
              </button>
              <button 
                class="p-2 text-red-500 hover:bg-red-500 hover:text-black hover:bg-opacity-20 rounded-lg transition-colors"
                @click="handleDelete(event.eventId)"
                :disabled="isDeleting === event.eventId"
              >
                {{ isDeleting === event.eventId ? 'Deleting...' : 'Delete' }}
              </button>
            </div>
          </td>
        </tr>
      </template>
    </AdminTable>

    <!-- Edit Event Modal -->
    <div v-if="isEditModalVisible" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div class="bg-[#1c1c1e] p-6 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h3 class="text-2xl font-bold text-stone-50 mb-6">Edit Event (ID: {{ currentEditingEventId }})</h3>
        <form @submit.prevent="saveEventChanges" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-stone-300 mb-1">Title</label>
            <input type="text" v-model="editingEventData.title" class="w-full p-2 bg-stone-700 rounded-md text-stone-50 border border-stone-600 focus:border-[#FFD300]">
          </div>
          <div>
            <label class="block text-sm font-medium text-stone-300 mb-1">Description</label>
            <textarea v-model="editingEventData.description" rows="3" class="w-full p-2 bg-stone-700 rounded-md text-stone-50 border border-stone-600 focus:border-[#FFD300]"></textarea>
          </div>
           <div>
            <label class="block text-sm font-medium text-stone-300 mb-1">Image URL/Path</label>
            <input type="text" v-model="editingEventData.image" class="w-full p-2 bg-stone-700 rounded-md text-stone-50 border border-stone-600 focus:border-[#FFD300]">
          </div>
          <div>
            <label class="block text-sm font-medium text-stone-300 mb-1">Event Type</label>
            <input type="text" v-model="editingEventData.eventType" class="w-full p-2 bg-stone-700 rounded-md text-stone-50 border border-stone-600 focus:border-[#FFD300]">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-stone-300 mb-1">Date (YYYY-MM-DD)</label>
              <input type="date" v-model="editingEventData.eventDate" class="w-full p-2 bg-stone-700 rounded-md text-stone-50 border border-stone-600 focus:border-[#FFD300]">
            </div>
            <div>
              <label class="block text-sm font-medium text-stone-300 mb-1">Time (HH:MM)</label>
              <input type="time" v-model="editingEventData.eventTime" class="w-full p-2 bg-stone-700 rounded-md text-stone-50 border border-stone-600 focus:border-[#FFD300]">
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-stone-300 mb-1">Location</label>
            <input type="text" v-model="editingEventData.location" class="w-full p-2 bg-stone-700 rounded-md text-stone-50 border border-stone-600 focus:border-[#FFD300]">
          </div>
          <div>
            <label class="block text-sm font-medium text-stone-300 mb-1">Max Participants</label>
            <input type="number" min="2" v-model.number="editingEventData.maxParticipants" class="w-full p-2 bg-stone-700 rounded-md text-stone-50 border border-stone-600 focus:border-[#FFD300]">
          </div>
          <div>
            <label class="block text-sm font-medium text-stone-300 mb-1">Relevant Links</label>
            <input type="text" v-model="editingEventData.linksRelevantes" class="w-full p-2 bg-stone-700 rounded-md text-stone-50 border border-stone-600 focus:border-[#FFD300]">
          </div>
          <div class="flex items-center gap-2">
            <input type="checkbox" id="editIsPublic" v-model="editingEventData.isPublic" class="accent-[#FFD300] w-4 h-4">
            <label for="editIsPublic" class="text-stone-300">Is Public</label>
          </div>
          <div class="flex justify-end gap-4 mt-6">
            <button type="button" @click="closeEditModal" class="px-4 py-2 bg-stone-600 hover:bg-stone-500 rounded-lg text-stone-50 transition-colors">Cancel</button>
            <button type="submit" :disabled="isSavingEventChanges" class="px-4 py-2 bg-[#FFD300] hover:bg-yellow-500 rounded-lg text-black transition-colors">
              {{ isSavingEventChanges ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>

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
      loading: false,
      loadingTypes: false,
      sortBy: 'data', 
      sortOrder: 'asc',
      debounceTimeout: null,

      isEditModalVisible: false,
      currentEditingEventId: null,
      editingEventData: {
        title: '',
        image: '',
        description: '',
        eventType: '',
        eventDate: '',
        eventTime: '',
        location: '',
        maxParticipants: null,
        isPublic: true,
        linksRelevantes: ''
      },
      originalEditingEventData: {},
      isLoadingEventDetails: false,
      isSavingEventChanges: false,
      isDeleting: null,

      notification: {
        show: false,
        message: '',
        type: 'success',
        timeout: null
      }
    };
  },
  methods: {
    showNotification(message, type = 'success', duration = 5000) {
      if (this.notification.timeout) {
        clearTimeout(this.notification.timeout);
      }
      this.notification = {
        show: true,
        message,
        type,
        timeout: setTimeout(() => {
          this.closeNotification();
        }, duration)
      };
    },
    closeNotification() {
      this.notification.show = false;
      if (this.notification.timeout) {
        clearTimeout(this.notification.timeout);
        this.notification.timeout = null;
      }
    },
    formatDate(dateString) { 
      if (!dateString) return 'N/A';
      const parts = dateString.split('-');
      if (parts.length === 3) {
        return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
      }
      return dateString; 
    },
    async fetchUniqueEventTypes() {
      this.loadingTypes = true;
      try {
        const response = await eventosService.getAdminEvents({ page: 0, pageSize: 100 });
        if (response && response.data) {
          const types = new Set(response.data.map(event => event.eventType));
          this.eventTypesOptions = Array.from(types).sort();
        }
      } catch (err) {
        this.showNotification('Could not load event type filters: ' + (err.message || 'Unknown error'), 'error');
        console.error("Error fetching event types:", err);
        this.eventTypesOptions = []; 
      } finally {
        this.loadingTypes = false;
      }
    },
    async fetchEvents() {
      this.loading = true;
      try {
        const params = {
          page: this.currentPage,
          pageSize: this.pageSize,
          sortBy: this.sortBy,
          order: this.sortOrder,
          query: this.filters.query,
          ...(this.filters.eventType && { eventType: this.filters.eventType }),
          ...(this.filters.datetime && { datetime: this.filters.datetime }),
          ...(this.filters.isPublic !== '' && { isPublic: this.filters.isPublic }),
          ...(this.filters.organizerId && { organizerId: this.filters.organizerId }),
        };
        const response = await eventosService.getAdminEvents(params); 
        if (response && response.data) {
          this.events = response.data;
          this.totalItems = response.pagination.totalItems;
          this.totalPages = response.pagination.totalPages;
        } else {
          this.events = [];
          this.totalItems = 0;
          this.totalPages = 0;
        }
      } catch (err) {
        this.showNotification(err.message || 'Failed to fetch events.', 'error');
        console.error("Error in AdminEventsTable fetchEvents:", err);
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
    async handleEdit(eventId) {
      this.closeNotification();
      this.isLoadingEventDetails = true;
      this.currentEditingEventId = eventId;
      try {
        const eventDetails = await eventosService.getEventById(eventId);
        this.editingEventData = {
          title: eventDetails.title || '',
          image: eventDetails.image || '',
          description: eventDetails.description || '',
          eventType: eventDetails.eventType || '',
          eventDate: eventDetails.date || '',
          eventTime: eventDetails.time ? eventDetails.time.substring(0, 5) : '',
          location: eventDetails.location || '',
          maxParticipants: eventDetails.maxParticipants || null,
          isPublic: eventDetails.isPublic === undefined ? true : eventDetails.isPublic,
          linksRelevantes: eventDetails.linksRelevantes || ''
        };
        this.originalEditingEventData = { ...this.editingEventData };
        this.isEditModalVisible = true;
      } catch (err) {
        this.showNotification(err.message || `Failed to load event details for ID ${eventId}.`, 'error');
      } finally {
        this.isLoadingEventDetails = false;
      }
    },
    closeEditModal() {
      this.isEditModalVisible = false;
      this.currentEditingEventId = null;
      this.editingEventData = { /* reset */ };
    },
    async saveEventChanges() {
      this.closeNotification();
      if (!this.currentEditingEventId) return;
      this.isSavingEventChanges = true;

      const payload = { ...this.editingEventData };
      
      try {
        await eventosService.patchEvent(this.currentEditingEventId, payload);
        this.showNotification(`Event ID ${this.currentEditingEventId} updated successfully.`, 'success');
        this.closeEditModal();
        this.fetchEvents(); 
      } catch (err) {
        this.showNotification(err.message || `Failed to update event ID ${this.currentEditingEventId}.`, 'error');
      } finally {
        this.isSavingEventChanges = false;
      }
    },
    async handleDelete(eventId) {
      this.closeNotification();
      if (confirm(`Are you sure you want to delete event ID ${eventId}? This action cannot be undone.`)) {
        this.isDeleting = eventId;
        try {
          await eventosService.deleteAdminEvent(eventId); 
          this.showNotification(`Event ID ${eventId} deleted successfully.`, 'success');
          this.fetchEvents(); 
        } catch (err) {
          this.showNotification(err.message || `Failed to delete event ID ${eventId}.`, 'error');
          console.error(err);
        } finally {
          this.isDeleting = null;
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
    await this.fetchUniqueEventTypes(); 
    this.fetchEvents();                 
  },
  beforeUnmount() {
    clearTimeout(this.debounceTimeout);
    if (this.notification.timeout) {
      clearTimeout(this.notification.timeout);
    }
  }
};
</script>