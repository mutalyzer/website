<template>
    <div>
      <v-expansion-panels class="mt-5">
        <v-btn @click="all">
            all
        </v-btn>
        <div>{{ panel }}</div>
        <v-btn @click="none">
            none
        </v-btn>
        <v-expansion-panel v-for="source in descriptions" :key="source">
          <v-expansion-panel-header class="overline blue-grey--text text">{{source["source_name"]}}</v-expansion-panel-header>

        </v-expansion-panel>
      </v-expansion-panels>
    </div>
  </template>

<script>
// import MutalyzerService from "../services/MutalyzerService.js";
import Description from "../components/Description.vue";

export default {
  name: "DescriptionbySourceGene",
  components: {
    Description,
  },
  props: {
    model:[],
  },
  data() {
    return {
      descriptions:this.model
    };
  },
  // created: function () {
  //   this.getequivalents();
  // },
  // methods: {
  //   getequivalents(){
  //     var descriptions = [];
  //     if (this.model){
  //       descriptions = this.model;
  //       return descriptions}
  //   }
  // }
};

</script>