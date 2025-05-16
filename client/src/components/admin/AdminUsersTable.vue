<template>
  <div>
    <AdminTable
      :columns="columns"
      :currentPage="currentPage"
      :totalPages="totalPages"
      :totalItems="totalItems"
      :pageSize="pageSize"
      searchPlaceholder="Search users by name or email..."
      @search="handleSearch"
      @sort="handleSort"
      @page-change="handlePageChange"
    >
      <template #rows>
        <tr 
          v-for="user in users" 
          :key="user.idUtilizador"
          class="border-b border-stone-700 hover:bg-white hover:bg-opacity-5"
        >
          <td class="py-3 px-4">
            <div class="flex items-center gap-3">
              <img 
                :src="user.imagemUtilizador || '/defaultProfile.svg'" 
                :alt="user.nome"
                class="w-10 h-10 rounded-full object-cover"
              />
              {{ user.nome }}
            </div>
          </td>
          <td class="py-3 px-4">{{ user.email }}</td>
          <td class="py-3 px-4">{{ formatDate(user.dataRegisto) }}</td>
          <td class="py-3 px-4">{{ user.tipoUtilizador }}</td>
          <td class="py-3 px-4">
            <div class="flex gap-2">
              <button 
                class="p-2 text-red-500 hover:bg-red-500 hover:text-black hover:bg-opacity-20 rounded-lg transition-colors"
                @click="handleDelete(user.idUtilizador)"
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

export default {
  name: 'AdminUsersTable',
  components: {
    AdminTable
  },
  data() {
    return {
      columns: [
        { key: 'nome', label: 'Name', sortable: true },
        { key: 'email', label: 'Email', sortable: true },
        { key: 'dataRegisto', label: 'Registration Date', sortable: true },
        { key: 'tipoUtilizador', label: 'Role', sortable: true }
      ],
      users: [
        {
          idUtilizador: 1,
          nome: 'John Doe',
          email: 'john@example.com',
          dataRegisto: '2025-01-15',
          tipoUtilizador: 'User',
          imagemUtilizador: null
        },
        {
          idUtilizador: 2,
          nome: 'Jane Smith',
          email: 'jane@example.com',
          dataRegisto: '2025-02-20',
          tipoUtilizador: 'Moderator',
          imagemUtilizador: null
        },
        {
          idUtilizador: 3,
          nome: 'Admin User',
          email: 'admin@example.com',
          dataRegisto: '2024-12-01',
          tipoUtilizador: 'Admin',
          imagemUtilizador: null
        }
      ],
      currentPage: 0,
      totalPages: 1,
      totalItems: 3,
      pageSize: 10
    }
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    handleSearch(query) {
      console.log('Search:', query);
    },
    handleSort({ key, order }) {
      console.log('Sort:', key, order);
    },
    handlePageChange(page) {
      this.currentPage = page;
    },
    handleDelete(userId) {
      console.log('Delete user:', userId);
    }
  }
}
</script>