<template>
  <div>
    <!-- Table Filters -->
    <div class="mb-6 flex gap-4 flex-wrap">
      <div class="flex-1 min-w-[200px]">
        <input 
          type="text"
          v-model="searchQuery"
          :placeholder="searchPlaceholder"
          class="w-full px-4 py-2 bg-black bg-opacity-30 rounded-xl text-stone-50 placeholder-stone-400 border border-stone-700 focus:border-[#FFD300] transition-colors"
        />
      </div>
      <slot name="filters"></slot>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr>
            <th 
              v-for="column in columns" 
              :key="column.key"
              class="text-left py-3 px-4 text-stone-400 border-b border-stone-700"
            >
              <div class="flex items-center gap-2">
                {{ column.label }}
                <button 
                  v-if="column.sortable"
                  @click="updateSort(column.key)"
                  class="hover:text-[#FFD300]"
                >
                  <span v-if="sortBy === column.key">
                    {{ order === 'asc' ? '↑' : '↓' }}
                  </span>
                  <span v-else>↕</span>
                </button>
              </div>
            </th>
            <th class="text-left py-3 px-4 text-stone-400 border-b border-stone-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          <slot name="rows"></slot>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="mt-6 flex justify-between items-center">
      <div class="text-stone-400">
        Showing {{ startIndex + 1 }}-{{ endIndex }} of {{ totalItems }}
      </div>
      <div class="flex gap-2">
        <button 
          @click="prevPage"
          :disabled="currentPage === 0"
          :class="[
            'px-3 py-1 rounded-lg transition-colors',
            currentPage === 0
              ? 'bg-stone-800 text-stone-600'
              : 'bg-stone-800 text-stone-50 hover:bg-[#FFD300] hover:text-black'
          ]"
        >
          Previous
        </button>
        <button 
          @click="nextPage"
          :disabled="isLastPage"
          :class="[
            'px-3 py-1 rounded-lg transition-colors',
            isLastPage
              ? 'bg-stone-800 text-stone-600'
              : 'bg-stone-800 text-stone-50 hover:bg-[#FFD300] hover:text-black'
          ]"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminTable',
  props: {
    columns: {
      type: Array,
      required: true
    },
    searchPlaceholder: {
      type: String,
      default: 'Search...'
    },
    currentPage: {
      type: Number,
      required: true
    },
    totalPages: {
      type: Number,
      required: true
    },
    totalItems: {
      type: Number,
      required: true
    },
    pageSize: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      searchQuery: '',
      sortBy: '',
      order: 'asc'
    }
  },
  computed: {
    startIndex() {
      return this.currentPage * this.pageSize;
    },
    endIndex() {
      return Math.min((this.currentPage + 1) * this.pageSize, this.totalItems);
    },
    isLastPage() {
      return this.currentPage >= this.totalPages - 1;
    }
  },
  methods: {
    updateSort(key) {
      if (this.sortBy === key) {
        this.order = this.order === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortBy = key;
        this.order = 'asc';
      }
      this.$emit('sort', { key: this.sortBy, order: this.order });
    },
    prevPage() {
      this.$emit('page-change', this.currentPage - 1);
    },
    nextPage() {
      this.$emit('page-change', this.currentPage + 1);
    }
  },
  watch: {
    searchQuery(val) {
      this.$emit('search', val);
    }
  }
}
</script>