<template>
  <div>
    <AdminTable
      :columns="columns"
      :items="comments"
      :loading="loading"
      :currentPage="currentPage"
      :totalPages="totalPages"
      :totalItems="totalItems"
      :pageSize="pageSize"
      searchPlaceholder="Search in comments..."
      @search="handleSearch"
      @sort="handleSort"
      @page-change="handlePageChange"
    >
      <template #rows>
        <tr 
          v-for="comment in comments" 
          :key="comment.idComentario"
          class="border-b border-stone-700 hover:bg-white hover:bg-opacity-5"
        >
          <td class="py-3 px-4 max-w-md">
            <div class="truncate" :title="comment.conteudo">{{ comment.conteudo }}</div>
          </td>
          <td class="py-3 px-4">{{ comment.userName }}</td>
          <td class="py-3 px-4">{{ comment.eventTitle }}</td>
          <td class="py-3 px-4">{{ formatDate(comment.dataComentario) }}</td>
          <td class="py-3 px-4">
            <div class="flex gap-2">
              <button 
                class="p-2 text-red-500 hover:bg-red-500 hover:text-black hover:bg-opacity-20 rounded-lg transition-colors"
                @click="handleDelete(comment.idComentario)"
              >
                Delete
              </button>
            </div>
          </td>
        </tr>
      </template>
    </AdminTable>
    <div v-if="error" class="text-red-500 p-4">{{ error }}</div>
  </div>
</template>

<script>
import AdminTable from './AdminTable.vue';
import { adminService } from '../../api/adminService';

export default {
  name: 'AdminCommentsTable',
  components: {
    AdminTable
  },
  data() {
    return {
      loading: true,
      error: null,
      columns: [
        { key: 'conteudo', label: 'Comment', sortable: true },
        { key: 'userName', label: 'User', sortable: true },
        { key: 'eventTitle', label: 'Event', sortable: true },
        { key: 'dataComentario', label: 'Date', sortable: true }
      ],
      comments: [],
      currentPage: 0,
      totalPages: 0,
      totalItems: 0,
      pageSize: 10,
      searchQuery: '',
      sortBy: 'dataComentario',
      sortOrder: 'desc'
    }
  },
  methods: {
    async fetchComments() {
      this.loading = true;
      this.error = null;
      try {
        const params = {
          page: this.currentPage,
          pageSize: this.pageSize,
          query: this.searchQuery,
          sortBy: this.sortBy,
          order: this.sortOrder
        };
        const response = await adminService.getComments(params);
        this.comments = response.data.map(c => ({
          idComentario: c.commentId,
          conteudo: c.text,
          userName: c.user.userName,
          eventTitle: c.eventTitle,
          dataComentario: c.date
        }));
        this.totalItems = response.pagination.totalItems;
        this.totalPages = response.pagination.totalPages;
      } catch (err) {
        this.error = err.message || 'Failed to fetch comments.';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleString('pt-PT');
    },
    handleSearch(query) {
      this.searchQuery = query;
      this.currentPage = 0;
      this.fetchComments();
    },
    handleSort({ key, order }) {
      this.sortBy = key;
      this.sortOrder = order;
      this.fetchComments();
    },
    handlePageChange(page) {
      this.currentPage = page;
      this.fetchComments();
    },
    async handleDelete(commentId) {
      if (confirm('Are you sure you want to permanently delete this comment?')) {
        try {
          await adminService.deleteComment(commentId);
          alert('Comment deleted successfully.');
          // Refresh a lista de comentários
          this.fetchComments();
        } catch (err) {
          this.error = err.message || 'Failed to delete comment.';
          alert(this.error);
        }
      }
    }
  },
  mounted() {
    this.fetchComments();
  }
}
</script>