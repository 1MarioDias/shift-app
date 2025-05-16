<template>
  <section class="relative h-[540px] max-md:h-[400px] max-sm:h-[300px] overflow-hidden">

    <!-- Container da imagem -->
    <div class="relative w-full max-w-[1400px] mx-auto h-full rounded-xl overflow-hidden">
      <img
        :src="image"
        alt="Hero background"
        class="w-full h-full object-cover"
      />
    </div>

    <!-- Conteúdo sobre a imagem -->
    <div class="absolute inset-0 flex justify-center items-center z-20 px-4">
      <div class="flex flex-col gap-6 items-center text-center max-w-[1000px] w-full">
       <h1
          class="text-[64px] font-bold text-white leading-tight max-md:text-5xl max-sm:text-4xl duration-300 hover:scale-105 hover:text-[#FFD300]"
        >
          SHIFT <span class="font-display">YOUR GEARS</span>!
        </h1>

        <h2
          class="text-2xl text-white max-md:text-xl max-sm:text-lg  duration-300 hover:scale-105 hover:text-[#FFD300]"
        >
          Live every experience.
        </h2>

        <SearchBar
          placeholder="Find your city"
          containerClass="h-12 w-full max-w-[700px] bg-white bg-opacity-90 rounded-full shadow-md px-4 transition-colors duration-300 hover:bg-[#FFD300]"
          inputClass="text-base text-black ml-2 focus:outline-none"
        >
          <template #prepend>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="text-black"
            >
              <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2" />
              <line
                x1="20"
                y1="20"
                x2="16.65"
                y2="16.65"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </template>
        </SearchBar>
      </div>
    </div>
  </section>
</template>



<script>
import SearchBar from "./SearchBar.vue";

export default {
  name: "Hero",
  components: {
    SearchBar,
  },
  props: {
    image: {
      type: String,
      required: true,
    },
  },
};
</script>
