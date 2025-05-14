<template>
    <section class="px-20 max-md:px-10 max-sm:px-5">
      <h2
        class="mb-16 text-5xl font-bold text-center text-stone-50 max-md:text-4xl max-sm:text-3xl"
      >
        FEATURED EVENTS
      </h2>
      <div class="grid grid-cols-4 gap-14 max-md:grid-cols-2 max-sm:grid-cols-1">
        <EventCard v-for="event in events" :key="event.id" v-bind="event" />
      </div>
    </section>
  </template>
  
<script>
  import EventCard from "./EventCard.vue";
  
  export default {
    name: "FeaturedEvents",
    components: {
      EventCard,
    },
    props: {
      events: {
        type: Array,
        required: true,
      },
    },
  };
</script>  