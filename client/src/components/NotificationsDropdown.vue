<template>
  <div class="relative" ref="dropdown">
    <!-- Bell Icon Trigger -->
    <button @click="toggleDropdown" class="relative p-2 rounded-full hover:bg-stone-700">
      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
      </svg>
      <span v-if="unreadCount > 0" class="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-stone-800"></span>
    </button>

    <!-- Dropdown Panel -->
    <div v-if="isOpen" class="absolute right-0 mt-2 w-80 bg-stone-800 border border-stone-700 rounded-lg shadow-lg z-50">
      <div class="p-3 border-b border-stone-700 flex justify-between items-center">
        <h3 class="font-semibold text-white">Notifications</h3>
      </div>
      <div v-if="isLoading" class="p-4 text-center text-stone-400">Loading...</div>
      <div v-else-if="error" class="p-4 text-center text-red-400">{{ error }}</div>
      <div v-else-if="notifications.length === 0" class="p-4 text-center text-stone-400">You have no notifications.</div>
      <ul v-else class="max-h-96 overflow-y-auto">
        <li v-for="notification in notifications" :key="notification.notificationId" class="border-b border-stone-700 last:border-b-0">
          <router-link :to="notification.link || '#'" class="block p-3 hover:bg-stone-700" @click="isOpen = false">
            <div class="flex items-start justify-between">
              <p class="text-sm text-stone-200" :class="{ 'font-bold': !notification.isRead }">{{ notification.message }}</p>
              <button @click.prevent.stop="toggleReadStatus(notification)" class="ml-2 mt-1 p-1 rounded-full flex-shrink-0" :title="notification.isRead ? 'Mark as unread' : 'Mark as read'">
                <div class="w-2.5 h-2.5 rounded-full" :class="notification.isRead ? 'bg-stone-600' : 'bg-yellow-400'"></div>
              </button>
            </div>
            <p class="text-xs text-stone-400 mt-1">{{ timeAgo(notification.createdAt) }}</p>
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { notificationsService } from '../api/notifications';

export default {
  name: 'NotificationsDropdown',
  data() {
    return {
      isOpen: false,
      isLoading: false,
      error: null,
      notifications: [],
    };
  },
  computed: {
    unreadCount() {
      return this.notifications.filter(n => !n.isRead).length;
    }
  },
  methods: {
    handleClickOutside(event) {
      if (this.$refs.dropdown && !this.$refs.dropdown.contains(event.target)) {
        this.isOpen = false;
      }
    },
    toggleDropdown() {
      this.isOpen = !this.isOpen;
      if (this.isOpen) {
        this.fetchNotifications();
      }
    },
    async fetchNotifications() {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await notificationsService.listUserNotifications();
        this.notifications = response.data.map(n => ({
          ...n,
          link: n.link ? n.link.replace('/events/', '/event/') : '#'
        }));
      } catch (err) {
        this.error = err.message || 'Failed to load notifications.';
        console.error(err);
      } finally {
        this.isLoading = false;
      }
    },
    async toggleReadStatus(notification) {
      const newStatus = !notification.isRead;
      try {
        const updatedNotification = await notificationsService.updateNotificationStatus(notification.notificationId, newStatus);
        notification.isRead = updatedNotification.isRead;
      } catch (err) {
        alert(`Error updating notification: ${err.message}`);
        console.error(err);
      }
    },
    timeAgo(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      const seconds = Math.floor((new Date() - date) / 1000);
      let interval = seconds / 31536000;
      if (interval > 1) return Math.floor(interval) + " years ago";
      interval = seconds / 2592000;
      if (interval > 1) return Math.floor(interval) + " months ago";
      interval = seconds / 86400;
      if (interval > 1) return Math.floor(interval) + " days ago";
      interval = seconds / 3600;
      if (interval > 1) return Math.floor(interval) + " hours ago";
      interval = seconds / 60;
      if (interval > 1) return Math.floor(interval) + " minutes ago";
      return Math.floor(seconds) + " seconds ago";
    }
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside);
    this.fetchNotifications(); // Fetch inicial para obter a contagem de não lidas
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  }
};
</script>