<template>

</template>

<script>
  import Hero from "../components/Hero.vue";
  import AboutSection from "../components/AboutSection.vue";
  import FeaturedEvents from "../components/FeaturedEvents.vue";
  import Footer from "../components/Footer.vue";

  export default {
    name: "User",
    components: {
      Hero,
      AboutSection,
      FeaturedEvents,
      Footer,
    },
    data() {
      return {
        heroImage: "public/images/heroImage.png",
        aboutImage: "public/images/aboutImage.png",
        featuredEvents: [
          {
            id: 1,
            image: "public/images/cardImage.png",
            type: "Event",
            date: "Wed, Apr 2 • 7:00 PM",
            price: "from 99.00€",
            author: "John Doe",
            subscribers: "5.5k",
            title: "Featured Event",
          },
        ],
      };
    },
  };
</script>
