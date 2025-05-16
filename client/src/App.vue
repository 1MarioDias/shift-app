<template>
  <div id="app" class="app-wrapper">
    <VideoBackground />
    <div class="pt-[150px]">
      <Navbar v-if="!isLoginRoute" :profileImage="profileImage" />
      <RouterView :profileImage="profileImage" @update-image="profileImage = $event" />
    </div>
  </div>
</template>

<script>
import VideoBackground from "./components/VideoBackground.vue";
import Navbar from "./components/Navbar.vue";
import { useRoute } from 'vue-router';

export default {
  name: "LandingPage",
  components: {
    VideoBackground,
    Navbar
  },
  data() {
    return {
      profileImage: "/defaultProfile.svg"
    };
  },
  computed: {
    isLoginRoute() {
      return this.$route.path === '/login';
    }
  },
  mounted() {
    const stored = localStorage.getItem("userProfileImage");
    this.profileImage = stored ? stored : "/defaultProfile.svg";
  }
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
