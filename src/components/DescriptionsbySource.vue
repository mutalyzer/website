<template>
    <div>
      <v-expansion-panels class="mt-5">
        <v-expansion-panel v-for="source in descriptions" :key="source">
          <v-expansion-panel-header class="overline blue-grey--text text">{{source["source_name"]}}</v-expansion-panel-header>
          <v-expansion-panel-content v-for="gene in source['genes']" :key="gene">
            <v-expansion-panel-header class="overline blue-grey--text text--lighten-2">{{ gene["gene_name"] }}</v-expansion-panel-header>
            <v-expansion-panel-content v-for="([c_s,e_d_s],index) in Object.entries(gene['descriptions'])" :key="index">
              <v-expansion-panel-header class="overline blue-grey--text text--lighten-1">{{ c_s }}</v-expansion-panel-header>
              <v-sheet v-for="e_d in e_d_s" :key="e_d">
                <v-hover v-slot="{ hover }">
                  <v-sheet
                    :color="hover ? 'grey lighten-3' : ''"
                    class="pa-2 ma-1"
                  >
                    <template v-if="c_s === 'c'">
                      <Description
                        :description="e_d.description"
                        :css_class="'ok-description-link'"
                        :to_name="'Normalizer'"
                        :to_params="{
                          descriptionRouter: e_d.description,
                        }"
                        :tag="e_d.tag"
                        :selector="e_d.selector"
                      />
                    </template>
                    <template v-else>
                      <Description
                        :description="e_d.description"
                        :css_class="'ok-description-link'"
                        :to_name="'Normalizer'"
                        :to_params="{ descriptionRouter: e_d.description }"
                      />
                    </template>
                  </v-sheet>
                </v-hover>   
                <v-divider
                v-if="
                  index != e_d_s.length - 1
                "
              ></v-divider>
            </v-sheet>           
            </v-expansion-panel-content>
          </v-expansion-panel-content>
             <!-- <v-expansion-panel-header class="overline blue-grey--text text--lighten-2">{{ gene["gene_name"] }}</v-expansion-panel-header>               -->
              <!-- <v-expansion-panel
                v-for="([c_s, e_d_s], index) in Object.entries(gene['descriptions'])" :key="index"
              >
                <v-expansion-panel-header class="overline" > {{ [gene["gene_name"], c_s].join(' - ') }}</v-expansion-panel-header>
                <v-sheet v-for="e_d in e_d_s" :key="e_d">
                <v-hover v-slot="{ hover }">
                  <v-sheet
                    :color="hover ? 'grey lighten-3' : ''"
                    class="pa-2 ma-1"
                  >
                    <template v-if="c_s === 'c'">
                      <Description
                        :description="e_d.description"
                        :css_class="'ok-description-link'"
                        :to_name="'Normalizer'"
                        :to_params="{
                          descriptionRouter: e_d.description,
                        }"
                        :tag="e_d.tag"
                        :selector="e_d.selector"
                      />
                    </template>
                    <template v-else>
                      <Description
                        :description="e_d.description"
                        :css_class="'ok-description-link'"
                        :to_name="'Normalizer'"
                        :to_params="{ descriptionRouter: e_d.description }"
                      />
                    </template>
                  </v-sheet>
                </v-hover>
                <v-divider
                v-if="
                  index != e_d_s.length - 1
                "
              ></v-divider>
            </v-sheet>
              </v-expansion-panel> -->
            <!-- </v-expansion-panel> -->
          <!-- </v-expansion-panel-content> -->
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
  </template>

<script>
// import MutalyzerService from "../services/MutalyzerService.js";
import Description from "../components/Description.vue";

export default {
  name: "DescriptionbySource",
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