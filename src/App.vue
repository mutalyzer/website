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
            <v-btn icon v-bind="attrs" v-on="on" @click="feedback = !feedback">
              <v-icon>mdi-message-alert</v-icon>
            </v-btn>
          </template>
          <span>Feedback</span>
        </v-tooltip>
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

            <v-list-item to="/batchchecker">
              <v-list-item-icon>
                <v-icon>mdi-description</v-icon>
              </v-list-item-icon>
              <v-list-item-title>Batch Checker</v-list-item-title>
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

    <v-overlay :value="feedback">
      <v-sheet color="blue darken-3" elevation="3">
        <v-container>
          <v-layout>
            <v-flex xs12>
              <v-row class="ma-5">
                <v-col align="center" justify="center"
                  ><h2>Feedback is appreciated!</h2></v-col
                >
              </v-row>
              <v-divider></v-divider>
              <v-row class="mt-5 ml-5 mr-5">
                <v-col align="center" justify="center">
                  Bugs and concrete feature requests may be filed directly in
                  the GitHub issue trackers:
                </v-col>
              </v-row>
              <v-row class="mb-5 ml-5 mr-5">
                <v-col align="center" justify="center">
                  <v-btn
                    plain
                    href="https://github.com/mutalyzer/website/issues"
                    target="_blank"
                    >frontend</v-btn
                  >
                </v-col>
                <v-col align="center" justify="center">
                  <v-btn
                    plain
                    href="https://github.com/mutalyzer/normalizer/issues"
                    target="_blank"
                    >backend</v-btn
                  >
                </v-col>
              </v-row>
              <v-divider></v-divider>
              <v-row class="mt-5 ml-5 mr-5">
                <v-col align="center" justify="center">
                  If you have a private question or a security related issue to
                  discuss, please use the following email address:
                </v-col>
              </v-row>
              <v-row class="mb-5 ml-5 mr-5">
                <v-col align="center" justify="center">
                  info@mutalyzer.nl
                </v-col>
              </v-row>
              <v-divider></v-divider>
              <v-row class="ma-5">
                <v-col align="center" justify="center">
                  <v-btn @click="feedback = false"> Close </v-btn>
                </v-col>
              </v-row>
            </v-flex>
          </v-layout>
        </v-container>
      </v-sheet>
    </v-overlay>
  </v-app>
</template>

<script>
const apiBaseUrl = process.env.VUE_APP_API_URL;

export default {
  name: "App",

  data: () => ({
    drawer: false,
    apiBaseUrl: apiBaseUrl,
    feedback: false,
  }),
};
</script>

<style scoped src="./assets/main.css"></style>
