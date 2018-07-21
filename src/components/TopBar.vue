<template>
  <nav id="top" class="navbar is-dark">
    <div class="navbar-brand">
      <p class="navbar-item has-text-weight-light is-size-3">MUC</p>
      <p class="navbar-item is-size-7">Music</p>
      <p class="navbar-item is-size-7">Blog</p>
      <p class="navbar-item is-size-7">
        <a @click="$emit('about')">About</a>
      </p>
    </div>

    <div class="navbar-item is-expanded">
      <b-field class="search-expanded">
        <b-input placeholder="URL to convert..." type="search" icon="magnify" expanded v-model.trim="query" @keyup.enter.native="$emit('search', query)"></b-input>
        <p class="control">
          <a class="button is-primary" @click="$emit('search', query)">Convert</a>
        </p>
      </b-field>
    </div>
  </nav>
</template>

<script>
export default {
  name: "topbar",
  props: ["initialQueryValue"],
  data() {
    return {
      query: ""
    };
  },
  created() {
    this.query = this.initialQueryValue;
  }
};
</script>

<style scoped lang="scss">
#top {
  border-bottom: solid;
}
.navbar {
  background-color: hsla(0, 0%, 21%, 0.9) !important;
  position: sticky;
  top: 0;
}
.search-expanded {
  width: 100%;
}
.navbar-brand {
  justify-content: space-between;
}
</style>
