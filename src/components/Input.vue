<script setup lang="ts">
const model = defineModel<string>({ default: "" });

withDefaults(
    defineProps<{
        placeholder?: string;
        type?: string;
    }>(),
    {
        placeholder: "",
        type: "text",
    },
);
</script>

<template>
    <div class="input-wrapper">
        <input
            :type="type"
            :value="model"
            :placeholder="placeholder"
            class="input"
            @input="model = ($event.target as HTMLInputElement).value"
        />
    </div>
</template>

<style scoped>
.input-wrapper {
    border: 1px solid var(--border-primary);
    padding: 1.5vh 2vh;
}

.input {
    width: 100%;
    border: none;
    outline: none;
    background: transparent;
    color: var(--text-primary);
    font-family: inherit;
    font-size: 15px;
    padding: 0;
    box-sizing: border-box;
    line-height: 1.4;
}

.input::placeholder {
    color: var(--text-tertiary);
}
</style>
