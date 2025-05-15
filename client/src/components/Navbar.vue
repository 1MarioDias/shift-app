<template>
  <nav
    class="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-16 py-6 max-md:px-8 max-sm:px-5"
  >
    <!-- Logo -->
    <div class="logo transition duration-300">
      <RouterLink to="/" class="group block w-[105px] h-[40px]">
        <div
          class="w-full h-full bg-no-repeat bg-contain transition-all duration-300"
          :class="[
            isHovered ? 'bg-[url(/LogoBlue.svg)]' : 'bg-[url(/LogoWhite.svg)]'
          ]"
          @mouseenter="isHovered = true"
          @mouseleave="isHovered = false"
        ></div>
      </RouterLink>
    </div>

    <!-- SearchBar -->
    <div class="flex flex-1 justify-center max-md:hidden">
      <SearchBar class="rounded-full px-4 py-2 w-full max-w-xl">
        <template #prepend>
          <div v-html="searchIcon" class="mr-2 [&_svg]:stroke-[#FAF9F6] [&_svg]:fill-none"></div>
        </template>
        <template #append>
          <div class="mx-5 w-0.5 bg-stone-50 h-[27px]"></div>
          <div class="flex gap-2.5 items-center">
            <div v-html="locationIcon"></div>
            <span class="text-xs text-stone-50">Porto</span>
          </div>
        </template>
      </SearchBar>
    </div>

    <!-- Botões -->
    <div class="flex gap-5 items-center">
      <!-- Ícone do utilizador -->
      <RouterLink to="/user">
        <button class="w-12 h-12 flex items-center justify-center rounded-full">
          <div class="w-10 h-10" v-html="userIcon"></div>
        </button>
      </RouterLink>

      <!-- Botão Create Event -->
      <RouterLink to="/create">
        <button
          class="flex items-center justify-center gap-2 px-5 py-2 rounded-2xl bg-[#FAF9F6] text-black transition duration-300 hover:bg-[#426CFF] hover:text-white"
        >
          <span class="text-xs font-medium">Create Event +</span>
        </button>
      </RouterLink>
    </div>
  </nav>

  <RouterView />
</template>


<script>
import { RouterLink, RouterView } from 'vue-router'
import SearchBar from "./SearchBar.vue";

export default {
  name: "Navbar",
  components: {
    SearchBar,
    RouterLink,
    RouterView,
  },
  data() {
    return {
      isHovered: false,
      searchIcon: `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="11" cy="11" r="8" stroke="#FAF9F6" stroke-width="2"/>
          <line x1="20" y1="20" x2="16.65" y2="16.65" stroke="#FAF9F6" stroke-width="2" stroke-linecap="round"/>
        </svg>
      `,
      locationIcon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.8571 8.42857C16.8571 12.7143 10.4286 17.7143 10.4286 17.7143C10.4286 17.7143 4 12.7143 4 8.42857C4 4.92714 6.92714 2 10.4286 2C13.93 2 16.8571 4.92714 16.8571 8.42857Z" stroke="#FAF9F6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M10.4286 10.5714C11.612 10.5714 12.5714 9.61204 12.5714 8.42857C12.5714 7.2451 11.612 6.28571 10.4286 6.28571C9.24509 6.28571 8.28571 7.2451 8.28571 8.42857C8.28571 9.61204 9.24509 10.5714 10.4286 10.5714Z" stroke="#FAF9F6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`,
     userIcon: `<svg height="38" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clip-path="url(#clip0_1_347)">
          <path d="M1.25 20C1.25 24.9728 3.22543 29.742 6.74175 33.2583C10.2581 36.7745 15.0272 38.75 20 38.75C24.9728 38.75 29.742 36.7745 33.2583 33.2583C36.7745 29.742 38.75 24.9728 38.75 20C38.75 15.0272 36.7745 10.2581 33.2583 6.74175C29.742 3.22543 24.9728 1.25 20 1.25C15.0272 1.25 10.2581 3.22543 6.74175 6.74175C3.22543 10.2581 1.25 15.0272 1.25 20Z" stroke="#FAF9F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M16.25 10C16.25 10.9946 16.6451 11.9484 17.3483 12.6516C18.0517 13.3549 19.0055 13.75 20 13.75C20.9945 13.75 21.9483 13.3549 22.6517 12.6516C23.3548 11.9484 23.75 10.9946 23.75 10C23.75 9.00543 23.3548 8.05162 22.6517 7.34835C21.9483 6.64508 20.9945 6.25 20 6.25C19.0055 6.25 18.0517 6.64508 17.3483 7.34835C16.6451 8.05162 16.25 9.00543 16.25 10Z" stroke="#FAF9F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M22.5 33.75L23.75 26.25H26.25V22.5C26.25 20.8423 25.5915 19.2527 24.4195 18.0805C23.2473 16.9085 21.6577 16.25 20 16.25C18.3423 16.25 16.7527 16.9085 15.5806 18.0805C14.4085 19.2527 13.75 20.8423 13.75 22.5V26.25H16.25L17.5 33.75H22.5Z" stroke="#FAF9F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
      </svg>`
    };
  },
};
</script>
