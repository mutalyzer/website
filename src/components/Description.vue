<template>
  <v-row align="center">
    <v-col v-if="tooltip && to_name" class="grow">
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <router-link
            v-if="to_name"
            :class="css_class"
            :to="{
              name: to_name,
              params: to_params,
              query: to_query,
            }"
          >
            <div :class="css_class" v-bind="attrs" v-on="on">
              {{ description }}
            </div>
          </router-link>
          <div v-else :class="css_class" v-bind="attrs" v-on="on">
            {{ description }}
          </div>
        </template>
        <span>{{ tooltip }}</span>
      </v-tooltip>
    </v-col>
    <v-col v-else class="grow">
      <router-link
        v-if="to_name"
        :class="css_class"
        :to="{
          name: to_name,
          params: to_params,
          query: to_query,
        }"
        >{{ description }}</router-link
      >
      <div v-else :class="css_class">
        {{ description }}
      </div>
    </v-col>
    <v-col class="shrink">
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn v-bind="attrs" v-on="on" icon v-clipboard="description">
            <v-icon>mdi-content-copy</v-icon>
          </v-btn>
        </template>
        <span>Copy</span>
      </v-tooltip>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: "Description",
  props: {
    description: null,
    css_class: null,
    tooltip: null,
    to_name: null,
    to_params: null,
    to_query: null,
  },
};
</script>

<style scoped src="../assets/main.css"></style>
