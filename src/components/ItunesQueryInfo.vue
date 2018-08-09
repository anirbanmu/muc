<template>
  <div>
    <header class="card-header">
      <div class="card-header-title">
        <a :href="info.artistViewUrl" target="_blank">{{ info.artistName }}</a>
        <span class="preserve-whitespace"> - </span>
        <a :href="info.trackViewUrl" target="_blank">{{ info.trackName }}</a>
      </div>
      <a class="card-header-icon" :href="info.trackViewUrl" target="_blank">
        <b-icon pack="fab" icon="apple"/>
      </a>
    </header>
  </div>
</template>

<script>
export default {
  name: "itunesQueryInfo",
  props: ["info"]
};
</script>

<style scoped lang="scss">
.preserve-whitespace {
  white-space: pre;
}
</style>
