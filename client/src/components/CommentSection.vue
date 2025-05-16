<template>
    <div>
        <!-- comments -->
        <h2 class="text-2xl font-bold mb-[10px] mt-[30px]">Comments</h2>
        <!-- user comment -->
        <div class="relative">
            <div :class="[containerClass, 'w-full rounded-2xl']">
                <div class="flex items-center px-5 h-full">
                    <div class="flex flex-1 gap-5 items-center">
                        <slot name="prepend" />
                        <textarea
                            ref="commentArea"
                            :placeholder="placeholder"
                            :class="[inputClass, 'flex-1 bg-transparent resize-none min-h-[40px] max-h-[200px] py-4 focus:outline-none']"
                            @input="autoResize"
                        />
                    </div>
                    <slot name="append"></slot>
                </div>
            </div>
        </div>
        <!-- comment button -->
        <div class="flex justify-end mt-2">
            <button class="flex items-center gap-2 px-5 py-2 rounded-2xl bg-[#FAF9F6] text-black transition duration-300 hover:bg-[#426CFF] hover:text-white">
                <span class="text-xs font-medium">Post Comment</span>
            </button>
        </div>

        <!-- other comments -->
        <div class="mt-5">
            <div v-for="comment in comments" :key="comment.id" class="flex items-start gap-5 mb-3">
                <img :src="comment.image" alt="User Image" class="w-12 h-12 rounded-full" />
                <div>
                    <p class="text-base leading-relaxed text-stone-50 max-md:text-sm max-w-[700px] mb-[5px] font-bold">{{ comment.author }}</p>
                    <p class="text-base leading-relaxed text-stone-50 max-md:text-sm max-w-[700px]">
                        {{ comment.text }}
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'CommentSection',
    methods: {
        autoResize(event) {
            const textarea = event.target;
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
        }
    },
    props: {
        placeholder: {
            type: String,
            default: 'Your comment...'
        },
        containerClass: {
            type: String,
            default: 'border-[1.5px] border-stone-50'
        },
        inputClass: {
            type: String,
            default: 'text-xs text-stone-50'
        },
        comments: {
            type: Array,
            default: () => ([
                {
                    id: 1,
                    author: "UserName",
                    text: "This is a comment.",
                    image: "../../public/images/userImage.png",
                },
                {
                    id: 2,
                    author: "UserName2",
                    text: "This is a second comment.",
                    image: "../../public/images/userImage.png",
                }
            ])
        }
    }
}
</script>