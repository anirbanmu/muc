<template>
  <div>
    <span>{{ info.artists[0].name }}</span>
    <span> - </span>
    <span>{{ info.name }}</span>
  </div>
</template>

<script>
export default {
  name: "spotifyUriInfo",
  props: ["info"]
};
</script>

<style lang="scss">
</style>
