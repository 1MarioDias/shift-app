<template>
  <section class="p-10 pt-3 text-white font-sans">
    <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
      <!-- Left Side  -->
      <div class="space-y-6">
        <input
          type="text"
          placeholder="Event Title"
          class="w-full bg-transparent border-b-2 border-white placeholder-white text-3xl font-bold focus:outline-none focus:border-[#426CFF] transition"
        />
      
        <!-- date  -->
        <input
        type="date"
        class="w-full bg-transparent border-b-2 border-white placeholder-white text-lg focus:outline-none focus:border-[#426CFF] transition"
        />
      
        <!-- time  -->
        <input
        type="time"
        class="w-full bg-transparent border-b-2 border-white placeholder-white text-lg focus:outline-none focus:border-[#426CFF] transition"
        />
      
        <!-- location  -->
        <input
          type="text"
          placeholder="Location"
          class="w-full bg-transparent border-b-2 border-white placeholder-white text-lg focus:outline-none focus:border-[#426CFF] transition"
        />
      
        <!-- nº participants  -->
        <input
          type="number"
          placeholder="Max Participants"
          class="w-full bg-transparent border-b-2 border-white placeholder-white text-lg focus:outline-none focus:border-[#426CFF] transition"
        />
      
        <!-- event type  -->
        <select
          class="w-full bg-[#1e1e1e] border-b-2 border-white text-lg focus:outline-none focus:border-[#426CFF] transition"
        >
          <option disabled selected>Type of Event</option>
          <option>Party</option>
          <option>Concert</option>
          <option>Festival</option>
          <option>Workshop</option>
        </select>
      
        <!-- description  -->
        <textarea
          placeholder="Event Description"
          class="w-full h-22 bg-transparent border-b-2 border-white placeholder-white text-lg resize-none focus:outline-none focus:border-[#426CFF] transition"
        ></textarea>
      
        <!-- links  -->
        <input
          type="url"
          placeholder="Relevant Links (Google Forms, Spotify, etc)"
          class="w-full bg-transparent border-b-2 border-white placeholder-white text-lg focus:outline-none focus:border-[#426CFF] transition"
        />
      
        <!-- public event query  -->
        <div class="flex items-center gap-3">
          <label for="isPublic">Public Event?</label>
          <input id="isPublic" type="checkbox" class="accent-[#426CFF] w-5 h-5" />
        </div>
      </div>

      <!-- Right Side  -->
      <div class="space-y-6">

              
        <!-- Upload img  -->
        <div
            class="w-full h-110 bg-stone-800 border border-white rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden"
            @click="triggerFileInput"
            >
            <span v-if="!previewUrl" class="text-sm text-stone-400">Upload Event Image</span>
            <img v-if="previewUrl" :src="previewUrl" alt="Preview" class="object-cover w-full h-full rounded-2xl" />
            <input
                type="file"
                accept="image/*"
                class="hidden"
                ref="fileInput"
                @change="handleFileUpload"
            />
        </div>

        <!-- save button  -->
        <button class="w-full py-3 bg-[#426CFF] rounded-2xl text-white text-lg font-medium hover:bg-blue-700 transition">
          Save
        </button>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'CreateEventView',

  data() {
    return {
        previewUrl: null,
    };
    },
    methods: {
    triggerFileInput() {
        this.$refs.fileInput.click();
    },
    handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
        this.previewUrl = URL.createObjectURL(file);
        }
    },
    },
    };
</script>

