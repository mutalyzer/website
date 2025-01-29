<template>
  <v-container>
    <v-layout>
      <v-flex xs12>
        <h1 class="display-1 mt-10">Normalizer</h1>

        <v-expansion-panels flat hover>
          <v-expansion-panel>
            <v-expansion-panel-header expand-icon="mdi-help" disable-icon-rotate
              >Normalize a variant description.</v-expansion-panel-header
            >
            <v-expansion-panel-content color="grey lighten-5">
              <p class="mt-5">
                The Normalizer accepts as input an interpretable description and
                provides as primary output its canonical (<a
                  href="https://hgvs-nomenclature.org/"
                  target="_blank"
                  >HGVS</a
                >) description.
              </p>
              <h4 class="mt-5">Consequences</h4>
              <p>
                If possible, consequences at the DNA, RNA and protein levels are
                presented.
              </p>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>

        <v-sheet elevation="2" class="pa-5 mt-5">
          <v-row class="pt-1 pr-0">
            <v-spacer></v-spacer>
            <v-menu open-on-hover bottom left content-class="elevation-2">
              <template #activator="{ on, attrs }">
                <v-btn color="blue" icon v-bind="attrs" v-on="on">
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>

              <v-list>
                <v-list-item class="text-right">
                  <v-btn small text color="primary" @click="switchMode()">{{
                    getSwitchText()
                  }}</v-btn>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-row>
          <v-row v-if="mode == 'hgvs'" class="pt-5 pr-5 pl-5">
            <v-text-field
              ref="refInputDescriptionTextBox"
              v-model="inputDescriptionTextBox"
              class="pa-0 ma-0"
              :rules="rules"
              :label="inputDescriptionTextBoxLabel"
              :clearable="true"
              autofocus
              @keydown.enter="
                $router.push({
                  name: 'Normalizer',
                  params: { descriptionRouter: inputDescriptionTextBox },
                })
              "
            ></v-text-field>
          </v-row>

          <v-row v-if="mode == 'hgvs'" class="pl-5 pr-5 mt-2">
            <div class="examples-list">
              <span class="example-text">Examples:</span>
              <span
                v-for="(example, index) in descriptionExamples"
                :key="index"
                class="example-item"
                @click.prevent="selectDescriptionExample(index)"
                >{{ example }}</span
              >
              <v-menu transition="slide-x-transition">
                <template #activator="{ on, attrs }">
                  <span
                    class="example-link"
                    color="success"
                    v-bind="attrs"
                    v-on="on"
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
                  <v-list-item link>
                    <v-list-item-title
                      color="success"
                      class="example-item"
                      @click.prevent="
                        inputDescriptionTextBox = 'NG_012337.3:7124:G:T';
                        $refs.refInputDescriptionTextBox.focus();
                      "
                      >NG_012337.3:7124:G:T</v-list-item-title
                    >
                  </v-list-item>
                  <v-list-item link>
                    <v-list-item-title
                      color="success"
                      class="example-item"
                      @click.prevent="
                        inputDescriptionTextBox = 'NM_003002.4:308:1:';
                        $refs.refInputDescriptionTextBox.focus();
                      "
                      >NM_003002.4:308:1:</v-list-item-title
                    >
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </v-row>

          <v-row v-if="mode == 'sequence'" class="pt-5 pr-5 pl-5">
            <v-text-field
              v-model="sequence"
              class="pa-0 ma-0"
              :rules="rules"
              label="Reference Sequence"
              :clearable="true"
            ></v-text-field>
          </v-row>

          <v-row v-if="mode == 'sequence'" class="pl-5 pr-5">
            <v-text-field
              ref="refInputDescriptionTextBox"
              v-model="inputDescriptionTextBox"
              class="pa-0 ma-0"
              :rules="rules"
              label="Variants"
              :clearable="true"
            ></v-text-field>
          </v-row>

          <v-row v-if="mode == 'sequence'" class="pl-5">
            <div class="examples-list">
              <span class="example-link" @click="setSequenceExample()"
                >Example</span
              >
            </div>
          </v-row>

          <v-row class="pl-5 pb-5">
            <v-btn
              ref="normalize"
              class="mt-5"
              color="primary"
              :disabled="!valid"
              :to="{
                name: 'Normalizer',
                params: { descriptionRouter: inputDescriptionTextBox },
                query: getParams(),
              }"
            >
              Normalize
            </v-btn>
          </v-row>
        </v-sheet>

        <v-overlay :absolute="true" :value="loadingOverlay">
          <div class="text-center">
            <v-progress-circular :size="50" indeterminate></v-progress-circular>
          </div>
          <div class="text-center">
            <v-btn class="mt-5" @click="loadingOverlay = false"> Cancel </v-btn>
          </div>
        </v-overlay>

        <v-alert
          v-if="isNormalized()"
          ref="successAlert"
          class="mt-10 mb-0"
          elevation="2"
          prominent
          tile
          :color="getNormalizedColor()"
          type="success"
        >
          <v-row align="center">
            <v-col class="grow">
              <Description
                :description="response.normalized_description"
                :tooltip="
                  response.normalized_description != inputDescription
                    ? 'Different than the input description'
                    : 'Same as the input description'
                "
                :css_class="
                  response.normalized_description != inputDescription ||
                  response.infos
                    ? 'corrected-description-link-reverse'
                    : 'ok-description-link-reverse'
                "
                :to_name="'Normalizer'"
                :to_params="{
                  descriptionRouter: response.normalized_description,
                }"
                :to_query="getParams()"
                :tag="response.tag"
              />
            </v-col>
            <v-col v-if="infoMessages()" class="shrink">
              <v-tooltip bottom>
                <template #activator="{ on, attrs }">
                  <v-btn
                    v-bind="attrs"
                    icon
                    v-on="on"
                    @click="showCorrections = !showCorrections"
                  >
                    <v-icon>
                      mdi-details {{ showCorrections ? "mdi-rotate-180" : "" }}
                    </v-icon>
                  </v-btn>
                </template>
                <span>{{ showCorrections ? "Hide" : "See" }} Details</span>
              </v-tooltip>
            </v-col>
          </v-row>
        </v-alert>

        <v-alert
          v-if="connectionErrors"
          prominent
          type="error"
          tile
          elevation="2"
          class="mt-10"
          icon="mdi-network-off-outline"
          color="grey darken-4"
        >
          <v-row align="center">
            <v-col class="grow">
              {{ connectionErrors.details }}
            </v-col>
          </v-row>
        </v-alert>

        <v-alert
          v-if="response && response.errors"
          prominent
          type="error"
          tile
          elevation="2"
          class="mt-10 mb-0"
        >
          <v-row align="center">
            <v-col class="grow overline"
              >Description could not be interpreted</v-col
            >
            <v-col v-if="infoMessages()" class="shrink">
              <v-tooltip bottom>
                <template #activator="{ on, attrs }">
                  <v-btn
                    v-bind="attrs"
                    icon
                    v-on="on"
                    @click="showCorrections = !showCorrections"
                  >
                    <v-icon>
                      mdi-details {{ showCorrections ? "mdi-rotate-180" : "" }}
                    </v-icon>
                  </v-btn>
                </template>
                <span>{{ showCorrections ? "Hide" : "See" }} Details</span>
              </v-tooltip>
            </v-col>
          </v-row>
        </v-alert>

        <v-expand-transition>
          <v-sheet
            v-if="(infoMessages() && showCorrections) || errorsEncountered()"
            elevation="2"
          >
            <v-expand-transition>
              <v-sheet
                v-if="infoMessages() && showCorrections"
                ref="refCorrections"
                class="pt-5 pr-10 pb-5 pl-10"
                color="grey lighten-5"
              >
                <div v-if="correctionsPerformed()" class="overline">
                  Input Description
                </div>
                <div
                  v-if="correctionsPerformed()"
                  :class="getInputDescriptionClass()"
                >
                  {{ inputDescription }}
                </div>
                <div v-if="response.infos">
                  <div class="overline">Corrections / Info Messages</div>
                  <v-alert
                    v-for="(info, index) in response.infos"
                    :key="index"
                    color="light-blue lighten-5"
                    tile
                    border="left"
                    class="ml-2"
                  >
                    {{ getMessage(info) }}
                    <span v-if="info.code == 'IMRNAGENOMICDIFFERENCE'"
                      ><router-link
                        class="text-decoration-none"
                        target="_blank"
                        :to="{
                          name: 'Mapper',
                          query: {
                            description: response.normalized_description,
                            reference_id: info.reference_id,
                            selector_id: info.selector_id,
                            slice_to: 'transcript',
                            not_run: false,
                          },
                        }"
                        >Check it using the Mapper tool.</router-link
                      ></span
                    >
                  </v-alert>
                </div>
                <div v-if="correctionsPerformed() && showCorrections">
                  <div class="overline">Corrected Description</div>
                  <div :class="getCorrectedDescriptionClass()">
                    {{ response.corrected_description }}
                  </div>
                </div>
              </v-sheet>
            </v-expand-transition>

            <v-sheet
              v-if="errorsEncountered()"
              class="pt-10 pr-10 pb-8 pl-10"
              color="red lighten-5"
            >
              <v-alert
                v-for="(error, index) in response.errors"
                :key="index"
                color="red lighten-1"
                tile
                border="left"
                dark
              >
                <div v-if="syntaxError()">
                  <SyntaxError :error-model="getSyntaxError()" />
                </div>
                <div v-else>
                  {{ getMessage(error) }}
                </div>
              </v-alert>
            </v-sheet>
          </v-sheet>
        </v-expand-transition>

        <v-expansion-panels
          v-if="response && response.chromosomal_descriptions"
          focusable
          hover
          class="mt-5 mb-5"
          tile
          :value="genomic_open"
        >
          <v-expansion-panel>
            <v-expansion-panel-header class="overline"
              >Chromosomal Descriptions</v-expansion-panel-header
            >
            <v-expansion-panel-content class="pt-5">
              <div
                v-for="(pair, index) in response.chromosomal_descriptions"
                :key="index"
                class="ml-4"
              >
                <span>{{ pair.assembly }}</span>
                <Description
                  v-if="pair.c"
                  :description="pair.c"
                  :css_class="'ok-description-link'"
                  :to_name="'Normalizer'"
                  :to_params="{
                    descriptionRouter: pair.c,
                  }"
                  :tag="pair.tag"
                />
                <Description
                  v-if="pair.g"
                  :description="pair.g"
                  :css_class="'ok-description-link'"
                  :to_name="'Normalizer'"
                  :to_params="{ descriptionRouter: pair.g }"
                />
                <v-expansion-panels
                  v-if="pair.errors"
                  v-model="panel"
                  multiple
                  flat
                  tile
                >
                  <v-expansion-panel>
                    <v-expansion-panel-header class="overline red--text text"
                      >Unsuccessful mapping
                      <template #actions>
                        <v-icon color="error"> mdi-alert-circle </v-icon>
                      </template>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                      <v-alert
                        v-for="(error, index_errors) in pair.errors"
                        :key="index_errors"
                        color="red lighten-1"
                        tile
                        border="left"
                        dark
                        class="mt-5"
                      >
                        <div>
                          {{ getMessage(error) }}
                        </div>
                      </v-alert>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-expansion-panels>
              </div>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>

        <v-expansion-panels
          v-if="response && (response.rna || response.protein)"
          focusable
          hover
          class="mt-5 mb-5"
          tile
          :value="consequences_open"
        >
          <v-expansion-panel>
            <v-expansion-panel-header class="overline"
              >Biological Information Transfer</v-expansion-panel-header
            >
            <v-expansion-panel-content class="pt-5">
              <div
                v-if="
                  response &&
                  response.equivalent_descriptions &&
                  response.equivalent_descriptions.g
                "
              >
                <div class="overline">Genomic Description</div>
                <Description
                  :description="
                    response.equivalent_descriptions.g[0].description
                  "
                  :css_class="'ok-description-link'"
                  :to_name="'Normalizer'"
                  :to_params="{
                    descriptionRouter:
                      response.equivalent_descriptions.g[0].description,
                  }"
                />
              </div>

              <div v-if="response.rna && response.rna.errors">
                <div class="overline">Predictions</div>
                <v-sheet>
                  <v-alert
                    v-for="(error, index) in response.rna.errors"
                    :key="index"
                    color="red lighten-1"
                    tile
                    border="left"
                    dark
                  >
                    <div>
                      {{ getMessage(error) }}
                    </div>
                  </v-alert>
                </v-sheet>
              </div>

              <div v-if="response.rna && response.rna.description">
                <div class="overline">Predicted RNA Description</div>
                <Description
                  :description="response.rna.description"
                  :css_class="'ok-description-link'"
                  :to_name="'Normalizer'"
                  :to_params="{ descriptionRouter: response.rna.description }"
                />
              </div>

              <div v-if="response.protein && response.protein.description">
                <div class="overline">Predicted Protein Description</div>
                <Description
                  :description="response.protein.description"
                  :css_class="'ok-description-link'"
                  :to_name="'Normalizer'"
                  :to_params="{
                    descriptionRouter: response.protein.description,
                  }"
                />
                <AffectedProtein
                  v-if="response.protein && response.protein.description"
                  :protein="response.protein"
                />
              </div>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>

        <v-expansion-panels
          v-if="showTranscripts()"
          focusable
          hover
          class="mt-5 mb-5"
          tile
          :value="equivalent_open"
        >
          <v-expansion-panel>
            <v-expansion-panel-header class="overline"
              >Other Annotated Transcripts</v-expansion-panel-header
            >
            <v-expansion-panel-content class="pt-5">
              <v-sheet
                v-for="equivalent in getEquivalentDescriptions(
                  response.equivalent_descriptions,
                )"
                :key="equivalent.type"
              >
                <div class="overline">{{ equivalent.type }}</div>
                <v-sheet
                  v-for="(e_d, index) in equivalent.descriptions"
                  :key="index"
                >
                  <v-hover v-slot="{ hover }">
                    <v-sheet
                      :color="hover ? 'grey lighten-3' : ''"
                      class="pa-2 ma-1"
                    >
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
                    </v-sheet>
                  </v-hover>
                  <v-divider
                    v-if="index != equivalent.descriptions.length - 1"
                  ></v-divider>
                </v-sheet>
              </v-sheet>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>

        <v-expansion-panels
          v-if="showEquivalentProtein()"
          focusable
          hover
          class="mt-5 mb-5"
          tile
          :value="equivalent_open"
        >
          <v-expansion-panel>
            <v-expansion-panel-header class="overline"
              >Equivalent Description</v-expansion-panel-header
            >
            <v-expansion-panel-content class="pt-5">
              <Description
                :description="response.equivalent_descriptions.p[0].description"
                :css_class="'ok-description-link'"
                :to_name="'Normalizer'"
                :to_params="{
                  descriptionRouter:
                    response.equivalent_descriptions.p[0].description,
                }"
              /> </v-expansion-panel-content
          ></v-expansion-panel>
        </v-expansion-panels>
        <v-expansion-panels
          v-if="response && response.back_translated_descriptions"
          focusable
          hover
          class="mt-5 mb-5"
          tile
          :value="back_translated_open"
        >
          <v-expansion-panel>
            <v-expansion-panel-header class="overline"
              >Back Translated Descriptions</v-expansion-panel-header
            >
            <v-expansion-panel-content class="pt-5">
              <div
                v-for="(
                  equivalentDescription, index
                ) in response.back_translated_descriptions"
                :key="index"
              >
                <router-link
                  class="ok-description-link"
                  :to="{
                    name: 'Normalizer',
                    params: { descriptionRouter: equivalentDescription },
                  }"
                  >{{ equivalentDescription }}</router-link
                >
              </div>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>

        <v-expansion-panels
          v-if="showReferenceInformation()"
          focusable
          hover
          class="mt-5 mb-5"
          tile
        >
          <v-expansion-panel>
            <v-expansion-panel-header class="overline"
              >Reference Sequence Information</v-expansion-panel-header
            >
            <v-expansion-panel-content>
              <ReferenceInformation :model="response.corrected_model" />
              <SelectorShort
                v-if="response && response.selector_short"
                :selector="response.selector_short"
              />
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>

        <v-expansion-panels
          v-if="
            response &&
            response.normalized_description &&
            response.normalized_model &&
            response.normalized_model.reference &&
            !['p'].includes(response.normalized_model.coordinate_system)
          "
          focusable
          hover
          class="mt-5 mb-5"
          tile
        >
          <v-expansion-panel>
            <v-expansion-panel-header class="overline"
              >Related reference sequences</v-expansion-panel-header
            >
            <v-expansion-panel-content class="pt-5">
              <Related
                :model="response.normalized_model"
                :description="response.normalized_description"
              />
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>

        <v-expansion-panels
          v-if="
            response &&
            response.normalized_description &&
            response.normalized_model
          "
          focusable
          hover
          class="mt-5 mb-5"
          tile
        >
          <v-expansion-panel>
            <v-expansion-panel-header class="overline"
              >View Variants Sequence Overview</v-expansion-panel-header
            >
            <v-expansion-panel-content class="pt-2 pb-2">
              <ViewVariants
                :description="response.normalized_description"
                :only_variants="response.only_variants"
                :sequence="response.sequence"
                :d_type="'normalized'"
                :selector="response.selector_short"
                :c_s_var="get_c_s_var()"
                :c_s_seq="get_c_s_seq()"
              />
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>

        <v-expansion-panels v-if="response" focusable hover class="mt-10 mb-10">
          <v-expansion-panel>
            <v-expansion-panel-header>Raw Response</v-expansion-panel-header>
            <v-expansion-panel-content>
              <JsonPretty :summary="response" />
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import MutalyzerService from "../services/MutalyzerService.js";
import JsonPretty from "../components/JsonPretty.vue";
import AffectedProtein from "../components/AffectedProtein.vue";
import SelectorShort from "../components/SelectorShort.vue";
import SyntaxError from "../components/SyntaxError.vue";
import ReferenceInformation from "../components/ReferenceInformation.vue";
import Related from "../components/Related.vue";
import ViewVariants from "../components/ViewVariants.vue";
import Description from "../components/Description.vue";

