<script setup lang="ts"></script>

<template>
    <div class="card">
        <h2><slot name="card-title"></slot></h2>
        <div class="card-content"><slot name="card-content"></slot></div>
    </div>
</template>

