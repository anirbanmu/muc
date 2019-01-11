<template>
  <span class="tag is-dark">
    <a :href="link" target="_blank">{{ text }}</a>
  </span>
</template>

<script>
export default {
  name: "sourceTag",
  props: ["link", "text"]
};
</script>

<style scoped lang="scss"></style>
