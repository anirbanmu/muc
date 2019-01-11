<template>
  <div class="card-header-title">
    <a :href="info.artistViewUrl" target="_blank">{{ info.artistName }}</a>
    <span class="preserve-whitespace"> - </span>
    <a :href="info.trackViewUrl" target="_blank" class="space-after">{{
      info.trackName
    }}</a>
    <SourceTag :link="info.trackViewUrl" text="iTunes" />
  </div>
</template>

<script>
import SourceTag from "./SourceTag.vue";

export default {
  name: "itunesQueryInfo",
  components: { SourceTag },
  props: ["info"]
};
</script>

<style scoped lang="scss"></style>
