<template>
    <section class="px-20 py-24 max-md:px-10 max-sm:px-5 max-sm:py-16">
      <div class="flex gap-24 max-md:flex-col max-md:gap-16">
        <div class="flex-1">
          <h2
            class="mb-8 text-5xl font-bold text-stone-50 max-md:text-4xl max-sm:text-3xl"
          >
            WHO ARE WE?
          </h2>
          <div class="text-lg leading-relaxed text-stone-50 max-md:text-base">
            <p>
              SHIFT is a web platform centered around the idea of smart cities,
              aiming to optimize access to information, promote community
              involvement, boost social interaction and enhance the overall
              quality of life for urban residents.
            </p>
            <br />
            <p>With us you can:</p>
            <br />
            <ul>
              <li>• Create your own events</li>
              <li>• Personalize and edit your events</li>
              <li>• Analyze statistics related to your events</li>
              <li>• Participate in different events in your area</li>
            </ul>
            <br />
            <p>Join the cultural shift!</p>
          </div>
        </div>
        <div class="flex-1">
          <img
            :src="image"
            alt="About section illustration"
            class="w-full h-auto"
          />
        </div>
      </div>
    </section>
  </template>
  
<script>
  export default {
    name: "AboutSection",
    props: {
      image: {
        type: String,
        required: true,
      },
    },
  };
</script>  