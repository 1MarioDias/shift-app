<template>
  <div>
    <AdminTable
      :columns="columns"
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
            <div class="truncate">{{ comment.conteudo }}</div>
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
  </div>
</template>

<script>
import AdminTable from './AdminTable.vue';

export default {
  name: 'AdminCommentsTable',
  components: {
    AdminTable
  },
  data() {
    return {
      columns: [
        { key: 'conteudo', label: 'Comment', sortable: true },
        { key: 'userName', label: 'User', sortable: true },
        { key: 'eventTitle', label: 'Event', sortable: true },
        { key: 'dataComentario', label: 'Date', sortable: true }
      ],
      comments: [
        {
          idComentario: 1,
          conteudo: 'Great event! Looking forward to the next one.',
          userName: 'John Doe',
          eventTitle: 'Summer Festival',
          dataComentario: '2025-06-11T10:30:00Z'
        },
        {
          idComentario: 2,
          conteudo: 'The venue was perfect for this type of event.',
          userName: 'Jane Smith',
          eventTitle: 'Tech Conference',
          dataComentario: '2025-06-12T15:45:00Z'
        },
        {
          idComentario: 3,
          conteudo: 'Amazing organization and great crowd!',
          userName: 'Mike Johnson',
          eventTitle: 'Music Concert',
          dataComentario: '2025-06-13T20:00:00Z'
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
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
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
    handleDelete(commentId) {
      console.log('Delete comment:', commentId);
    }
  }
}
</script>