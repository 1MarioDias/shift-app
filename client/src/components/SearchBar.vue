<template>
  <div class="relative">
    <div :class="[containerClass, 'w-full rounded-2xl']">
      <div class="flex items-center px-5 h-full">
        <div class="flex flex-1 gap-5 items-center">
          <slot name="prepend" />
          <input
            type="text"
            :placeholder="placeholder"
            :class="[inputClass, 'flex-1 bg-transparent']"
            :value="modelValue"
            @input="$emit('update:modelValue', $event.target.value)"
          />
        </div>
        <slot name="append"></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchBar',
  props: {
    modelValue: String,
    placeholder: {
      type: String,
      default: 'Search'
    },
    containerClass: {
      type: String,
      default: 'h-10 border-[1.5px] border-stone-50'
    },
    inputClass: {
      type: String,
      default: 'text-xs text-stone-50 focus:outline-none'
    }
  }
}
</script>
