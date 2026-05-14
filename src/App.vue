<template>
  <v-app>
    <v-app-bar color="primary" theme="dark" scroll-behavior="hide">
      <v-app-bar-nav-icon @click="drawer = true"></v-app-bar-nav-icon>
      <router-link to="/">
        <v-btn icon>
          <img src="@/assets/logo.svg" width="30" height="30" />
        </v-btn>
      </router-link>
      <v-toolbar-title class="ml-2">
        <router-link to="/" class="title-link">LUMC Mutalyzer 3</router-link>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-tooltip location="bottom">
        <template #activator="{ props }">
          <v-btn icon v-bind="props" @click="feedback = !feedback">
            <v-icon>mdi-message-alert</v-icon>
          </v-btn>
        </template>
        <span>Feedback</span>
      </v-tooltip>
      <v-tooltip location="bottom">
        <template #activator="{ props }">
          <v-btn
            icon
            v-bind="props"
            href="https://github.com/mutalyzer/mutalyzer/"
            target="_blank"
          >
            <v-icon>mdi-github</v-icon>
          </v-btn>
        </template>
        <span>Source Code</span>
      </v-tooltip>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" temporary>
      <v-list nav>
        <v-list-item prepend-icon="mdi-home" title="Home" to="/" />
        <v-list-item title="Normalizer" to="/normalizer" />
        <v-list-item title="Position Converter" to="/positionconverter" />
        <v-list-item title="Description Extractor" to="/descriptionextractor" />
        <v-list-item title="Mapper" to="/mapper" />
        <v-list-item title="Batch Processor" to="/batchprocessor" />
        <v-list-item title="Algebra" to="/algebra" />
        <v-list-item prepend-icon="mdi-cog" title="API" :href="apiBaseUrl" />
        <v-list-item title="About" to="/about" />
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <router-view></router-view>
    </v-main>

    <v-overlay v-model="feedback" class="align-center justify-center">
      <v-sheet color="blue-darken-3" elevation="3">
        <v-container>
          <v-row class="ma-5">
            <v-col class="text-center"><h2>Feedback is appreciated!</h2></v-col>
          </v-row>
          <v-divider></v-divider>
          <v-row class="mt-5 mx-5">
            <v-col class="text-center">
              Bugs and concrete feature requests may be filed directly in the GitHub issue trackers:
            </v-col>
          </v-row>
          <v-row class="mb-5 mx-5">
            <v-col class="text-center">
              <v-btn
                variant="plain"
                href="https://github.com/mutalyzer/website/issues"
                target="_blank"
                >frontend</v-btn
              >
            </v-col>
            <v-col class="text-center">
              <v-btn
                variant="plain"
                href="https://github.com/mutalyzer/mutalyzer/issues"
                target="_blank"
                >backend</v-btn
              >
            </v-col>
          </v-row>
          <v-divider></v-divider>
          <v-row class="mt-5 mx-5">
            <v-col class="text-center">
              If you have a private question or a security related issue to discuss, please use the
              following email address:
            </v-col>
          </v-row>
          <v-row class="mb-5 mx-5">
            <v-col class="text-center">info@mutalyzer.nl</v-col>
          </v-row>
          <v-divider></v-divider>
          <v-row class="ma-5">
            <v-col class="text-center">
              <v-btn @click="feedback = false">Close</v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-sheet>
    </v-overlay>
  </v-app>
</template>

<script>
export default {
  name: "App",
  data: () => ({
    drawer: false,
    apiBaseUrl: import.meta.env.VITE_API_URL,
    feedback: false,
  }),
};
</script>

<style scoped src="./assets/main.css"></style>

<style>
.v-navigation-drawer .v-list-item--prepend {
  padding-inline-start: calc(2rem + var(--v-list-prepend-gap, 2rem));
}
</style>
