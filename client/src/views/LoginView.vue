<template>
  <div class="-mt-30 min-h-screen flex items-center justify-center px-4">
    <!-- modal das notificações de login/register -->
    <div 
      v-if="notification.show" 
      :class="[
        'fixed top-4 right-4 p-4 rounded-xl shadow-lg max-w-sm w-full z-50 transition-all duration-300 transform',
        notification.type === 'success' 
          ? 'bg-[#1C1C1E] border border-[#FFD300]' 
          : 'bg-[#1C1C1E] border border-[#FF004D]'
      ]"
    >
      <div class="flex items-start">
        <div class="ml-3 w-full">
          <p 
            :class="[
              'text-sm font-medium',
              notification.type === 'success' ? 'text-[#FFD300]' : 'text-[#FF004D]'
            ]"
          >
            {{ notification.message }}
          </p>
        </div>
        <button 
          @click="closeNotification"
          class="ml-4 text-stone-400 hover:text-stone-50"
        >
          ×
        </button>
      </div>
    </div>
    <VideoBackground />
    <div class="max-w-md w-full space-y-8 relative">
      <div class="bg-white bg-opacity-10 p-8 rounded-2xl backdrop-blur-md shadow-xl">
        <div class="flex justify-center mb-8">
          <RouterLink to="/">
            <img src="/public/Logo.svg" alt="Logo" class="h-12" />
          </RouterLink>
        </div>

        <div class="flex mb-8">
          <button 
            @click="activeForm = 'login'"
            :class="[
              'flex-1 py-2 text-sm font-medium rounded-l-xl transition-colors',
              activeForm === 'login' 
                ? 'bg-[#1C1C1E] text-white' 
                : 'text-[#FF004D] hover:text-[#FFD300]'
            ]"
          >
            Login
          </button>
          <button 
            @click="activeForm = 'register'"
            :class="[
              'flex-1 py-2 text-sm font-medium rounded-r-xl transition-colors',
              activeForm === 'register' 
                ? 'bg-[#1C1C1E] text-white' 
                : 'text-[#FF004D] hover:text-[#FFD300]'
            ]"
          >
            Register
          </button>
        </div>

        <form v-show="activeForm === 'login'" @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label for="login-email" class="block text-sm font-medium text-[#FF004D] text-right mb-2">Email</label>
            <input 
              id="login-email"
              v-model="loginForm.email"
              type="email" 
              required
              placeholder="Enter your email"
              class="mt-1 block w-full px-3 py-2 bg-white bg-opacity-10 border border-[#1C1C1E] rounded-xl text-[#1C1C1E] placeholder-stone-400 focus:ring-2 focus:ring-[#FFD300] focus:border-[#FFD300] transition-all duration-200"
            />
          </div>

          <div>
            <label for="login-password" class="block text-sm font-medium text-[#FF004D] text-right mb-2">Password</label>
            <input 
              id="login-password"
              v-model="loginForm.password"
              type="password" 
              required
              placeholder="Enter your password"
              class="mt-1 block w-full px-3 py-2 bg-white bg-opacity-10 border border-[#1C1C1E] rounded-xl text-[#1C1C1E] placeholder-stone-400 focus:ring-2 focus:ring-[#FFD300] focus:border-[#FFD300] transition-all duration-200"
            />
          </div>

          <button 
            type="submit"
            :disabled="loading"
            class="w-full py-2 px-4 border border-[#FFD300] rounded-xl shadow-sm text-sm font-medium text-black bg-stone-50 hover:bg-[#FFD300] transition-colors disabled:opacity-50"
          >
            {{ loading ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>

        <form v-show="activeForm === 'register'" @submit.prevent="handleRegister" class="space-y-6">
          <div>
            <label for="register-username" class="block text-sm font-medium text-[#FF004D] text-right mb-2">Username</label>
            <input 
              id="register-username"
              v-model="registerForm.username"
              type="text" 
              required
              placeholder="Choose a username"
              class="mt-1 block w-full px-3 py-2 bg-white bg-opacity-10 border border-[#1C1C1E] rounded-xl text-[#1C1C1E] placeholder-stone-400 focus:ring-2 focus:ring-[#FFD300] focus:border-[#FFD300] transition-all duration-200"
            />
          </div>

          <div>
            <label for="register-email" class="block text-sm font-medium text-[#FF004D] text-right mb-2">Email</label>
            <input 
              id="register-email"
              v-model="registerForm.email"
              type="email" 
              required
              placeholder="Enter your email"
              class="mt-1 block w-full px-3 py-2 bg-white bg-opacity-10 border border-[#1C1C1E] rounded-xl text-[#1C1C1E] placeholder-stone-400 focus:ring-2 focus:ring-[#FFD300] focus:border-[#FFD300] transition-all duration-200"
            />
          </div>

          <div>
            <label for="register-password" class="block text-sm font-medium text-[#FF004D] text-right mb-2">Password</label>
            <input 
              id="register-password"
              v-model="registerForm.password"
              type="password" 
              required
              placeholder="Create a password"
              class="mt-1 block w-full px-3 py-2 bg-white bg-opacity-10 border border-[#1C1C1E] rounded-xl text-[#1C1C1E] placeholder-stone-400 focus:ring-2 focus:ring-[#FFD300] focus:border-[#FFD300] transition-all duration-200"
            />
          </div>

          <div>
            <label for="register-confirm" class="block text-sm font-medium text-[#FF004D] text-right mb-2">Confirm Password</label>
            <input 
              id="register-confirm"
              v-model="registerForm.confirmPassword"
              type="password" 
              required
              placeholder="Confirm your password"
              class="mt-1 block w-full px-3 py-2 bg-white bg-opacity-10 border border-[#1C1C1E] rounded-xl text-[#1C1C1E] placeholder-stone-400 focus:ring-2 focus:ring-[#FFD300] focus:border-[#FFD300] transition-all duration-200"
            />
          </div>

          <button 
            type="submit"
            :disabled="loading"
            class="w-full py-2 px-4 border border-[#FFD300] rounded-xl shadow-sm text-sm font-medium text-black bg-stone-50 hover:bg-[#FFD300] transition-colors disabled:opacity-50"
          >
            {{ loading ? 'Creating account...' : 'Create account' }}
          </button>
        </form>

        <div v-if="error" class="mt-4 text-red-400 text-sm text-center">
          {{ error }}
        </div>

        <div v-if="success" class="mt-4 text-green-400 text-sm text-center">
          {{ success }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { RouterLink } from 'vue-router';
import { authService } from '../api/auth';
import VideoBackground from '../components/VideoBackground.vue';

export default {
  name: 'LoginView',
  components: {
    VideoBackground,
    RouterLink
  },
  data() {
    return {
      activeForm: 'login',
      loading: false,
      error: null,
      success: null,
      loginForm: {
        email: '',
        password: ''
      },
      registerForm: {
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      },
      notification: {
        show: false,
        message: '',
        type: 'success',
        timeout: null
      }
    }
  },
  methods: {
    showNotification(message, type = 'success') {
      if (this.notification.timeout) {
        clearTimeout(this.notification.timeout);
      }

      this.notification = {
        show: true,
        message,
        type,
        timeout: setTimeout(() => {
          this.closeNotification();
        }, 10000)
      };
    },

    closeNotification() {
      this.notification.show = false;
      if (this.notification.timeout) {
        clearTimeout(this.notification.timeout);
      }
    },
    async handleLogin() {
      try {
        this.loading = true;
        this.error = null;

        await authService.login({
          email: this.loginForm.email,
          password: this.loginForm.password
        });

        this.showNotification('Login successful! Welcome back.', 'success');
                
        this.loginForm = {
            email: '',
            password: ''
        };

        // USAR DEPOIS: redirect depois da notificação desaparecer
        // setTimeout(() => {
        //     this.$router.push('/');
        // }, 2000);

      } catch (err) {
        this.showNotification(err.message, 'error');
      } finally {
        this.loading = false;
      }
    },
    async handleRegister() {
      try {
        this.loading = true;
        this.error = null;

        if (this.registerForm.password !== this.registerForm.confirmPassword) {
          throw new Error('Passwords do not match');
        }

        const result = await authService.register({
          username: this.registerForm.username,
          email: this.registerForm.email,
          password: this.registerForm.password
        });

        this.showNotification('Account created successfully! Please log in.', 'success');
        
        // Reset form e muda para a página de login
        this.activeForm = 'login';
        this.registerForm = {
          username: '',
          email: '',
          password: '',
          confirmPassword: ''
        };
      } catch (err) {
        this.showNotification(err.message, 'error');
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>