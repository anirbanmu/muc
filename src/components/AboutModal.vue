<template>
  <div id="about-modal" class="card rounded has-text-centered has-text-light">
    <div class="card-content">
      <div class="level">
        <div class="level-item">
          <div>
            <p class="is-size-1 has-text-weight-light">MUC</p>
            <p class="heading">Music URL converter</p>
          </div>
        </div>
      </div>
      <div class="level">
        <a
          class="level-item"
          href="https://github.com/anirbanmu/muc"
          target="_blank"
        >
          <i class="fab fa-github fa-5x" />
        </a>
      </div>
      <div class="level">
        <div class="level-item">
          <div>
            <p class="heading">Built by</p>
            <p>
              <a href="http://anirbanmu.com/" target="_blank">Anirban</a> &
              <a href="https://www.instagram.com/thedickbaker" target="_blank"
                >Dickbaker</a
              >
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'aboutModal'
};
</script>

<style lang="scss">
@import '../assets/scss/variables';

#about-modal {
  background-color: opacify($dark-grey-transclucent, 1) !important;
}
</style>
