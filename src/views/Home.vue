<template>
  <v-container>
    <v-layout>
      <v-flex>
        <v-row>
          <v-col cols="12">
            <h1 class="display-1 mt-10 ml-10 mb-5">Welcome!</h1>
            <p class="ml-10">
              The Mutalyzer tool suite is designed to be of help when working
              with <a href="https://www.hgvs.org/">HGVS</a> sequence variant
              <a href="https://varnomen.hgvs.org/">nomenclature</a>
              descriptions. Feedback is appreciated.
            </p>
          </v-col>
        </v-row>
        <v-row class="pl-10 pr-10 mb-5">
          <v-col cols="12">
            <v-hover v-slot:default="{ hover }">
              <v-card
                class="mx-auto transition-swing pb-7"
                color="grey lighten-5"
                :elevation="hover ? 4 : 2"
              >
                <v-card-text
                  class="pt-6 mb-0 pb-0 pointer"
                  style="position: relative"
                  @click="$router.push({ name: 'Normalizer' })"
                >
                  <h3 class="display-1 font-weight-light blue--text mb-2">
                    Normalizer
                  </h3>
                  <div class="font-weight-light title mb-2">
                    Takes a variant description as input and checks whether it
                    is correct.
                  </div>
                </v-card-text>
                <v-flex>
                  <v-row class="pr-5 pl-5">
                    <v-col class="pb-2">
                      <div class="font-weight-light mb-2">
                        Examples:
                        <span
                          class="example-item"
                          v-for="(example, index) in descriptionExamples"
                          :key="index"
                          @click.prevent="selectDescriptionExample(index)"
                          >{{ example }}</span
                        >
                      </div>
                    </v-col>
                  </v-row>
                  <v-row class="ml-5 mr-5 mt-0 pl-0">
                    <v-text-field
                      class="mr-5"
                      background-color="grey lighten-5"
                      ref="refInputDescriptionTextBox"
                      v-on:keydown.enter="
                        $router.push({
                          name: 'Normalizer',
                          params: {
                            descriptionRouter: inputDescriptionTextBox,
                          },
                        })
                      "
                      v-model="inputDescriptionTextBox"
                      label="HGVS Description"
                      :clearable="true"
                    ></v-text-field>
                    <v-btn
                      ref="normalize"
                      class="mt-4"
                      tile
                      color="primary"
                      :to="{
                        name: 'Normalizer',
                        params: {
                          descriptionRouter: inputDescriptionTextBox,
                        },
                      }"
                    >
                      Normalize
                    </v-btn>
                  </v-row>
                </v-flex>
              </v-card>
            </v-hover>
          </v-col>
        </v-row>

        <v-row class="pl-10 pr-10">
          <v-col cols="12" sm="6" lg="6">
            <v-hover v-slot:default="{ hover }">
              <v-card
                class="mx-auto transition-swing"
                color="grey lighten-4"
                :elevation="hover ? 4 : 2"
                :to="{ name: 'PositionConverter' }"
              >
                <v-card-text class="pt-6" style="position: relative">
                  <h3 class="display-1 font-weight-light blue--text mb-2">
                    Position Converter
                  </h3>
                  <div class="font-weight-light title mb-2">
                    Converts reference positions to selector orientated
                    positions and vice versa.
                  </div>
                </v-card-text>
              </v-card>
            </v-hover>
          </v-col>

          <v-col cols="12" sm="6" lg="6">
            <v-hover v-slot:default="{ hover }">
              <v-card
                class="mx-auto transition-swing"
                color="grey lighten-3"
                :elevation="hover ? 4 : 2"
                :to="{ name: 'DescriptionExtractor' }"
              >
                <v-card-text class="pt-6" style="position: relative">
                  <h3 class="display-1 font-weight-light blue--text mb-2">
                    Description Extractor
                  </h3>
                  <div class="font-weight-light title mb-2">
                    Generates the HGVS variant description from an observed and
                    a reference sequence.
                  </div>
                </v-card-text>
              </v-card>
            </v-hover>
          </v-col>
        </v-row>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: "Home",
  data: () => ({
    inputDescriptionTextBox: null,
    descriptionExamples: [
      "NG_012337.1(NM_003002.2):c.274G>T",
      "LRG_24:g.5525_5532del",
    ],
  }),
  methods: {
    selectDescriptionExample: function (i) {
      this.inputDescriptionTextBox = this.descriptionExamples[i];
      this.$refs.refInputDescriptionTextBox.focus();
    },
  },
};
</script>

<style scoped>
.v-application {
  background-color: #ffffff;
}
</style>