export default {
  components: {
    JsonPretty,
    SelectorShort,
    AffectedProtein,
    SyntaxError,
    ReferenceInformation,
    Related,
    ViewVariants,
    Description,
  },
  props: ["descriptionRouter"],
  data: () => ({
    valid: true,
    inputDescriptionTextBox: null,
    rules: [(value) => !!value || "Required."],
    inputDescriptionTextBoxLabel: "HGVS Description",
    descriptionExamples: [
      "NG_012337.3(NM_003002.4):c.274G>T",
      "NC_000011.10:g.112088970del",
      "GRCh38(chr11):g.112088970del",
    ],
    loadingOverlay: false,
    inputDescription: null, // The description for which the most recent call was sent.
    response: null,
    connectionErrors: null,
    showCorrections: false,
    sequence: null,
    only_variants: false,
    mode: "hgvs",
    genomic_open: 0,
    equivalent_open: 0,
    consequences_open: 1,
    back_translated_open: 1,
  }),
  watch: {
    $route() {
      this.run();
    },
  },
  created: function () {
    this.run();
  },
  methods: {
    run: function () {
      this.setRouterParams();
      this.normalize();
    },
    setRouterParams: function () {
      if (
        this.descriptionRouter &&
        this.descriptionRouter.length !== 0 &&
        !this.$route.query.only_variants &&
        !this.$route.query.sequence
      ) {
        this.inputDescriptionTextBox = this.descriptionRouter;
        this.mode = "hgvs";
      } else if (
        this.descriptionRouter &&
        this.descriptionRouter.length !== 0 &&
        this.$route.query.only_variants &&
        this.$route.query.sequence &&
        this.$route.query.sequence.length !== 0
      ) {
        this.inputDescriptionTextBox = this.descriptionRouter;
        this.only_variants = this.$route.query.only_variants;
        this.sequence = this.$route.query.sequence;
        this.mode = "sequence";
      } else if (
        !this.descriptionRouter &&
        !this.$route.query.only_variants &&
        !this.$route.query.sequence
      ) {
        this.mode = "hgvs";
      } else {
        this.$router.push({
          name: "Normalizer",
        });
      }
    },
    normalize: function () {
      if (this.mode == "hgvs") {
        this.normalizeHgvs();
      } else if (this.mode == "sequence") {
        this.normalizeSequence();
      }
    },
    normalizeHgvs: function () {
      if (this.inputDescriptionTextBox !== null) {
        this.prepareForRequest();
        MutalyzerService.normalizeHgvs(this.inputDescriptionTextBox)
          .then(this.handleSuccess)
          .catch(this.handleError);
      }
    },
    prepareForRequest: function () {
      this.loadingOverlay = true;
      this.inputDescription = null;
      this.response = null;
      this.connectionErrors = null;
      this.showCorrections = false;
      this.inputDescriptionTextBox = this.inputDescriptionTextBox.trim();
    },
    handleSuccess: function (response) {
      if (response.data) {
        this.loadingOverlay = false;
        this.response = response.data;
        this.inputDescription = this.inputDescriptionTextBox;
        if (this.isNormalized()) {
          this.$nextTick(() => {
            this.$vuetify.goTo(this.$refs.successAlert, this.options);
          });
          this.openPanels();
        }
      }
    },
    handleError: function (error) {
      this.loadingOverlay = false;
      if (error.response) {
        if (
          error.response.status === 422 &&
          error.response.data &&
          error.response.data.custom
        ) {
          let errors = error.response.data.custom.errors;
          if (
            (errors.length === 1 && errors[0].code === "ESYNTAXUEOF") ||
            errors[0].code === "ESYNTAXUC"
          ) {
            this.spdiToHgvs(error.response.data.custom);
          } else {
            this.response = error.response.data.custom;
          }
        } else if (error.response.status === 504) {
          this.connectionErrors = {
            details:
              "Operation Timeout: This normalization appears too resource-intensive for the server. We recommend using a local installation.",
          };
        } else {
          this.connectionErrors = {
            details:
              "Internal Server Error: An unexpected error occurred. Please contact us if you think that the description should be processed.",
          };
        }
      } else if (error.request) {
        this.connectionErrors = {
          details:
            "Internal Server Error: An unexpected error occurred. Please contact us if you think that the description should be processed.",
        };
      } else {
        this.connectionErrors = {
          details:
            "Internal Server Error: An unexpected error occurred. Please contact us if you think that the description should be processed.",
        };
      }
    },
    normalizeSequence: function () {
      if (this.inputDescriptionTextBox !== null) {
        this.prepareForRequest();

        MutalyzerService.normalizeSequence(
          this.inputDescriptionTextBox,
          this.getParams(),
        )
          .then(this.handleSuccess)
          .catch.catch(this.handleError);
      }
    },
    spdiToHgvs: function (hgvs_error) {
      if (this.inputDescriptionTextBox !== null) {
        this.loadingOverlay = true;
        MutalyzerService.spdiConverter(this.inputDescriptionTextBox)
          .then((response) => {
            if (response.data.normalized_description) {
              MutalyzerService.normalizeHgvs(
                response.data.normalized_description,
              ).then(this.handleSuccess);
            }
          })
          .catch(() => {
            this.loadingOverlay = false;
            this.response = hgvs_error;
          });
      }
    },
    isNormalized: function () {
      if (this.response && this.response.normalized_description) {
        return true;
      } else {
        return false;
      }
    },
    getNormalizedColor: function () {
      if (this.isNormalized()) {
        if (
          this.response.normalized_description == this.inputDescription &&
          !this.response.infos
        ) {
          return "green";
        } else {
          return "blue";
        }
      }
    },
    correctionsPerformed: function () {
      return (
        this.response &&
        this.response.corrected_description &&
        this.response.corrected_description != this.inputDescription
      );
    },
    infoMessages: function () {
      return this.response && this.response.infos;
    },
    syntaxError: function () {
      if (this.getSyntaxError()) {
        return true;
      } else {
        return false;
      }
    },
    getSyntaxError: function () {
      if (this.response && this.response.errors) {
        let errors = this.response.errors;
        if (
          (errors.length === 1 && errors[0].code === "ESYNTAXUEOF") ||
          errors[0].code === "ESYNTAXUC"
        ) {
          return errors[0];
        }
      }
    },
    errorsEncountered: function () {
      if (this.response && this.response.errors) {
        return true;
      } else {
        return false;
      }
    },
    getMessage: function (message) {
      if (message.details) {
        if (message.options) {
          return (
            message.details +
            " Choose from: " +
            message.options.join(", ") +
            "."
          );
        }
        return message.details;
      }
      return message;
    },
    getInputDescriptionClass: function () {
      if (this.response) {
        if (
          this.response.normalized_description &&
          this.response.normalized_description == this.inputDescription
        ) {
          return "ok-description";
        } else if (
          this.response.corrected_description &&
          this.response.corrected_description == this.inputDescription
        ) {
          return "normalized-description";
        } else if (
          this.response.corrected_description &&
          !this.response.errors
        ) {
          return "corrected-description";
        } else {
          return "error-description";
        }
      }
    },
    getCorrectedDescriptionClass: function () {
      if (this.response) {
        if (
          this.response.normalized_description &&
          this.response.corrected_description &&
          this.response.normalized_description ==
            this.response.corrected_description
        ) {
          return "ok-description";
        } else if (
          this.response.normalized_description &&
          this.response.corrected_description &&
          this.response.normalized_description != this.inputDescription
        ) {
          return "corrected-description";
        } else if (
          this.response.corrected_description &&
          this.response.errors
        ) {
          return "error-description";
        } else {
          return "description";
        }
      }
    },
    showReferenceInformation() {
      if (
        this.response &&
        this.response.corrected_description &&
        !this.response.only_variants
      ) {
        if (this.response.errors) {
          for (let error of this.response.errors) {
            if (error.code && error.code == "ERETR") {
              return false;
            }
          }
        }
        return true;
      } else {
        return false;
      }
    },
    reset: function () {
      this.inputDescriptionTextBox = null;
      this.only_variants = false;
      this.sequence = null;
      this.response = null;
    },
    switchMode: function () {
      if (this.mode == "sequence") {
        this.mode = "hgvs";
        this.reset();
        if (this.$route.query.descriptionRouter) {
          this.$router.push({
            name: "Normalizer",
          });
        }
      } else if (this.mode == "hgvs") {
        this.mode = "sequence";
        this.reset();
      }
    },
    getSwitchText: function () {
      if (this.mode == "hgvs") {
        return "Switch to sequence mode";
      } else if (this.mode == "sequence") {
        return "Switch to HGVS mode";
      }
    },
    getParams: function () {
      if (this.mode == "hgvs") {
        return {};
      } else if (this.mode == "sequence") {
        return {
          only_variants: true,
          sequence: this.sequence,
        };
      }
    },
    getEquivalentDescriptions: function (equivalent) {
      var c_s_mapping = {
        c: "Coding",
        n: "Noncoding",
      };
      var c_s_l = [];
      for (let c_s in c_s_mapping) {
        if (equivalent[c_s]) {
          let descriptions = [];
          for (let d in equivalent[c_s]) {
            descriptions.push(equivalent[c_s][d]);
          }
          c_s_l.push({
            type: c_s_mapping[c_s],
            descriptions: this.sortedEquivalent(descriptions),
          });
        }
      }
      return c_s_l;
    },
    sortedEquivalent: function (descriptions) {
      const sorted = [...descriptions].sort((a, b) => {
        if (a.tag && !b.tag) return -1;
        if (!a.tag && b.tag) return 1;
        if (a.description > b.description) return -1;
        if (a.description < b.description) return 1;
      });
      return sorted;
    },
    setSequenceExample: function () {
      this.inputDescriptionTextBox = "2del";
      this.sequence = "ATTAAC";
    },
    selectDescriptionExample: function (i) {
      this.inputDescriptionTextBox = this.descriptionExamples[i];
      this.$refs.refInputDescriptionTextBox.focus();
    },
    openPanels: function () {
      if (
        this.response &&
        this.response.normalized_model &&
        (this.response.normalized_model.coordinate_system == "c" ||
          this.response.normalized_model.coordinate_system == "r")
      ) {
        this.consequences_open = 0;
      }
      if (
        this.response &&
        this.response.normalized_model &&
        this.response.normalized_model.coordinate_system == "p" &&
        this.response.back_translated_descriptions
      ) {
        this.back_translated_open = 0;
      }
    },
    showTranscripts: function () {
      if (this.response && this.response.equivalent_descriptions) {
        for (let c_s in this.response.equivalent_descriptions) {
          if (c_s == "c" || c_s == "n") {
            return true;
          }
        }
      }
      return false;
    },
    showEquivalentProtein: function () {
      if (this.response && this.response.equivalent_descriptions) {
        for (let c_s in this.response.equivalent_descriptions) {
          if (c_s == "p") {
            return true;
          }
        }
      }
      return false;
    },
    get_c_s_var: function () {
      if (
        this.response &&
        this.response.normalized_model &&
        this.response.normalized_model.coordinate_system
      ) {
        return this.response.normalized_model.coordinate_system + ".";
      }
      return null;
    },
    get_c_s_seq: function () {
      if (this.response && this.response.equivalent_descriptions) {
        for (let c_s in this.response.equivalent_descriptions) {
          if (c_s == "g") {
            return "g.";
          }
        }
      }
      return null;
    },
  },
};
</script>

<style scoped src="../assets/main.css"></style>
