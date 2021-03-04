<template>
  <v-container>
    <v-layout>
      <v-flex xs12>
        <h1 class="display-1 mt-10">About Page</h1>
        <br />
        <p>Website version: {{ version }}</p>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  computed: {
    version() {
      return process.env.VUE_APP_VERSION;
    },
  },
};
</script>
