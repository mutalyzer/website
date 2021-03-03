<template>
  <v-container>
    <v-layout>
      <v-flex xs12>
        <h1 class="display-1 mt-10 ml-10 mb-5">Welcome!</h1>
        <p class="ml-10">
          The following tools are still to be tested/extended/etc. Use them with
          care. Feedback is greatly appreciated.
        </p>
        <v-row class="pl-10 pr-10">
          <v-col cols="12" sm="4" lg="4">
            <v-hover v-slot:default="{ hover }">
              <v-card
                class="mx-auto transition-swing"
                color="grey lighten-5"
                :elevation="hover ? 4 : 2"
                :to="{ name: 'NameChecker' }"
              >
                <v-card-text class="pt-6" style="position: relative">
                  <h3 class="display-1 font-weight-light blue--text mb-2">
                    Name Checker
                  </h3>
                  <div class="font-weight-light title mb-2">
                    Takes a variant description as input and checks whether it
                    is correct.
                  </div>
                </v-card-text>
              </v-card>
            </v-hover>
          </v-col>
          <v-col cols="12" sm="4" lg="4">
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
          <v-col cols="12" sm="4" lg="4">
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
};
</script>

<style scoped>
.cardNameChecker {
  background-color: #1565c0;
}
.cardNameChecker:hover {
  background-color: #1565c0;
}

.v-application {
  background-color: #ffffff;
}
</style>
