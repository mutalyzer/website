<template>
  <v-app>
    <nav>
      <v-app-bar color="primary" dark>
        <v-app-bar-nav-icon @click="drawer = true"></v-app-bar-nav-icon>

        <v-toolbar-title>
          <router-link to="/" class="title-link">LUMC Mutalyzer 3</router-link>
          <span class="alpha">Alpha</span></v-toolbar-title
        >
        <v-spacer></v-spacer>
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              icon
              v-bind="attrs"
              v-on="on"
              href="https://github.com/mutalyzer/normalizer/"
              target="_blank"
            >
              <v-icon>mdi-github</v-icon>
            </v-btn>
          </template>
          <span>Source Code</span>
        </v-tooltip>
      </v-app-bar>

      <v-navigation-drawer v-model="drawer" absolute temporary>
        <v-list nav dense>
          <v-list-item-group active-class="primary--text text--accent-4">
            <v-list-item to="/">
              <v-list-item-icon>
                <v-icon>mdi-home</v-icon>
              </v-list-item-icon>
              <v-list-item-title>Home</v-list-item-title>
            </v-list-item>

            <v-list-item to="/namechecker">
              <v-list-item-icon>
                <v-icon>mdi-description</v-icon>
              </v-list-item-icon>
              <v-list-item-title>Name Checker</v-list-item-title>
            </v-list-item>

            <v-list-item to="/positionconverter">
              <v-list-item-icon>
                <v-icon>mdi-description</v-icon>
              </v-list-item-icon>
              <v-list-item-title>Position Converter</v-list-item-title>
            </v-list-item>

            <v-list-item to="/descriptionextractor">
              <v-list-item-icon>
                <v-icon>mdi-description</v-icon>
              </v-list-item-icon>
              <v-list-item-title>Description Extractor</v-list-item-title>
            </v-list-item>

            <v-list-item :href="apiBaseUrl">
              <v-list-item-icon>
                <v-icon>mdi-cog</v-icon>
              </v-list-item-icon>
              <v-list-item-title>API</v-list-item-title>
            </v-list-item>

            <v-list-item to="/about">
              <v-list-item-icon>
                <v-icon>mdi-description</v-icon>
              </v-list-item-icon>
              <v-list-item-title>About</v-list-item-title>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-navigation-drawer>
    </nav>

    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>
const apiBaseUrl = process.env.VUE_APP_API_URL;

export default {
  name: "App",

  data: () => ({
    drawer: false,
    apiBaseUrl: apiBaseUrl,
  }),
};
</script>

<style scoped src="./assets/main.css"></style>
