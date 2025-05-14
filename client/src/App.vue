<template>
  <div id="app" class="app-wrapper">
    <!-- Fundo de vídeo -->
    <VideoBackground />

    <!-- Conteúdo principal -->
    <div class="content">
      <Navbar />
      <router-view />
    </div>
  </div>
</template>

<script>
import VideoBackground from "./components/VideoBackground.vue";
import Navbar from "./components/Navbar.vue";
import Hero from "./components/Hero.vue";
import AboutSection from "./components/AboutSection.vue";
import FeaturedEvents from "./components/FeaturedEvents.vue";
import Footer from "./components/Footer.vue";

export default {
  name: "LandingPage",
  components: {
    VideoBackground,
    Navbar,
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

<style>
.app-wrapper {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}

.content {
  position: relative;
  z-index: 1;
}

@import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@200;400;500;600;700&display=swap");
</style>
