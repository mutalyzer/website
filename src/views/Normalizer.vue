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
              :disabled="!valid || loadingOverlay"
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
            <v-btn class="mt-5" @click="cancelRequest"> Cancel </v-btn>
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
          :type="
            isIntronicErrorSuggestions() ||
            isGeneMultipleTranscriptsErrorSuggestions()
              ? 'warning'
              : 'error'
          "
          tile
          elevation="2"
          class="mt-10 mb-0"
        >
          <v-row align="center">
            <v-col
              v-if="
                isIntronicErrorSuggestions() ||
                isGeneMultipleTranscriptsErrorSuggestions()
              "
              class="grow overline"
              >Additional information is required to be able to interpret this
              description</v-col
            >
            <v-col v-else class="grow overline"
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
              v-if="isIntronicErrorSuggestions()"
              class="pt-10 pr-10 pb-8 pl-10"
              color="orange lighten-5"
            >
              <div>
                <p>
                  The position{{
                    response.errors[0].positions.length > 1 ? "s" : ""
                  }}
                  <span
                    v-for="(pos, index) in response.errors[0].positions"
                    :key="index"
                  >
                    <code>{{ pos }}</code>
                    <span v-if="index < response.errors[0].positions.length - 2"
                      >,
                    </span>
                    <span
                      v-else-if="
                        index === response.errors[0].positions.length - 2
                      "
                    >
                      and
                    </span>
                  </span>
                  {{ response.errors[0].positions.length > 1 ? "are" : "is" }}
                  intronic and cannot be interpreted with the transcript
                  reference sequence
                  <code>{{ response.errors[0].reference_id }}</code
                  >, which does not include intronic regions. Intronic positions
                  require a genomic reference sequence, e.g.
                  <code>NC_*(NM_*)</code>.
                </p>
                <p class="mt-4 font-weight-medium">
                  Did you mean one of the following descriptions?
                </p>
                <div>
                  <v-sheet
                    v-for="(s_d, ind) in response.errors[0].suggestions"
                    :key="ind"
                    outlined
                    class="pa-4 my-4"
                  >
                    <div class="text-subtitle-1">
                      {{ s_d.assembly_id }}
                    </div>
                    <Description
                      :description="s_d.description"
                      css_class="other-description-link"
                      :to_name="'Normalizer'"
                      :to_params="{ descriptionRouter: s_d.description }"
                    />
                  </v-sheet>
                </div>
              </div>
            </v-sheet>

            <v-sheet
              v-if="isGeneMultipleTranscriptsErrorSuggestions()"
              class="pt-10 pr-10 pb-8 pl-10"
              color="orange lighten-5"
            >
              <div>
                <p>
                  Reference
                  <code>{{ response.errors[0].gene }}</code>
                  has been identified as a gene on chromosome
                  <code>{{ response.errors[0].chr_id }}</code
                  >, but this gene has multiple associated transcripts.
                </p>
                <p class="mt-4 font-weight-medium">
                  Did you mean one of the following descriptions?
                </p>
                <div>
                  <v-sheet
                    v-for="(option, ind) in getSortedOptions(
                      response.errors[0].options,
                    )"
                    :key="ind"
                    outlined
                    class="pa-4 my-4"
                  >
                    <Description
                      :description="option.description"
                      css_class="other-description-link"
                      :to_name="'Normalizer'"
                      :to_params="{ descriptionRouter: option.description }"
                      :tag="convertOptionToTag(option)"
                    />
                  </v-sheet>
                </div>
              </div>
            </v-sheet>

            <v-sheet
              v-if="
                !isIntronicErrorSuggestions() &&
                !isGeneMultipleTranscriptsErrorSuggestions() &&
                errorsEncountered()
              "
              class="pt-10 pr-10 pb-8 pl-10"
              color="red lighten-5"
            >
              <div>
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
              </div>
            </v-sheet>
          </v-sheet>
        </v-expand-transition>

        <v-expansion-panels
          v-if="response && get_chromosomal_descriptions()"
          focusable
          hover
          class="mt-5 mb-5"
          tile
          :value="chromosomal_open"
        >
          <v-expansion-panel>
            <v-expansion-panel-header class="overline"
              >Chromosomal Descriptions</v-expansion-panel-header
            >
            <v-expansion-panel-content class="pt-5">
              <ChromosomalDescriptions
                v-if="response.normalized_description"
                :description="response.normalized_description"
              ></ChromosomalDescriptions>
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
                        v-if="
                          e_d.reference &&
                          e_d.reference.selector &&
                          e_d.reference.selector.id
                        "
                        :description="e_d.description"
                        :css_class="'ok-description-link'"
                        :to_name="'Normalizer'"
                        :to_params="{
                          descriptionRouter: e_d.description,
                        }"
                        :tag="e_d.tag"
                        :selector="e_d.reference.selector"
                      />
                      <Description
                        v-else
                        :description="e_d.description"
                        :css_class="'ok-description-link'"
                        :to_name="'Normalizer'"
                        :to_params="{
                          descriptionRouter: e_d.description,
                        }"
                        :tag="e_d.tag"
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
          v-if="
            response &&
            (response.supremal || response.dot || response.minimal_descriptions)
          "
          accordionfocusable
          hover
          class="mt-5 mb-5"
          tile
        >
          <v-expansion-panel>
            <v-expansion-panel-header class="overline"
              >Internals</v-expansion-panel-header
            >
            <v-expansion-panel-content>
              <div v-if="response.supremal" class="pl-5">
                <div class="overline">Supremal variant</div>
                <div class="pl-5 pr-5">
                  <div class="overline">HGVS</div>
                  <Description
                    :description="response.supremal.hgvs"
                    :css_class="'ok-description-link'"
                    :to_name="'Normalizer'"
                    :to_params="{ descriptionRouter: response.supremal.hgvs }"
                    :to_query="getParams()"
                  />
                  <div class="overline">SPDI</div>
                  <Description
                    :description="response.supremal.spdi"
                    :css_class="'ok-description'"
                  />
                </div>
              </div>

              <div
                v-if="response.local_supremal && response.local_supremal.hgvs"
                class="pl-5"
              >
                <div class="overline">Local Supremal</div>
                <div class="pl-5 pr-5">
                  <Description
                    :description="response.local_supremal.hgvs"
                    :css_class="'ok-description-link'"
                    :to_name="'Normalizer'"
                    :to_params="{
                      descriptionRouter: response.local_supremal.hgvs,
                    }"
                    :to_query="getParams()"
                  />
                </div>
              </div>

              <v-expansion-panels
                v-if="response.view_local_supremal"
                multiple
                flat
                focusable
                hover
                tile
                class="mt-5"
              >
                <v-expansion-panel>
                  <v-expansion-panel-header
                    class="overline blue-grey--text text"
                    >View Local Supremal Variants</v-expansion-panel-header
                  >
                  <v-expansion-panel-content>
                    <div class="overline"></div>
                    <ViewVariantsCore
                      :view="response.view_local_supremal"
                      :d_id="'local_supremal'"
                      :selector="response.selector_short"
                      :c_s_var="get_c_s_var()"
                      :c_s_seq="get_c_s_seq()"
                    />
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>

              <v-expansion-panels
                v-if="response && response.dot"
                multiple
                flat
                focusable
                hover
                tile
              >
                <v-expansion-panel id="dot-graph-container">
                  <v-expansion-panel-header
                    class="overline blue-grey--text text"
                    >Minimal Representations Graph</v-expansion-panel-header
                  >

                  <v-expansion-panel-content class="mt-5">
                    <DotGraph :dottext="response.dot" />
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>

              <v-expansion-panels
                v-if="response && response.dot_complement"
                multiple
                flat
                focusable
                hover
                tile
              >
                <v-expansion-panel id="dot-graph-container">
                  <v-expansion-panel-header
                    class="overline blue-grey--text text"
                    >Minimal Representations Graph
                    Complement</v-expansion-panel-header
                  >

                  <v-expansion-panel-content class="mt-5">
                    <DotGraph :dottext="response.dot_complement" />
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>

              <v-expansion-panels
                v-if="response && response.minimal_descriptions"
                multiple
                flat
                focusable
                hover
                tile
              >
                <v-expansion-panel>
                  <v-expansion-panel-header
                    class="overline blue-grey--text text"
                    >{{ minimalTitle() }}</v-expansion-panel-header
                  >

                  <v-expansion-panel-content class="pt-5">
                    <div
                      v-for="(
                        minimal_description, index
                      ) in response.minimal_descriptions"
                      :key="index"
                    >
                      <Description
                        :description="minimal_description"
                        :css_class="'ok-description-link'"
                        :to_name="'Normalizer'"
                        :to_params="{ descriptionRouter: minimal_description }"
                        :to_query="getParams()"
                      />
                    </div>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
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
          <v-expansion-panels focusable·hover·class="mt-5·mb-5" tile>
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
import ViewVariantsCore from "../components/ViewVariantsCore.vue";
import Description from "../components/Description.vue";
import ChromosomalDescriptions from "../components/ChromosomalDescriptions.vue";
import DotGraph from "../components/DotGraph.vue";

