<template>
  <div class="min-h-screen px-8 py-6">
    <div class="mb-8">
      <h1 class="text-4xl font-bold text-stone-50">Admin Dashboard</h1>
      <p class="text-stone-400">Manage events, users, comments and reports</p>
    </div>

    <div class="mb-8">
      <nav class="flex gap-2">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'px-4 py-2 rounded-xl font-medium transition-colors',
            activeTab === tab.id 
              ? 'bg-[#FFD300] text-black' 
              : 'text-stone-50 hover:bg-white hover:bg-opacity-10'
          ]"
        >
          {{ tab.name }}
        </button>
      </nav>
    </div>

    <div class="bg-white bg-opacity-10 rounded-2xl backdrop-blur-md shadow-xl p-6">
      <AdminEventsTable v-if="activeTab === 'events'" />
      <AdminUsersTable v-if="activeTab === 'users'" />
      <AdminCommentsTable v-if="activeTab === 'comments'" />
      <AdminReportsTable v-if="activeTab === 'reports'" />
    </div>
  </div>
</template>

<script>
import AdminEventsTable from '../../components/admin/AdminEventsTable.vue';
import AdminUsersTable from '../../components/admin/AdminUsersTable.vue';
import AdminCommentsTable from '../../components/admin/AdminCommentsTable.vue';
import AdminReportsTable from '../../components/admin/AdminReportsTable.vue';


export default {
  name: 'AdminView',
  components: {
    AdminEventsTable,
    AdminUsersTable,
    AdminCommentsTable,
    AdminReportsTable
  },
  data() {
    return {
      activeTab: 'events',
      tabs: [
        { id: 'events', name: 'Events' },
        { id: 'users', name: 'Users' },
        { id: 'comments', name: 'Comments' },
        { id: 'reports', name: 'Reports' }
      ]
    }
  }
}
</script>