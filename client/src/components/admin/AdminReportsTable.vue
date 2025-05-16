<template>
  <div>
    <AdminTable
      :columns="columns"
      :currentPage="currentPage"
      :totalPages="totalPages"
      :totalItems="totalItems"
      :pageSize="pageSize"
      searchPlaceholder="Search in reports..."
      @search="handleSearch"
      @sort="handleSort"
      @page-change="handlePageChange"
    >
      <template #filters>
        <select 
          v-model="filters.status"
          class="px-4 py-2 bg-black bg-opacity-30 rounded-xl text-stone-50 border border-stone-700 focus:border-[#FFD300]"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </select>

        <select 
          v-model="filters.contentType"
          class="px-4 py-2 bg-black bg-opacity-30 rounded-xl text-stone-50 border border-stone-700 focus:border-[#FFD300]"
        >
          <option value="">All Types</option>
          <option value="event">Event</option>
          <option value="comment">Comment</option>
        </select>
      </template>

      <template #rows>
        <tr 
          v-for="report in reports" 
          :key="report.idDenuncia"
          class="border-b border-stone-700 hover:bg-white hover:bg-opacity-5"
        >
          <td class="py-3 px-4 max-w-md">
            <div class="truncate">{{ report.motivo }}</div>
          </td>
          <td class="py-3 px-4">{{ report.contentType }}</td>
          <td class="py-3 px-4">{{ report.reporterName }}</td>
          <td class="py-3 px-4">{{ formatDate(report.dataDenuncia) }}</td>
          <td class="py-3 px-4">
            <span 
              :class="[
                'px-2 py-1 rounded-full text-xs',
                {
                  'bg-yellow-500 bg-opacity-20 text-black': report.status === 'pending',
                  'bg-green-500 bg-opacity-20 text-black': report.status === 'resolved',
                  'bg-red-500 bg-opacity-20 text-black': report.status === 'dismissed'
                }
              ]"
            >
              {{ report.status }}
            </span>
          </td>
          <td class="py-3 px-4">
            <div class="flex gap-2">
              <button 
                v-if="report.status === 'pending'"
                class="p-2 text-[#FFD300] hover:bg-[#FFD300] hover:text-black hover:bg-opacity-20 rounded-lg transition-colors"
                @click="handleResolve(report.idDenuncia)"
              >
                Resolve
              </button>
              <button 
                v-if="report.status === 'pending'"
                class="p-2 text-red-500 hover:bg-red-500 hover:text-black hover:bg-opacity-20 rounded-lg transition-colors"
                @click="handleDismiss(report.idDenuncia)"
              >
                Dismiss
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
  name: 'AdminReportsTable',
  components: {
    AdminTable
  },
  data() {
    return {
      columns: [
        { key: 'motivo', label: 'Reason', sortable: true },
        { key: 'contentType', label: 'Type', sortable: true },
        { key: 'reporterName', label: 'Reporter', sortable: true },
        { key: 'dataDenuncia', label: 'Date', sortable: true },
        { key: 'status', label: 'Status', sortable: true }
      ],
      filters: {
        status: '',
        contentType: ''
      },
      reports: [
        {
          idDenuncia: 1,
          motivo: 'Inappropriate content in event description',
          contentType: 'event',
          reporterName: 'John Doe',
          dataDenuncia: '2025-06-10T20:00:00Z',
          status: 'pending'
        },
        {
          idDenuncia: 2,
          motivo: 'Offensive comment',
          contentType: 'comment',
          reporterName: 'Jane Smith',
          dataDenuncia: '2025-06-11T15:30:00Z',
          status: 'resolved'
        },
        {
          idDenuncia: 3,
          motivo: 'Spam content in event',
          contentType: 'event',
          reporterName: 'Mike Johnson',
          dataDenuncia: '2025-06-12T10:15:00Z',
          status: 'dismissed'
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
    handleResolve(reportId) {
      console.log('Resolve report:', reportId);
    },
    handleDismiss(reportId) {
      console.log('Dismiss report:', reportId);
    }
  },
  watch: {
    'filters.status': function() {
      this.currentPage = 0;
    },
    'filters.contentType': function() {
      this.currentPage = 0;
    }
  }
}
</script>