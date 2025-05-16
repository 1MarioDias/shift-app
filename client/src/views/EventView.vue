<template>
<div class="px-10 py-10 text-white font-sans max-w-6xl mx-auto">
        <!-- event -->
        <!-- event image -->
        <div class="relative w-full mx-auto rounded-xl overflow-hidden mb-5">
            <img
                :src="imagem"
                alt="Event Image"
                class="w-full h-[300px] w-[1400px] object-cover"  
            />
        </div>
        <!-- event info -->
        <div class="flex items-start justify-between mb-[15px]">
            <p class="text-base leading-relaxed text-stone-50 max-md:text-sm max-w-[700px]">
                {{ data }}, {{ localizacao }}
            </p>
            <p class="text-base leading-relaxed text-stone-50 max-md:text-sm max-w-[700px] text-right">
                {{ tipoEvento }}, {{ hora }}
            </p>
        </div>
        <!-- event title -->
        <h2 class="text-3xl font-bold mb-[2px]">{{ titulo }}</h2>
        <!-- change this to username -->
        <p class="text-base leading-relaxed text-stone-50 max-md:text-sm max-w-[700px] mb-[10px]">{{ nomeAutor }}</p>
        <!-- event desc -->
        <div class="text-base leading-relaxed text-stone-50 max-md:text-sm max-w-[700px]">
            <p>
            {{ descricao }}
            </p>
            <h2 class="text-2xl font-bold mb-[10px] mt-[10px]">Important Links</h2>
            <a :href="linksRelevantes" target="_blank" v-if="linksRelevantes" class="font-bold text-[#FFD300] leading-tight max-md:text-5xl max-sm:text-4xl duration-300 hover:scale-105 hover:text-[#FFFFFF]"><p>Youtube</p></a>
        </div>
    
        <CommentSection />
    </div>
</template>



<script>
import CommentSection from '../components/CommentSection.vue'

export default {
    name: 'Event',
    components: {
        CommentSection
    },
    props: {
        nomeAutor: {
            type: String,
            default: "Author Name"
        },
        titulo: {
            type: String,
            default: "Event Title"
        },
        idEvent: {
            type: Number,
            default: 1
        },
        idAutor: {
            type: Number,
            default: 1
        },
        dataCriacao: {
            type: String,
            default: "1/1/2000"
        },
        imagem: {
            type: String,
            default: "../../public/images/evento1.png"
        },
        descricao: {
            type: String,
            default: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nunc odio, dictum sit amet dignissim vitae, pretium vitae lorem. Nullam magna nulla, eleifend cursus enim at, egestas posuere eros. Integer dignissim et lacus id aliquam. Curabitur semper sed libero in vestibulum. Interdum et malesuada fames ac ante ipsum primis in faucibus. Donec rhoncus neque nec dui auctor, a eleifend nunc faucibus. Curabitur sit amet erat dolor. Nulla et nisl felis. Duis ultricies erat ac metus posuere, sit amet auctor ante facilisis. Etiam quis euismod quam, id tristique est. Curabitur in felis ex. Morbi diam massa, fermentum vel aliquet ac, placerat at leo. Vivamus semper ut arcu eget imperdiet. Etiam id risus semper, commodo sem ut, porta purus. Nulla in commodo mauris. Curabitur pharetra elementum lobortis. Suspendisse sit amet tellus dolor. Aliquam commodo aliquet ultrices. Suspendisse ullamcorper in dolor id lobortis. Pellentesque mollis in lorem non suscipit. Fusce mattis aliquam justo vel aliquam. Cras vel nisl leo. Nulla facilisi. Praesent maximus, justo eget laoreet tincidunt, risus elit rutrum lorem, quis auctor nibh magna sit amet eros. Cras sed urna eget dui congue egestas nec et justo. Maecenas commodo sed lacus non semper. Ut porttitor ultricies turpis, sit amet convallis felis feugiat et. Phasellus malesuada condimentum felis, at blandit quam imperdiet ac. Phasellus congue tortor sit amet pulvinar finibus. Cras placerat eu est vitae auctor. Nunc nunc lacus, congue vitae molestie non, tincidunt id magna.",
        },
        data: {
            type: String,
            default: "1/1/2025"
        },
        hora: {
            type: String,
            default: "12:00"
        },
        localizacao: {
            type: String,
            default: "Porto"
        },
        tipoEvento: {
            type: String,
            default: "Party"
        },
        maxParticipantes: {
            type: Number,
            default: 200
        },
        estado: {
            type: String,
            default: ""
        },
        visualizacoes: {
            type: Number,
            default: 2
        },
        linksRelevantes: {
            type: String,
            default: "https://www.youtube.com/"
        },
        isPublic: {
            type: Boolean,
            default: true
        }
    }
}
</script>