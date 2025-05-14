<template>
    <!-- idk how the class thing works so i will place this as a placeholder until i figure it out -->
    <div class="usertab">
        <div class="userinfo">
            <p class="username">{{ username }}</p>
        </div>
        <!-- import router to get this to desired page -->
        <button class="settings">Change Password</button>
    </div>

</template>

<script>
export default{
    name: 'UserPage',
    props: {
        username: {
            type: String,
            required: true
        }
    },
    data(){
        return {
            userIcon: `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0_1_347)">
            <path d="M1.25 20C1.25 24.9728 3.22543 29.742 6.74175 33.2583C10.2581 36.7745 15.0272 38.75 20 38.75C24.9728 38.75 29.742 36.7745 33.2583 33.2583C36.7745 29.742 38.75 24.9728 38.75 20C38.75 15.0272 36.7745 10.2581 33.2583 6.74175C29.742 3.22543 24.9728 1.25 20 1.25C15.0272 1.25 10.2581 3.22543 6.74175 6.74175C3.22543 10.2581 1.25 15.0272 1.25 20Z" stroke="#FAF9F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16.25 10C16.25 10.9946 16.6451 11.9484 17.3483 12.6516C18.0517 13.3549 19.0055 13.75 20 13.75C20.9945 13.75 21.9483 13.3549 22.6517 12.6516C23.3548 11.9484 23.75 10.9946 23.75 10C23.75 9.00543 23.3548 8.05162 22.6517 7.34835C21.9483 6.64508 20.9945 6.25 20 6.25C19.0055 6.25 18.0517 6.64508 17.3483 7.34835C16.6451 8.05162 16.25 9.00543 16.25 10Z" stroke="#FAF9F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M22.5 33.75L23.75 26.25H26.25V22.5C26.25 20.8423 25.5915 19.2527 24.4195 18.0805C23.2473 16.9085 21.6577 16.25 20 16.25C18.3423 16.25 16.7527 16.9085 15.5806 18.0805C14.4085 19.2527 13.75 20.8423 13.75 22.5V26.25H16.25L17.5 33.75H22.5Z" stroke="#FAF9F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </g>
        </svg>`
        }
    }
}

</script>