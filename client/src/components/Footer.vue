<template>
  <footer class="bg-stone-50 text-black mt-90">
    <div class="px-30 py-40 max-md:px-10 max-sm:px-5">
      <div class="flex flex-wrap justify-between items-start gap-10">
        <!-- Navigation Links -->
        <nav class="flex gap-6 text-lg font-medium">
          <a @click.prevent="goToHome" class="hover:text-[#426CFF] transition cursor-pointer">Homepage</a>
          <a @click.prevent="scrollToAbout" class="hover:text-[#426CFF] transition cursor-pointer">About</a>
        </nav>

        <!-- Right side (Logo) -->
        <div class="flex flex-col items-end gap-5">
          <img src="/public/Logo.svg" alt="Logo" class="w-[105px]" />
        </div>
      </div>

      <hr class="my-8 border-black" />

      <div class="flex flex-wrap justify-between items-start text-sm">
        <span>&copy; 2025 Shift, all rights reserved</span>
        <div class="flex gap-5 text-xl mt-4 md:mt-0">
          <a href="#"><img src="/images/tiktok.svg" class="w-6 h-6" /></a>
          <a href="#"><img src="/images/instagram.svg" class="w-6 h-6" /></a>
          <a href="#"><img src="/images/twitter.svg" class="w-6 h-6" /></a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: "Footer",
  methods: {
    goToHome() {
      if (this.$route.path === "/") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        this.$router.push("/").then(() => {
          setTimeout(() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }, 300);
        });
      }
    },
    scrollToAbout() {
      if (this.$route.path === "/") {
        this.$nextTick(() => {
          const section = document.getElementById("about-section");
          if (section) section.scrollIntoView({ behavior: "smooth" });
        });
      } else {
        this.$router.push("/").then(() => {
          setTimeout(() => {
            const section = document.getElementById("about-section");
            if (section) section.scrollIntoView({ behavior: "smooth" });
          }, 300);
        });
      }
    },
  },
};
</script>
