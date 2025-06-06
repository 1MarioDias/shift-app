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
import { adminService } from '../../api/adminService'; // Adjust path

export default {
  name: 'AdminUsersTable',
  components: { AdminTable },
  data() {
    return {
      columns: [
        { key: 'nome', label: 'Name', sortable: true },
        { key: 'email', label: 'Email', sortable: true },
        { key: 'dataRegisto', label: 'Registration Date', sortable: true }, // Matches API: createdAt
        { key: 'tipoUtilizador', label: 'Role', sortable: true } // Matches API: role
      ],
      users: [],
      currentPage: 0,
      totalPages: 0,
      totalItems: 0,
      pageSize: 10,
      loading: false,
      error: null,
      searchQuery: '',
      sortBy: 'dataRegisto',
      sortOrder: 'desc'
    };
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('en-GB', { // Or your preferred locale
        year: 'numeric', month: 'long', day: 'numeric'
      });
    },
    async fetchUsers() {
      this.loading = true;
      this.error = null;
      try {
        const response = await adminService.getUsers({
          page: this.currentPage,
          pageSize: this.pageSize,
          query: this.searchQuery, // searchQuery is v-model'd in AdminTable and emitted
          sortBy: this.sortBy,
          order: this.sortOrder
        });
        // Correctly map 'name' from API to 'nome' for the template
        // The backend's /users endpoint (getAllUsers) returns: { userId, name, email, createdAt, role }
        this.users = response.data.map(u => ({
          idUtilizador: u.userId, // Map userId to idUtilizador if your template uses that
          nome: u.name,           // Map API's 'name' to 'nome'
          email: u.email,
          dataRegisto: u.createdAt, // Map API's 'createdAt' to 'dataRegisto'
          tipoUtilizador: u.role,   // Map API's 'role' to 'tipoUtilizador'
          // imagemUtilizador: u.profileImageUrl // This field is not provided by the current backend API for the user list
                                                // So, user.imagemUtilizador in template will be undefined, falling back to default.
        }));
        this.totalItems = response.pagination.totalItems;
        this.totalPages = response.pagination.totalPages;
      } catch (err) {
        this.error = err.message || 'Failed to fetch users.';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    handleSearch(query) {
      this.searchQuery = query;
      this.currentPage = 0;
      this.fetchUsers();
    },
    handleSort({ key, order }) {
      this.sortBy = key;
      this.sortOrder = order;
      this.fetchUsers();
    },
    handlePageChange(page) {
      this.currentPage = page;
      this.fetchUsers();
    },
    async handleDelete(userId) {
      if (confirm('Are you sure you want to delete this user?')) {
        try {
          await adminService.deleteUser(userId);
          this.fetchUsers(); // Refresh list
        } catch (err) {
          alert(err.message || 'Failed to delete user.');
          console.error(err);
        }
      }
    }
  },
  mounted() {
    this.fetchUsers();
  }
};
</script>