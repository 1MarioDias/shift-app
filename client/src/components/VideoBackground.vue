<template>
    <div class="videoContainer">
      <video autoplay muted loop playsinline class="bgVideo">
        <source src="/videos/backgroundVideo.mp4" type="video/mp4" />
      </video>
      <div class="overlay-content">
        <slot />
      </div>
    </div>
  </template>
  
  <style scoped>
  .video-container {
    position: relative;
    width: 100%;
    height: 100vh;
    overflow: hidden;
  }
  
  .bg-video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: -1;
  }
  
  .overlay-content {
    position: relative;
    z-index: 1;
    color: white;
    text-align: center;
    padding: 2rem;
  }
  </style>
  