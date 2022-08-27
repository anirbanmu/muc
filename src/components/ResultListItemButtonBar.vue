<template>
  <div class="button-bar buttons has-addons is-centered">
    <a class="button is-small is-primary is-outlined" v-clipboard:copy="link">
      <span class="space-after"
        ><font-awesome-icon :icon="['far', 'copy']"
      /></span>
      <span>Copy</span>
    </a>
  </div>
</template>

<script>
export default {
  name: 'resultListItemButtonBar',
  props: ['link']
};
</script>

<style scoped lang="scss">
.button-bar {
  font-size: 0.8rem;
  padding: 0.5rem;
}
</style>
