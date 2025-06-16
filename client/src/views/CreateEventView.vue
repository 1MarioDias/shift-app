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
            <label for="title" class="block text-sm font-medium text-gray-300 mb-1">Event Title*</label>
            <input
              id="title"
              v-model="eventForm.title"
              type="text"
              placeholder="e.g., Summer Music Festival"
              class="w-full bg-transparent border-b-2 placeholder-gray-500 text-xl focus:outline-none focus:border-[#426CFF] transition"
              :class="validationErrors.title ? 'border-red-500' : 'border-gray-600'"
              required
            />
            <p v-if="validationErrors.title" class="text-red-400 text-xs mt-1">{{ validationErrors.title }}</p>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="eventDate" class="block text-sm font-medium text-gray-300 mb-1">Date*</label>
              <input
                id="eventDate"
                v-model="eventForm.eventDate"
                type="date"
                class="w-full bg-transparent border-b-2 placeholder-gray-500 text-lg focus:outline-none focus:border-[#426CFF] transition"
                :class="validationErrors.eventDate ? 'border-red-500' : 'border-gray-600'"
                required
              />
              <p v-if="validationErrors.eventDate" class="text-red-400 text-xs mt-1">{{ validationErrors.eventDate }}</p>
            </div>
            <div>
              <label for="eventTime" class="block text-sm font-medium text-gray-300 mb-1">Time*</label>
              <input
                id="eventTime"
                v-model="eventForm.eventTime"
                type="time"
                class="w-full bg-transparent border-b-2 placeholder-gray-500 text-lg focus:outline-none focus:border-[#426CFF] transition"
                :class="validationErrors.eventTime ? 'border-red-500' : 'border-gray-600'"
                required
              />
              <p v-if="validationErrors.eventTime" class="text-red-400 text-xs mt-1">{{ validationErrors.eventTime }}</p>
            </div>
          </div>
          
          <div>
            <label for="location" class="block text-sm font-medium text-gray-300 mb-1">Location*</label>
            <input
              id="location"
              v-model="eventForm.location"
              type="text"
              placeholder="e.g., Central Park, Lisbon"
              class="w-full bg-transparent border-b-2 placeholder-gray-500 text-lg focus:outline-none focus:border-[#426CFF] transition"
              :class="validationErrors.location ? 'border-red-500' : 'border-gray-600'"
              required
            />
            <p v-if="validationErrors.location" class="text-red-400 text-xs mt-1">{{ validationErrors.location }}</p>
          </div>
          
          <div>
            <label for="maxParticipants" class="block text-sm font-medium text-gray-300 mb-1">Max Participants (Optional, min 2 if provided)</label>
            <input
              id="maxParticipants"
              v-model.number="eventForm.maxParticipants"
              type="number"
              min="2"
              placeholder="e.g., 100"
              class="w-full bg-transparent border-b-2 placeholder-gray-500 text-lg focus:outline-none focus:border-[#426CFF] transition"
              :class="validationErrors.maxParticipants ? 'border-red-500' : 'border-gray-600'"
            />
            <p v-if="validationErrors.maxParticipants" class="text-red-400 text-xs mt-1">{{ validationErrors.maxParticipants }}</p>
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
              class="w-full bg-transparent border-2 placeholder-gray-500 text-lg resize-none focus:outline-none focus:border-[#426CFF] transition p-2 rounded-md"
              :class="validationErrors.description ? 'border-red-500' : 'border-gray-600'"
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
              class="w-full bg-transparent border-b-2 placeholder-gray-500 text-lg focus:outline-none focus:border-[#426CFF] transition"
              :class="validationErrors.linksRelevantes ? 'border-red-500' : 'border-gray-600'"
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
            <label class="block text-sm font-medium text-gray-300 mb-1">Event Image (Optional)</label>
            <div
              class="w-full h-60 md:h-80 bg-gray-800 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group hover:border-[#426CFF] transition"
              @click="triggerFileInput"
              :class="validationErrors.eventImageFile ? 'border-red-500 hover:border-red-700' : 'border-gray-600'"
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
import { eventosService } from '../api/eventos'; // Adjust path as needed
import { authStore } from '../stores/authStore'; // Adjust path as needed

