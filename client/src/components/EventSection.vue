<template>
<div class="px-10 py-16 text-white font-sans max-w-6xl mx-auto">

    <div class="relative w-full max-w-[1400px] mx-auto h-full rounded-xl overflow-hidden">
      <img
        :src="image"
        alt="Hero background"
        class="w-full h-full object-cover"
      />
    </div>
    <div class="flex items-start justify-between mb-12">
      <!-- user info + change user/password -->
      <div>
        <h2 class="text-3xl font-bold">{{ titulo }}</h2>
    </div>

    </div>
</div>
</template>

<script>
    export default {
        name: Event,
        props: {
            idEvent: "1",
            idAutor: "1",
            dataCriacao: "",
            titulo: "Evento1",
            imagem: "img.png",
            descricao: "Primeiro Evento",
            data: "1/1/2025",
            hora: "12:00",
            localizacao: "Porto",
            coords: [40.4168, -3.7038],
            fullAdress: "Rua do Porto",
            tipoEvento: "party",
            maxParticipantes: "10",
            estado: "",
            visualizacoes: "1",
            linksRelevantes: "",
            isPublic: true,
        }
    }
</script>