<template>
  <div class="button-bar buttons has-addons is-centered">
    <a class="button is-small is-primary is-outlined" v-clipboard:copy="link">
      <span class="icon"> <i class="far fa-copy"></i> </span> <span>Copy</span>
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
.button-bar {
  font-size: 0.8rem;
  padding: 0.5rem;
  .button-item {
    padding: 0.2rem;
  }
}
</style>
