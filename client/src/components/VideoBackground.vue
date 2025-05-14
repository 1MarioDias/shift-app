<template>
  <div class="video-container">
    <video autoplay muted loop playsinline class="bg-video">
      <source src="/videos/backgroundVideo.mp4" type="video/mp4" />
    </video>
    <div class="overlay"></div>
  </div>
</template>

<style scoped>
.video-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  z-index: -1;
}

.bg-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7); 
}
</style>
