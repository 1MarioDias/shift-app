<template>
  <div>
    <div v-if="events.length > 0" class="space-y-4">
      <div v-for="event in events" :key="event.eventId"
        class="bg-black/20 backdrop-blur-lg border border-white/10 rounded-lg p-4 flex items-center justify-between hover:bg-black/40 transition-all duration-300">
        <router-link :to="'/event/' + event.eventId" class="flex items-center gap-4 flex-grow">
          <img :src="event.image || '/defaultEvent.jpg'" alt="Event" class="w-20 h-20 object-cover rounded-md">
          <div>
            <h3 class="font-semibold text-lg">{{ event.title }}</h3>
            <p class="text-sm text-stone-400">{{ formatDate(event.date) }} - {{ event.location }}</p>
          </div>
        </router-link>
        <button @click="() => onAction(event.eventId, actionContext)"
          class="ml-4 px-3 py-1 text-sm font-medium rounded bg-red-600 text-white hover:bg-red-700 transition-colors flex-shrink-0">
          {{ actionLabel }}
        </button>
      </div>
    </div>
    <div v-else class="text-center text-stone-400 py-8">
      <p>{{ emptyMessage }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EventListProfile',
  props: {
    events: {
      type: Array,
      required: true,
    },
    onAction: {
      type: Function,
      required: true,
    },
    actionLabel: {
      type: String,
      required: true,
    },
    actionContext: {
      type: String,
      default: '',
    },
    emptyMessage: {
      type: String,
      default: 'No events to display.',
    },
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return '';
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', options);
    },
  },
};
</script>