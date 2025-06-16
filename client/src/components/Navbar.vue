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
      <SearchBar class="rounded-full px-4 py-2 w-full max-w-xl focus:">
        <template #prepend>
              <RouterLink to="/search">
                <div v-html="searchIcon" class="mr-2 cursor-pointer [&_svg]:stroke-[#FAF9F6] [&_svg]:fill-none"></div>
              </RouterLink>
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
      <!-- Authenticated User Buttons -->
      <template v-if="isUserLoggedIn">
        <!-- Ícone do utilizador -->
        <div class="relative">
          <button 
            @click="toggleProfileDropdown" 
            class="w-12 h-12 rounded-full overflow-hidden border-2 border-white cursor-pointer"
          >
            <img :src="profileImage" alt="User" class="w-full h-full object-cover" />
          </button>
          
          <!-- Dropdown Menu -->
          <div 
            v-show="showProfileDropdown" 
            class="absolute right-0 mt-2 py-2 w-48 bg-white bg-opacity-10 backdrop-blur-md rounded-xl shadow-lg z-50 border border-white border-opacity-20"
          >
            <RouterLink 
              to="/user" 
              class="block px-4 py-2 text-sm text-black hover:bg-white hover:bg-opacity-10 transition-colors"
              @click="showProfileDropdown = false"
            >
              My Profile
            </RouterLink>
            <button 
              @click="handleLogout" 
              class="block w-full text-left px-4 py-2 text-sm text-#ff0000 hover:bg-white hover:bg-opacity-10 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
        <!-- Botão Create Event -->
        <RouterLink to="/create">
          <button
            class="flex items-center justify-center gap-2 px-5 py-2 rounded-2xl bg-[#FAF9F6] text-black transition duration-300 hover:bg-[#426CFF] hover:text-white cursor-pointer"
          >
            <span class="text-xs font-medium">Create Event +</span>
          </button>
        </RouterLink>
      </template>
      <!-- Login Button for Unauthenticated Users -->
      <template v-else>
        <RouterLink to="/login">
          <button
            class="flex items-center justify-center gap-2 px-5 py-2 rounded-2xl bg-[#FAF9F6] text-black transition duration-300 hover:bg-[#426CFF] hover:text-white cursor-pointer"
          >
            <span class="text-xs font-medium">Login</span>
          </button>
        </RouterLink>
      </template>
    </div>
  </nav>

</template>


<script>
import { RouterLink, RouterView } from 'vue-router';
import SearchBar from "./SearchBar.vue";
import { userStore } from '../stores/userStore';
import { authStore } from '../stores/authStore';
import { authService } from '../api/auth';


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
      showProfileDropdown: false,
      searchIcon: `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="11" cy="11" r="8" stroke="#FAF9F6" stroke-width="2"/>
          <line x1="20" y1="20" x2="16.65" y2="16.65" stroke="#FAF9F6" stroke-width="2" stroke-linecap="round"/>
        </svg>
      `,
      locationIcon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.8571 8.42857C16.8571 12.7143 10.4286 17.7143 10.4286 17.7143C10.4286 17.7143 4 12.7143 4 8.42857C4 4.92714 6.92714 2 10.4286 2C13.93 2 16.8571 4.92714 16.8571 8.42857Z" stroke="#FAF9F6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M10.4286 10.5714C11.612 10.5714 12.5714 9.61204 12.5714 8.42857C12.5714 7.2451 11.612 6.28571 10.4286 6.28571C9.24509 6.28571 8.28571 7.2451 8.28571 8.42857C8.28571 9.61204 9.24509 10.5714 10.4286 10.5714Z" stroke="#FAF9F6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`
    };
  },
  //profile picture
  computed: {
    profileImage() {
      return userStore.profileImage && userStore.profileImage.trim() !== ''
        ? userStore.profileImage
        : '/defaultProfile.svg';
    },
    username() {
      return userStore.username || 'User1';
    },
    isUserLoggedIn() {
      return authStore.isLoggedIn();
    }
  },
  methods: {
    toggleProfileDropdown() {
      this.showProfileDropdown = !this.showProfileDropdown;
    },
    handleLogout() {
      // Close the dropdown
      this.showProfileDropdown = false;
      
      // Call the authService logout method
      authService.logout();
    },
    // Close dropdown when clicking outside
    closeDropdownOnOutsideClick(event) {
      if (this.showProfileDropdown && !event.target.closest('.relative')) {
        this.showProfileDropdown = false;
      }
    }
  },
  mounted() {
    // Add event listener to close dropdown when clicking outside
    document.addEventListener('click', this.closeDropdownOnOutsideClick);
  },
  beforeUnmount() {
    // Clean up event listener
    document.removeEventListener('click', this.closeDropdownOnOutsideClick);
  }
};
</script>

