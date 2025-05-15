<template>
  <div class="flex flex-col gap-5">
    <UserInfo :username="username" />
  </div>
</template>

<script>
import UserInfo from "../components/UserInfo.vue";
import FeaturedEvents from "../components/FeaturedEvents.vue";

export default {
  name: "UserView",
  components: {
    UserInfo,
  },
  data() {
    return {
      // name for testing
      username: "User1", 
    };
  },
};


</script>
