<template>
  <v-container>
    <v-row class="pl-10 pr-10 pt-10 pb-4">
      <v-col cols="12">
        <h1 class="text-headline-large mb-3">Welcome!</h1>
        <p class="welcome-text">
          The Mutalyzer tool suite is designed to be of help when working
          with <a href="https://www.hgvs.org/">HGVS</a> sequence variant
          <a href="https://varnomen.hgvs.org/">nomenclature</a>
          descriptions. Feedback is appreciated.
        </p>
      </v-col>
    </v-row>
    <v-row class="pl-10 pr-10 mb-6">
      <v-col cols="12">
        <v-hover v-slot="{ isHovering }">
          <v-card
            class="mx-auto transition-swing pb-4"
            color="grey-lighten-5"
            :elevation="isHovering ? 4 : 2"
          >
            <v-card-text
              class="pt-4 mb-0 pb-0 pointer"
              style="position: relative"
              @click="$router.push({ name: 'Normalizer' })"
            >
              <h3 class="text-headline-medium font-weight-light text-blue mb-1">
                Normalizer
              </h3>
              <div class="font-weight-light text-body-large mb-2">
                Takes a variant description as input and checks whether it
                is correct.
              </div>
            </v-card-text>
            <div>
              <v-row class="pr-5 pl-5">
                <v-col class="pb-2">
                  <div class="font-weight-light mb-2">
                    Examples:
                    <span
                      v-for="(example, index) in descriptionExamples"
                      :key="index"
                      class="example-item"
                      @click.prevent="selectDescriptionExample(index)"
                      >{{ example }}</span
                    >
                    <v-menu transition="slide-x-transition">
                      <template #activator="{ props }">
                        <span
                          class="example-link"
                          color="success"
                          v-bind="props"
                        >
                          ...
                        </span>
                      </template>
                      <v-list>
                        <v-list-item link>
                          <v-list-item-title
                            color="success"
                            class="example-item"
                            @click.prevent="
                              inputDescriptionTextBox =
                                'NG_012337.3(NM_003002.4):c.[53-10del;274G>T]';
                              $refs.refInputDescriptionTextBox.focus();
                            "
                            >NG_012337.3(NM_003002.4):c.[53-10del;274G>T]</v-list-item-title
                          >
                        </v-list-item>
                        <v-list-item link>
                          <v-list-item-title
                            color="success"
                            class="example-item"
                            @click.prevent="
                              inputDescriptionTextBox =
                                'NC_000011.10(NM_003002.4):c.274del';
                              $refs.refInputDescriptionTextBox.focus();
                            "
                            >NC_000011.10(NM_003002.4):c.274del</v-list-item-title
                          >
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </div>
                </v-col>
              </v-row>
              <v-row class="ml-5 mr-5 mt-0 pl-0">
                <v-text-field
                  ref="refInputDescriptionTextBox"
                  v-model="inputDescriptionTextBox"
                  class="mr-5"
                  bg-color="grey-lighten-5"
                  label="HGVS Description"
                  :clearable="true"
                  @keydown.enter="
                    $router.push({
                      name: 'Normalizer',
                      params: {
                        descriptionRouter: inputDescriptionTextBox,
                      },
                    })
                  "
                ></v-text-field>
                <v-btn
                  ref="normalize"
                  class="mt-4"
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
            </div>
          </v-card>
        </v-hover>
      </v-col>
    </v-row>

    <v-row class="pl-10 pr-10 pb-10">
      <v-col cols="12" sm="6" lg="6">
        <v-hover v-slot="{ isHovering }">
          <v-card
            class="mx-auto transition-swing"
            color="grey-lighten-4"
            :elevation="isHovering ? 4 : 2"
            :to="{ name: 'Mapper' }"
          >
            <v-card-text class="pa-4" style="position: relative">
              <h3 class="text-headline-medium font-weight-light text-blue mb-1">
                Mapper
              </h3>
              <div class="font-weight-light text-body-large">
                Maps an HGVS description to another reference sequence.
              </div>
            </v-card-text>
          </v-card>
        </v-hover>
      </v-col>

      <v-col cols="12" sm="6" lg="6">
        <v-hover v-slot="{ isHovering }">
          <v-card
            class="mx-auto transition-swing"
            color="grey-lighten-3"
            :elevation="isHovering ? 4 : 2"
            :to="{ name: 'DescriptionExtractor' }"
          >
            <v-card-text class="pa-4" style="position: relative">
              <h3 class="text-headline-medium font-weight-light text-blue mb-1">
                Description Extractor
              </h3>
              <div class="font-weight-light text-body-large">
                Generates the HGVS variant description from an observed and
                a reference sequence.
              </div>
            </v-card-text>
          </v-card>
        </v-hover>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "Home",
  data: () => ({
    inputDescriptionTextBox: null,
    descriptionExamples: [
      "NG_012337.3(NM_003002.4):c.274G>T",
      "NC_000011.10:g.112088970del",
      "GRCh38(chr11):g.112088970del",
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

.welcome-text a {
  color: rgb(var(--v-theme-primary));
}
</style>
