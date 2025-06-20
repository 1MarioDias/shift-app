<template>
  <section class="p-10 pt-20 text-white font-sans"> <!-- Increased top padding -->
    <div class="max-w-6xl mx-auto">
      <!-- Form Header -->
      <h1 class="text-3xl font-bold mb-8 text-center md:text-left">Create New Event</h1>

      <!-- Global Error/Success Messages -->
      <div v-if="apiError" class="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm">
        <p><strong>Creation Failed:</strong> {{ apiError }}</p>
        <ul v-if="apiErrorDetails && apiErrorDetails.length">
          <li v-for="(detail, index) in apiErrorDetails" :key="index">- {{ detail.field }}: {{ detail.message }}</li>
        </ul>
      </div>
      <div v-if="successMessage" class="bg-green-500 bg-opacity-20 border border-green-500 text-green-300 px-4 py-3 rounded-lg mb-6 text-sm">
        <p>{{ successMessage }} Event ID: {{ createdEventId }}</p>
        <router-link :to="`/event/${createdEventId}`" class="underline hover:text-green-100 mt-1 inline-block">View your event</router-link>
      </div>
      
      <form @submit.prevent="submitForm" class="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
        <!-- Left Side -->
        <div class="space-y-6">
          <div>
            <label for="title" class="block text-sm font-medium text-gray-300 mb-1">Event Title</label>
            <input
              id="title"
              v-model="eventForm.title"
              type="text"
              placeholder="Event Title"
              class="w-full bg-black/20 backdrop-blur-lg border rounded-md p-3 text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#426CFF] focus:border-transparent transition"
              :class="validationErrors.title ? 'border-red-500' : 'border-white/10'"
            />
            <p v-if="validationErrors.title" class="text-red-400 text-xs mt-1">{{ validationErrors.title }}</p>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="eventDate" class="block text-sm font-medium text-gray-300 mb-1">Date</label>
                <input
                  id="eventDate"
                  v-model="eventForm.eventDate"
                  type="date"
                  class="w-full bg-black/20 backdrop-blur-lg border rounded-md p-3 text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#426CFF] focus:border-transparent transition"
                  :class="validationErrors.eventDate ? 'border-red-500' : 'border-white/10'"
                />
                <p v-if="validationErrors.eventDate" class="text-red-400 text-xs mt-1">{{ validationErrors.eventDate }}</p>
              </div>
              <div>
                <label for="eventTime" class="block text-sm font-medium text-gray-300 mb-1">Time</label>
                <input
                  id="eventTime"
                  v-model="eventForm.eventTime"
                  type="time"
                  class="w-full bg-black/20 backdrop-blur-lg border rounded-md p-3 text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#426CFF] focus:border-transparent transition"
                  :class="validationErrors.eventTime ? 'border-red-500' : 'border-white/10'"
                />
                <p v-if="validationErrors.eventTime" class="text-red-400 text-xs mt-1">{{ validationErrors.eventTime }}</p>
              </div>
            </div>
          
          <div>
            <label for="location" class="block text-sm font-medium text-gray-300 mb-1">Address</label>
            <input
              id="location"
              v-model="rawAddress"
              @change="geocodeAddress"
              type="text"
              placeholder="Type an address..."
              class="w-full bg-black/20 backdrop-blur-lg border rounded-md p-3 text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#426CFF] focus:border-transparent transition"
              :class="validationErrors.location ? 'border-red-500' : 'border-white/10'"
            />
            <p v-if="validationErrors.location" class="text-red-400 text-xs mt-1">{{ validationErrors.location }}</p>
          </div>

          <div>
            <label for="maxParticipants" class="block text-sm font-medium text-gray-300 mb-1">Max Participants (Optional)</label>
            <input
              id="maxParticipants"
              v-model.number="eventForm.maxParticipants"
              type="number"
              placeholder="e.g., 100 (optional)"
              class="w-full bg-black/20 backdrop-blur-lg border rounded-md p-3 text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#426CFF] focus:border-transparent transition border-white/10"
            />
          </div>
          
          <div>
            <label for="eventType" class="block text-sm font-medium text-gray-300 mb-1">Type of Event*</label>
            <select
              id="eventType"
              v-model="eventForm.eventType"
              class="w-full bg-[#1e1e1e] border-b-2 text-lg focus:outline-none focus:border-[#426CFF] transition py-2.5 px-1"
              :class="validationErrors.eventType ? 'border-red-500' : 'border-gray-600'"
              required
            >
              <option value="" disabled>Select type...</option>
              <option value="Party">Party</option>
              <option value="Concert">Concert</option>
              <option value="Festival">Festival</option>
              <option value="Workshop">Workshop</option>
              <option value="Meeting">Meeting</option>
              <option value="Conference">Conference</option>
              <option value="Exhibition">Exhibition</option>
              <option value="Other">Other</option>
            </select>
            <p v-if="validationErrors.eventType" class="text-red-400 text-xs mt-1">{{ validationErrors.eventType }}</p>
          </div>
          
          <div>
            <label for="description" class="block text-sm font-medium text-gray-300 mb-1">Event Description</label>
            <textarea
              id="description"
              v-model="eventForm.description"
              placeholder="Tell us more about your event..."
              rows="3"
              class="w-full bg-black/20 backdrop-blur-lg border rounded-md p-3 text-lg placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#426CFF] focus:border-transparent transition"
              :class="validationErrors.description ? 'border-red-500' : 'border-white/10'"
            ></textarea>
             <p v-if="validationErrors.description" class="text-red-400 text-xs mt-1">{{ validationErrors.description }}</p>
          </div>
          
          <div>
            <label for="linksRelevantes" class="block text-sm font-medium text-gray-300 mb-1">Relevant Link (Optional)</label>
            <input
              id="linksRelevantes"
              v-model="eventForm.linksRelevantes"
              type="url"
              placeholder="e.g., https://example.com/tickets"
              class="w-full bg-black/20 backdrop-blur-lg border rounded-md p-3 text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#426CFF] focus:border-transparent transition"
              :class="validationErrors.linksRelevantes ? 'border-red-500' : 'border-white/10'"
            />
            <p v-if="validationErrors.linksRelevantes" class="text-red-400 text-xs mt-1">{{ validationErrors.linksRelevantes }}</p>
          </div>
          
          <div class="flex items-center gap-3 pt-2">
            <input id="isPublic" v-model="eventForm.isPublic" type="checkbox" class="accent-[#426CFF] w-5 h-5 rounded focus:ring-[#426CFF] border-gray-600" />
            <label for="isPublic" class="text-lg text-gray-300">Make this event public</label>
          </div>
        </div>

        <!-- Right Side -->
        <div class="space-y-6 flex flex-col">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">Event Image</label>
            <div
              @click="triggerFileInput"
              class="relative w-full h-48 bg-black/20 backdrop-blur-lg border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer hover:border-white/40 transition"
              :class="validationErrors.eventImageFile ? 'border-red-500' : 'border-white/20'"
            >
              <div v-if="!previewUrl" class="text-center p-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-500 mb-2 mx-auto group-hover:text-[#426CFF] transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span class="text-sm text-gray-400 group-hover:text-[#426CFF] transition">Click to upload image</span>
                <span class="text-xs text-gray-500 mt-1 block">(Max 5MB. Recommended: 16:9)</span>
              </div>
              <img v-if="previewUrl" :src="previewUrl" alt="Event image preview" class="object-cover w-full h-full" />
              <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  class="hidden"
                  ref="fileInput"
                  @change="handleFileUpload"
              />
            </div>
            <p v-if="validationErrors.eventImageFile" class="text-red-400 text-xs mt-1">{{ validationErrors.eventImageFile }}</p>
          </div>

          <div class="mt-auto pt-4"> <!-- Pushes button to bottom -->
            <button 
              type="submit" 
              class="w-full py-3 bg-[#426CFF] rounded-xl text-white text-lg font-semibold hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
              :disabled="isLoading"
            >
              <span v-if="isLoading">Creating Event...</span>
              <span v-else>Create Event</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  </section>
</template>

<script>
import { eventosService } from '../api/eventos';
import { authStore } from '../stores/authStore';

export default {
  name: 'CreateEventView',
  data() {
    return {
      rawAddress: '', // o que o utilizador escreve no input
      eventForm: {
        title: '',
        description: '',
        eventType: '',
        eventDate: '',
        eventTime: '',
        location: '',       // cidade para pesquisa
        fullAddress: '',    // endereço completo original
        latitude: null,
        longitude: null,
        maxParticipants: null,
        isPublic: true,
        linksRelevantes: '',
        eventImageFile: null,
      },
      previewUrl: null,
      isLoading: false,
      apiError: null,
      apiErrorDetails: [],
      successMessage: null,
      createdEventId: null,
      validationErrors: {},
    };
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click();
    },

    handleFileUpload(event) {
      const file = event.target.files[0];
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        this.validationErrors.eventImageFile = 'File is too large. Max 5MB allowed.';
        return;
      }
      if (!allowedTypes.includes(file.type)) {
        this.validationErrors.eventImageFile = 'Invalid file type. Only JPG, PNG, GIF allowed.';
        return;
      }

      this.eventForm.eventImageFile = file;
      this.previewUrl = URL.createObjectURL(file);
      this.validationErrors.eventImageFile = null;
    },

    async geocodeLocation(address) {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'ShiftApp/1.0 (contact@shiftapp.test)',
          'Accept-Language': 'en'
        }
      });
      const data = await response.json();
      if (!data || !data.length) throw new Error('Location not found');
      return data[0];
    },

    async reverseGeocodeCity(lat, lon) {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'ShiftApp/1.0 (contact@shiftapp.test)',
          'Accept-Language': 'pt'
        }
      });
      const data = await response.json();
      if (!data.address) return 'Unknown';
      return (
        data.address.city ||
        data.address.town ||
        data.address.village ||
        data.address.county ||
        'Unknown'
      );
    },

    async validateAddress() {
      const fullAddress = this.rawAddress.trim();
      if (!fullAddress) return;

      try {
        const coords = await this.geocodeLocation(fullAddress);
        if (!coords || !coords.lat || !coords.lon) throw new Error('Invalid coordinates');

        this.eventForm.fullAddress = fullAddress;
        this.eventForm.latitude = coords.lat;
        this.eventForm.longitude = coords.lon;

        const city = await this.reverseGeocodeCity(coords.lat, coords.lon);
        this.eventForm.location = city || 'Unknown';

        this.validationErrors.location = null;
      } catch (error) {
        this.eventForm.fullAddress = '';
        this.eventForm.latitude = null;
        this.eventForm.longitude = null;
        this.eventForm.location = '';
        this.validationErrors.location = 'Morada não reconhecida. Tente ser mais específico.';
      }
    },

    validateForm() {
      this.validationErrors = {};
      if (!this.eventForm.title) this.validationErrors.title = 'Title is required.';
      if (!this.eventForm.description) this.validationErrors.description = 'Description is required.';
      if (!this.eventForm.eventType) this.validationErrors.eventType = 'Event type is required.';
      if (!this.eventForm.eventDate) this.validationErrors.eventDate = 'Date is required.';
      if (!this.eventForm.eventTime) this.validationErrors.eventTime = 'Time is required.';
      if (!this.eventForm.location) this.validationErrors.location = 'Location is required.';
      if (!this.eventForm.eventImageFile) this.validationErrors.eventImageFile = 'Image is required.';
      
      return Object.keys(this.validationErrors).length === 0;
    },

    async submitForm() {
      this.apiError = null;
      this.apiErrorDetails = [];
      this.successMessage = null;

      if (!this.validateForm()) {
        return;
      }

      this.isLoading = true;

      const formData = new FormData();
      
      // Append all form fields
      formData.append('title', this.eventForm.title);
      formData.append('description', this.eventForm.description);
      formData.append('eventType', this.eventForm.eventType);
      formData.append('eventDate', this.eventForm.eventDate);
      formData.append('eventTime', this.eventForm.eventTime);
      
      // Send the full address in the 'location' field, as the backend expects it there.
      formData.append('location', this.eventForm.fullAddress);

      formData.append('isPublic', this.eventForm.isPublic);

      if (this.eventForm.maxParticipants) {
        formData.append('maxParticipants', this.eventForm.maxParticipants);
      }
      if (this.eventForm.linksRelevantes) {
        formData.append('linksRelevantes', this.eventForm.linksRelevantes);
      }
      
      // Correctly append the image file with the expected field name 'eventImage'
      if (this.eventForm.eventImageFile) {
        formData.append('eventImage', this.eventForm.eventImageFile);
      }

      try {
        const response = await eventosService.createEvent(formData);
        this.successMessage = response.message + " You will be redirected shortly.";
        this.createdEventId = response.eventId;
        setTimeout(() => {
          this.$router.push(`/event/${response.eventId}`);
        }, 2000);
      } catch (error) {
        this.apiError = error.message || 'An unknown error occurred.';
        if (error.details) {
          this.apiErrorDetails = error.details;
        }
      } finally {
        this.isLoading = false;
      }
    },
    async geocodeAddress() {
      if (!this.rawAddress) {
        this.eventForm.location = '';
        this.eventForm.fullAddress = '';
        this.eventForm.latitude = null;
        this.eventForm.longitude = null;
        return;
      }
      // Placeholder for actual geocoding logic
      this.eventForm.location = this.rawAddress.split(',')[0];
      this.eventForm.fullAddress = this.rawAddress;
    }
  }
};
</script>



<style scoped>
/* Add any specific styles if needed, though Tailwind should cover most */
input[type="date"]::-webkit-calendar-picker-indicator {
    filter: invert(0.8); /* Makes the calendar icon lighter for dark themes */
}
input[type="time"]::-webkit-calendar-picker-indicator {
    filter: invert(0.8);
}
select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}
</style>