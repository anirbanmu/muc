<template>
  <div class="buttons has-addons is-centered">
    <a class="button is-text is-small" v-clipboard:copy="link">
      <span class="icon is-small">
        <i class="far fa-copy"></i>
      </span>
    </a>
  </div>
</template>

<script>
export default {
  name: "resultListItemButtonBar",
  props: ["link"]
};
</script>

<style scoped lang="scss">
</style>
