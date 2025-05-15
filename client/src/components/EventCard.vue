<template>
    <article class="relative">
        <img
            :src="`../../public/images/${image}`"
            :alt="title"
            class="w-full h-[360px] object-cover rounded-[20px]"
        />
        <div class="flex absolute inset-0 flex-col justify-between p-5">
            <div class="flex justify-between">
                <h3 class="text-xs font-bold text-stone-50">{{ type }}</h3>
                <div class="flex gap-3">
                    <button class="text-stone-50">
                        <div v-html="heartIcon"></div>
                    </button>
                    <button class="text-stone-50">
                        <div v-html="shareIcon"></div>
                    </button>
                </div>
            </div>
            <div class="flex flex-col gap-2">
                <h2 class="text-lg font-bold text-stone-50">{{ title }}</h2>
                <time class="text-xs font-semibold text-stone-50">{{ date }}</time>
                <p class="text-xs text-stone-50">{{ location }}</p>
                <div class="flex gap-2 items-center">
                    <div v-html="userIcon"></div>
                    <p class="text-xs font-semibold text-white">by {{ author }}</p>
                </div>
            </div>
        </div>
    </article>
</template>

<script>
  export default {
    name: 'EventCard',
    props: {
      image: {
        type: String,
        required: true
      },
      type: {
        type: String,
        default: 'Event'
      },
      date: {
        type: String,
        required: true
      },
      location: {
        type: String,
        required: true
      },
      author: {
        type: String,
        required: true
      },
      title: {
        type: String,
        required: true
      }
    },
    data() {
      return {
        heartIcon: `<svg width="21" height="22" viewBox="0 0 21 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19.2305 3.98154C17.1519 1.90811 13.7885 1.904 11.7048 3.97236L10.5032 5.08853L9.3007 3.96868C6.39628 1.0724 1.4457 2.40635 0.389653 6.36979C-0.100467 8.20923 0.427986 10.1704 1.77593 11.5146L9.98418 19.8432C10.2721 20.1355 10.7436 20.1355 11.0315 19.8432L19.2305 11.5146C21.3099 9.43403 21.3099 6.06209 19.2305 3.98154ZM18.1879 10.482L10.5032 18.2759L2.81402 10.4747C0.713669 8.37431 1.67465 4.7879 4.54377 4.01912C5.87534 3.66233 7.2961 4.04302 8.27088 5.0178L8.28925 5.03617L10.0026 6.63005C10.2847 6.89262 10.7218 6.89262 11.0039 6.63005L12.7172 5.03617L12.7356 5.0178C14.8373 2.91886 18.4231 3.88225 19.19 6.7519C19.5458 8.08371 19.1642 9.50422 18.1888 10.4783L18.1879 10.482Z" fill="currentColor"/>
        </svg>`,
        shareIcon: `<svg width="24" height="24" viewBox="0 0 38 41" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g filter="url(#filter0_d_1_282)">
            <path d="M11.6585 18.6403V26.0793C11.6585 26.5725 11.8545 27.0456 12.2032 27.3943C12.552 27.7431 13.0251 27.939 13.5183 27.939H24.6768C25.1701 27.939 25.6431 27.7431 25.9919 27.3943C26.3406 27.0456 26.5366 26.5725 26.5366 26.0793V18.6403" stroke="currentColor" stroke-width="1.4878" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M22.8171 13.0609L19.0976 9.34143L15.3781 13.0609" stroke="currentColor" stroke-width="1.4878" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M19.0976 9.34143V21.4298" stroke="currentColor" stroke-width="1.4878" stroke-linecap="round" stroke-linejoin="round"/>
          </g>
        </svg>`,
        userIcon: `<svg width="16" height="16" viewBox="0 0 36 37" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clip-path="url(#clip0_1_279)">
            <path d="M20.8571 13.3092C20.8571 12.934 20.7832 12.5625 20.6397 12.2158C20.4961 11.8692 20.2856 11.5542 20.0203 11.2889C19.755 11.0236 19.44 10.8132 19.0934 10.6696C18.7467 10.526 18.3752 10.4521 18 10.4521C17.6248 10.4521 17.2533 10.526 16.9066 10.6696C16.56 10.8132 16.245 11.0236 15.9797 11.2889C15.7144 11.5542 15.5039 11.8692 15.3603 12.2158C15.2168 12.5625 15.1429 12.934 15.1429 13.3092C15.1429 13.6844 15.2168 14.056 15.3603 14.4026C15.5039 14.7492 15.7144 15.0642 15.9797 15.3295C16.245 15.5948 16.56 15.8053 16.9066 15.9489C17.2533 16.0925 17.6248 16.1664 18 16.1664C18.3752 16.1664 18.7467 16.0925 19.0934 15.9489C19.44 15.8053 19.755 15.5948 20.0203 15.3295C20.2856 15.0642 20.4961 14.7492 20.6397 14.4026C20.7832 14.056 20.8571 13.6844 20.8571 13.3092ZM13.4286 13.3092C13.4286 12.7089 13.5468 12.1144 13.7766 11.5598C14.0063 11.0052 14.343 10.5012 14.7675 10.0767C15.192 9.65224 15.696 9.31551 16.2506 9.08577C16.8052 8.85604 17.3997 8.73779 18 8.73779C18.6003 8.73779 19.1948 8.85604 19.7494 9.08577C20.304 9.31551 20.808 9.65224 21.2325 10.0767C21.657 10.5012 21.9937 11.0052 22.2234 11.5598C22.4532 12.1144 22.5714 12.7089 22.5714 13.3092C22.5714 14.5216 22.0898 15.6844 21.2325 16.5417C20.3752 17.399 19.2124 17.8807 18 17.8807C16.7876 17.8807 15.6248 17.399 14.7675 16.5417C13.9102 15.6844 13.4286 14.5216 13.4286 13.3092ZM11.7607 25.3092H24.2393C23.9214 23.0485 21.9786 21.3092 19.6321 21.3092H16.3679C14.0214 21.3092 12.0786 23.0485 11.7607 25.3092ZM10 25.9628C10 22.4449 12.85 19.5949 16.3679 19.5949H19.6321C23.15 19.5949 26 22.4449 26 25.9628C26 26.5485 25.525 27.0235 24.9393 27.0235H11.0607C10.475 27.0235 10 26.5485 10 25.9628Z" fill="#FAF9F6"/>
          </g>
        </svg>`
      }
    }
  }
</script>
