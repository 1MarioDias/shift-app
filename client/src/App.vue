<template>
  <div id="app" class="app-wrapper">
    <VideoBackground />
    <div class="pt-[150px]">
      <Navbar :profileImage="profileImage" />
      <RouterView :profileImage="profileImage" @update-image="profileImage = $event" />
    </div>
  </div>
</template>


<script>
import VideoBackground from "./components/VideoBackground.vue";
import Navbar from "./components/Navbar.vue";

export default {
  name: "LandingPage",
  components: {
    VideoBackground,
    Navbar
  },
  data() {
    return {
      heroImage: "/images/heroImage.png",
      aboutImage: "/images/aboutImage.png",
      profileImage: "/defaultProfile.svg", 
      featuredEvents: [
        {
          id: 1,
          image: "/images/cardImage.png",
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

  //profile picture
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
