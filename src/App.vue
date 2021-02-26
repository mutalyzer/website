<template>
  <v-app>
    <nav>
      <v-app-bar color="primary" dark>
        <v-app-bar-nav-icon @click="drawer = true"></v-app-bar-nav-icon>

        <v-toolbar-title>LUMC Mutalyzer 3 <code> Alpha</code></v-toolbar-title>
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

            <v-list-item to="/api">
              <v-list-item-icon>
                <v-icon>mdi-description</v-icon>
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
export default {
  name: "App",

  data: () => ({
    drawer: false,
  }),
};
</script>

<style>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
/* a {
  color: #42b983;
} */

.btn {
  margin-top: 5px;
}

.examples-list {
  margin-top: 5px;
  background-color: #ffffff;
}

.example-item {
  display: inline-block;
  color: #1e90ff;
  background-color: #ffffff;
  padding: 5px 10px;
  margin-left: 2px;
  font-family: monospace;
  font-size: medium;
}

.example-item:hover {
  color: #f2f9f3;
  background-color: #1e90ff;
  cursor: pointer;
}

.description {
  padding: 0 1px;
  padding: 5px 10px;
  font-family: monospace;
}

.error-description {
  color: #d60000;
  padding: 5px 10px;
  font-family: monospace;
}

.corrected-description {
  color: #00b6ad;
  padding: 5px 10px;
  font-family: monospace;
}

.normalized-description {
  color: #000399;
  padding: 5px 10px;
  font-family: monospace;
}

.ok-description {
  color: #0b9b33;
  padding: 5px 10px;
  font-family: monospace;
}

.ok-description-link {
  text-decoration: none;
  margin: 0;
  padding: 5px 10px;
  font-family: monospace;
  display: inline-block;
  color: #00c853;
  background-color: #ffffff;
}

.ok-description-link:hover {
  color: #f2f9f3;
  background-color: #00c853;
  cursor: pointer;
}

.code {
  background-color: #ffffff;
  color: #b71c1c;
}

.v-text-field {
  font-family: monospace;
}

.normalized-description {
  color: #0b9b33;
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 5px;
  padding-bottom: 5px;
}

.links {
  text-decoration: none;
  margin: 0;
  padding: 0 1px;
  font-family: monospace;
  display: inline-block;
  color: #00c853;
  background-color: #ffffff;
  padding: 5px 10px;
}

.links:hover {
  color: #f2f9f3;
  background-color: #00c853;
  cursor: pointer;
}

.protein-description {
  text-decoration: none;
  margin: 0;
  padding: 0 1px;
  font-family: monospace;
  display: inline-block;

  color: #004d40;
  background-color: #ffffff;
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 5px;
  padding-bottom: 5px;
}

.info-message {
  margin: 10px 0;
  padding: 5px;
  font-family: monospace;
  background-color: #e1f5fe;
}

.info-message-hover {
  margin: 10px 0;
  padding: 5px;
  font-family: monospace;
  background-color: #81d4fa;
}

.error-message {
  margin: 10px 0;
  padding: 5px;
  font-family: monospace;
  background-color: #ffebee;
}

.error-message-hover {
  margin: 10px 0;
  padding: 5px;
  font-family: monospace;
  background-color: #ffcdd2;
}

.description-info {
  margin: 0;
  padding: 0 1px;
  color: #01579b;
  font-family: monospace;
  display: inline-block;
}

.description-info-hover {
  margin: 0;
  padding: 0 1px;
  color: #01579b;
  font-family: monospace;
  background-color: #81d4fa;
  display: inline-block;
}

.description-error {
  margin: 0;
  padding: 0 1px;
  color: #b71c1c;
  font-family: monospace;
  display: inline-block;
}

.description-error-hover {
  margin: 0;
  padding: 0 1px;
  color: #b71c1c;
  font-family: monospace;
  background-color: #ffcdd2;
  display: inline-block;
}
</style>