export default {
  name: 'CreateEventView',
  data() {
    return {
      eventForm: {
        title: '',
        description: '',
        eventType: '',
        eventDate: '',
        eventTime: '',
        location: '',
        maxParticipants: null, // Initialize as null for optional
        isPublic: true,
        linksRelevantes: '',
        eventImageFile: null, // To store the File object
      },
      previewUrl: null,
      isLoading: false,
      apiError: null,
      apiErrorDetails: [],
      successMessage: null,
      createdEventId: null,
      validationErrors: {}, // For client-side or specific field errors from backend
    };
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            this.validationErrors.eventImageFile = 'File is too large. Max 5MB allowed.';
            this.previewUrl = null;
            this.eventForm.eventImageFile = null;
            this.$refs.fileInput.value = ''; // Reset file input
            return;
        }
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            this.validationErrors.eventImageFile = 'Invalid file type. Only JPG, PNG, GIF allowed.';
            this.previewUrl = null;
            this.eventForm.eventImageFile = null;
            this.$refs.fileInput.value = ''; // Reset file input
            return;
        }
        this.eventForm.eventImageFile = file;
        this.previewUrl = URL.createObjectURL(file);
        this.validationErrors.eventImageFile = null; // Clear error
      } else {
        this.eventForm.eventImageFile = null;
        this.previewUrl = null;
      }
    },
    validateForm() {
      this.validationErrors = {};
      let isValid = true;

      if (!this.eventForm.title.trim()) {
        this.validationErrors.title = 'Event title is required.';
        isValid = false;
      } else if (this.eventForm.title.trim().length < 5 || this.eventForm.title.trim().length > 255) {
        this.validationErrors.title = 'Title must be between 5 and 255 characters.';
        isValid = false;
      }

      if (!this.eventForm.eventDate) {
        this.validationErrors.eventDate = 'Event date is required.';
        isValid = false;
      }
      if (!this.eventForm.eventTime) {
        this.validationErrors.eventTime = 'Event time is required.';
        isValid = false;
      }
      if (this.eventForm.eventDate && this.eventForm.eventTime) {
        const eventDateTime = new Date(`${this.eventForm.eventDate}T${this.eventForm.eventTime}`);
        if (eventDateTime <= new Date()) {
          this.validationErrors.eventDate = 'Event date and time must be in the future.';
          isValid = false;
        }
      }
      if (!this.eventForm.location.trim()) {
        this.validationErrors.location = 'Location is required.';
        isValid = false;
      }
      if (!this.eventForm.eventType) {
        this.validationErrors.eventType = 'Event type is required.';
        isValid = false;
      }
      if (this.eventForm.maxParticipants !== null && (isNaN(parseInt(this.eventForm.maxParticipants)) || parseInt(this.eventForm.maxParticipants) <= 1)) {
        this.validationErrors.maxParticipants = 'If provided, max participants must be a number greater than 1.';
        isValid = false;
      }
      // LinksRelevantes: basic URL validation (optional)
      if (this.eventForm.linksRelevantes && !/^(ftp|http|https):\/\/[^ "]+$/.test(this.eventForm.linksRelevantes)) {
        this.validationErrors.linksRelevantes = 'Please enter a valid URL (e.g., http://example.com).';
        isValid = false;
      }

      return isValid;
    },
    async submitForm() {
      this.apiError = null;
      this.apiErrorDetails = [];
      this.successMessage = null;
      this.createdEventId = null;

      if (!this.validateForm()) {
        this.apiError = "Please correct the errors in the form.";
        return;
      }

      if (!authStore.isLoggedIn()) {
          this.apiError = "You must be logged in to create an event. Redirecting to login...";
          setTimeout(() => this.$router.push('/login'), 2000);
          return;
      }

      this.isLoading = true;

      const formData = new FormData();
      formData.append('title', this.eventForm.title);
      formData.append('description', this.eventForm.description);
      formData.append('eventType', this.eventForm.eventType);
      formData.append('eventDate', this.eventForm.eventDate);
      formData.append('eventTime', this.eventForm.eventTime);
      formData.append('location', this.eventForm.location);
      if (this.eventForm.maxParticipants !== null && this.eventForm.maxParticipants !== '') {
        formData.append('maxParticipants', this.eventForm.maxParticipants);
      }
      formData.append('isPublic', this.eventForm.isPublic); // Boolean will be stringified
      formData.append('linksRelevantes', this.eventForm.linksRelevantes);
      
      if (this.eventForm.eventImageFile) {
        formData.append('eventImage', this.eventForm.eventImageFile); // Key 'eventImage' for Multer
      }

      try {
        const result = await eventosService.createEvent(formData);
        this.successMessage = result.message || 'Event created successfully!';
        this.createdEventId = result.eventId;
        // Reset form (optional)
        // this.eventForm = { title: '', description: '', eventType: '', eventDate: '', eventTime: '', location: '', maxParticipants: null, isPublic: true, linksRelevantes: '', eventImageFile: null };
        // this.previewUrl = null;
        // this.$refs.fileInput.value = '';
      } catch (error) {
        this.apiError = error.message || 'An unknown error occurred.';
        if (error.details) {
            this.apiErrorDetails = error.details; // For Sequelize validation errors from backend
        }
        console.error("Submission error:", error);
      } finally {
        this.isLoading = false;
      }
    }
  },
  mounted() {
    // Set a default date if needed, e.g., tomorrow
    // const tomorrow = new Date();
    // tomorrow.setDate(tomorrow.getDate() + 1);
    // this.eventForm.eventDate = tomorrow.toISOString().split('T')[0];
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