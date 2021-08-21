<template>
  <div id="about-modal" class="card rounded has-text-centered has-text-light">
    <div class="card-content">
      <div class="level">
        <div class="level-item">
          <div>
            <p class="is-size-1 has-text-weight-light">MUC</p>
            <p class="heading">Music URI converter</p>
          </div>
        </div>
      </div>
      <div class="level">
        <div class="level-item">
          <p>
            Cross-convert Spotify, YouTube, Apple Music & Deezer URIs/links to
            easily share them in a platform agnostic way.
          </p>
        </div>
      </div>
      <div class="level">
        <a
          class="level-item"
          href="https://github.com/anirbanmu/muc"
          target="_blank"
        >
          <font-awesome-icon :icon="['fab', 'github']" size="5x" />
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
      <div class="level">
        <div class="level-item">
          <div>
            <p class="heading">APIs used</p>
            <ul>
              <li>
                <a
                  href="https://developer.spotify.com/documentation/web-api/"
                  target="_blank"
                  >Spotify API</a
                >
              </li>
              <li>
                <a
                  href="https://affiliate.itunes.apple.com/resources/documentation/itunes-store-web-service-search-api"
                  target="_blank"
                  >iTunes Search API
                </a>
              </li>
              <li>
                <a href="https://developers.deezer.com/api" target="_blank"
                  >Deezer API</a
                >
              </li>
              <li>
                <a
                  href="https://developers.google.com/youtube/v3/"
                  target="_blank"
                  >YouTube Data API</a
                >
                <span class="is-size-7">
                  (by using this app you also agree to be bound by
                  <a href="https://www.youtube.com/t/terms" target="_blank"
                    >YouTube's Terms of Service</a
                  >)</span
                >
              </li>
            </ul>
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
