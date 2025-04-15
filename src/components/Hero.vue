<template>
    <section class="relative h-[540px] max-md:h-[400px] max-sm:h-[300px]">
      <img
        :src="image"
        alt="Hero background"
        class="w-full h-full object-cover"
      />
      <div class="flex absolute inset-0 justify-center items-center">
        <div class="flex flex-col gap-8 items-center">
          <h1
            class="text-6xl font-bold text-stone-50 max-md:text-5xl max-sm:text-4xl"
          >
            SHIFT YOUR GEARS!
          </h1>
          <h2 class="text-3xl text-stone-50 max-md:text-2xl max-sm:text-lg">
            Live every experience!
          </h2>
          <SearchBar
            placeholder="Find your city"
            containerClass="h-10 w-[664px] max-md:w-[500px] max-sm:w-[90%] shadow-sm bg-stone-50 bg-opacity-80 rounded-[30px]"
            inputClass="text-base text-stone-500 ml-2.5"
          />
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