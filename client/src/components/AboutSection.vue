<template>
  <section class="mt-30 px-20 py-12 max-md:px-10 max-sm:px-5 max-sm:py-10 mx-6">
    <div class="flex gap-12 max-md:flex-col max-md:gap-10 items-center">
      <div class="flex-1">
        <h2 class="mb-6 text-4xl font-bold text-stone-50 max-md:text-3xl max-sm:text-2xl">
          WHO ARE WE?
        </h2>
        <div class="text-base leading-relaxed text-stone-50 max-md:text-sm max-w-[700px]" >
          <p>
            SHIFT is a web platform centered around the idea of smart cities,
            aiming to optimize access to information, promote community
            involvement, boost social interaction and enhance the overall
            quality of life for urban residents.
          </p>
          <br />
          <p>With us you can:</p>
          <br />
          <ul class="list-disc list-inside space-y-1">
            <li>Create your own events</li>
            <li>Personalize and edit your events</li>
            <li>Analyze statistics related to your events</li>
            <li>Participate in different events in your area</li>
          </ul>
          <br />
          <p>Join the cultural shift!</p>
        </div>
      </div>
      <div class="flex-1 max-w-[450px]">
        <img
          :src="image"
          alt="About section illustration"
          class="w-full h-auto rounded-xl"
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