export default {
  components: {
    JsonPretty,
    SelectorShort,
    AffectedProtein,
    SyntaxError,
    ReferenceInformation,
    Related,
    ViewVariants,
    ViewVariantsCore,
    Description,
    ChromosomalDescriptions,
    DotGraph,
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
    currentController: null, // AbortController for the in-flight request.
    currentRequestId: 0, // Increasing id for each request.
    canceledRequestIds: new Set(), // Canceled request ids.
    connectionErrors: null,
    showCorrections: false,
    sequence: null,
    only_variants: false,
    mode: "hgvs",
    chromosomal_open: 1,
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
  beforeDestroy() {
    try {
      this.currentController?.abort();
    } catch (e) {
      /* empty */
    }
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
        const reqId = this.currentRequestId;
        MutalyzerService.normalizeHgvs(this.inputDescriptionTextBox, {
          signal: this.currentController.signal,
        })
          .then((res) => this.safeHandleSuccess(reqId, res))
          .catch((err) => this.safeHandleError(reqId, err));
      }
    },
    prepareForRequest: function () {
      this.loadingOverlay = true;
      this.inputDescription = null;
      this.response = null;
      this.connectionErrors = null;
      this.showCorrections = false;
      this.inputDescriptionTextBox = this.inputDescriptionTextBox.trim();

      // cancellation setup
      this.canceledRequestIds.clear();
      this.currentController?.abort();
      this.currentController = new AbortController();
      this.currentRequestId += 1;
    },
    cancelRequest() {
      // mark current as canceled and abort the network call
      this.canceledRequestIds.add(this.currentRequestId);
      try {
        this.currentController?.abort();
      } catch (e) {
        /* empty */
      }
      this.loadingOverlay = false;
    },

    safeHandleSuccess(reqId, response) {
      if (this.canceledRequestIds.has(reqId)) return; // ignore late success
      this.handleSuccess(response);
    },

    safeHandleError(reqId, error) {
      if (
        error?.name === "CanceledError" ||
        error?.message === "canceled" ||
        error?.code === "ERR_CANCELED" ||
        this.canceledRequestIds.has(reqId)
      ) {
        return;
      }
      this.handleError(error);
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
        const reqId = this.currentRequestId;
        MutalyzerService.normalizeSequence(
          this.inputDescriptionTextBox,
          this.getParams(),
          { signal: this.currentController.signal },
        )
          .then((res) => this.safeHandleSuccess(reqId, res))
          .catch((err) => this.safeHandleError(reqId, err));
      }
    },
    spdiToHgvs: function (hgvs_error) {
      if (this.inputDescriptionTextBox !== null) {
        const reqId = this.currentRequestId;
        MutalyzerService.spdiConverter(this.inputDescriptionTextBox, {
          signal: this.currentController?.signal,
        })
          .then((response) => {
            if (this.canceledRequestIds.has(reqId)) return;
            if (response.data.normalized_description) {
              return MutalyzerService.normalizeHgvs(
                response.data.normalized_description,
                { signal: this.currentController?.signal },
              ).then((res) => this.safeHandleSuccess(reqId, res));
            }
          })
          .catch((err) => {
            if (
              err?.name === "CanceledError" ||
              err?.code === "ERR_CANCELED" ||
              err?.message === "canceled" ||
              this.canceledRequestIds.has(reqId)
            ) {
              return;
            }
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
    isIntronicErrorSuggestions: function () {
      if (this.response && this.response.errors) {
        let errors = this.response.errors;
        if (
          errors.length === 1 &&
          errors[0].code === "EINTRONIC" &&
          errors[0].suggestions
        ) {
          return true;
        }
      }
      return false;
    },
    isGeneMultipleTranscriptsErrorSuggestions: function () {
      if (this.response && this.response.errors) {
        let errors = this.response.errors;
        if (
          errors.length === 1 &&
          errors[0].code === "EGENEMULTIPLETRANSCRIPTS" &&
          errors[0].options
        ) {
          return true;
        }
      }
      return false;
    },
    getSortedOptions(options) {
      if (!options) return [];

      return [...options].sort((a, b) => {
        if (a.tag && !b.tag) return -1;
        if (!a.tag && b.tag) return 1;

        if (a.description > b.description) return -1;
        if (a.description < b.description) return 1;

        return 0;
      });
    },
    convertOptionToTag: function (option) {
      if (!option.tag || !option.transcript_id) {
        return null;
      }

      return {
        id: option.transcript_id,
        details: option.tag,
      };
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
    get_chromosomal_descriptions: function () {
      if (!this.response) {
        return false;
      }

      if (this.response.infos) {
        for (var i = 0; i < this.response.infos.length; i++) {
          var info = this.response.infos[i];
          if (info.code && info.code === "IMRNAGENOMICTIP") {
            return true;
          }
        }
      }

      if (
        this.response.normalized_model &&
        this.response.normalized_model.reference &&
        this.response.normalized_model.reference.id &&
        this.response.normalized_model.reference.id.indexOf("NG_") === 0 &&
        this.response.normalized_model.reference.selector &&
        this.response.normalized_model.reference.selector.id &&
        this.response.normalized_model.reference.selector.id.indexOf("NM_") ===
          0
      ) {
        return true;
      }

      return false;
    },
  },
};
</script>

<style scoped src="../assets/main.css"></style>
