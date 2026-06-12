<template>
    <div class="nav-item" :class="{ active: isActive }" @click="handleClick">
        <span class="label"><slot name="label"></slot></span>
    </div>
</template>

<script setup lang="ts">
import { type Ref, inject, computed } from "vue";

const props = defineProps({ index: { type: Number, required: true } });

interface Navigation {
    activedIndex: Ref<number>;
    setActivedIndex: (index: number) => void;
}

const navigation = inject<Navigation>("navigation");
if (!navigation) {
    throw new Error(
        "BottomNavigationItem must be used within BottomNavigationBar",
    );
}

const { activedIndex, setActivedIndex } = navigation;

const isActive = computed(() => activedIndex.value === props.index);

const handleClick = () => {
    setActivedIndex(props.index);
};
</script>

<style scoped>
.nav-item {
    position: relative;
}
.nav-item::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 2px;
    background-color: black;
    transition: width 0.2s;
}
.nav-item.active::after {
    width: 80%;
}
</style>
