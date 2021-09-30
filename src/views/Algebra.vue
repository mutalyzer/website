<template>
  <v-container>
    <v-layout>
      <v-flex xs12>
        <h1 class="display-1 mt-10">Algebra</h1>
        <p>Compute the relation between variants.</p>
        <v-sheet elevation="2" class="mt-10">
          <v-sheet class="pl-10 pt-5 pb-5 pr-10" color="light-blue lighten-5">
            <v-row>
              <strong class="overline">{{ getTitleText() }}</strong>
              <v-spacer></v-spacer>
              <v-menu open-on-hover bottom left content-class="elevation-2">
                <template v-slot:activator="{ on, attrs }">
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
          </v-sheet>
          <v-sheet class="pa-10">
            <v-form ref="form" v-model="valid" :lazy-validation="lazy">
              <v-row v-if="mode == 'sequence'" class="pl-2 pr-2">
                <v-col cols="12">
                  <v-text-field
                    :rules="rules"
                    v-model="reference"
                    :label="'Reference sequence'"
                    :hint="'E.g. ATTAAA'"
                    :clearable="true"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row v-if="mode == 'sequence'" class="pl-2 pr-2">
                <v-col cols="12" sm="9" lg="9">
                  <v-text-field
                    :rules="rules"
                    v-model="lhs"
                    :label="'LHS'"
                    :hint="getLhsHintText(lhs_type)"
                    :clearable="true"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" sm="3" lg="3">
                  <v-select
                    v-model="lhs_type"
                    :rules="rules"
                    :items="['sequence', 'variant']"
                    :clearable="true"
                    label="Type"
                  ></v-select>
                </v-col>
              </v-row>

              <v-row v-if="mode == 'hgvs'" class="pl-2 pr-2">
                <v-col cols="12">
                  <v-text-field
                    :rules="rules"
                    v-model="lhs"
                    :label="'LHS'"
                    :hint="getLhsHintText(lhs_type)"
                    :clearable="true"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row v-if="mode == 'sequence'" class="pl-2 pr-2">
                <v-col cols="12" sm="9" lg="9">
                  <v-text-field
                    v-model="rhs"
                    :rules="rules"
                    :label="'RHS'"
                    :hint="getLhsHintText(rhs_type)"
                    :clearable="true"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" sm="3" lg="3">
                  <v-select
                    v-model="rhs_type"
                    :rules="rules"
                    :items="['sequence', 'variant']"
                    :clearable="true"
                    label="Type"
                  ></v-select>
                </v-col>
              </v-row>

              <v-row v-if="mode == 'hgvs'" class="pl-2 pr-2">
                <v-col cols="12">
                  <v-text-field
                    :rules="rules"
                    v-model="rhs"
                    :label="'RHS'"
                    :hint="getLhsHintText(rhs_type)"
                    :clearable="true"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-form>
            <v-row>
              <v-btn
                ref="convert"
                class="mt-5"
                color="primary"
                :disabled="!valid"
                :to="{
                  name: 'Algebra',
                  query: getParams(),
                }"
              >
                Compare
              </v-btn>
              <v-spacer></v-spacer>
              <v-btn color="success" class="mt-5" @click="setExample()">
                Example
              </v-btn>
            </v-row>
          </v-sheet>
        </v-sheet>

        <v-overlay :absolute="true" :value="loadingOverlay">
          <div class="text-center">
            <v-progress-circular :size="50" indeterminate></v-progress-circular>
          </div>
          <div class="text-center">
            <v-btn @click="loadingOverlay = false" class="mt-5"> Cancel </v-btn>
          </div>
        </v-overlay>

        <v-alert
          ref="successAlert"
          class="mt-10 mb-0"
          elevation="2"
          prominent
          tile
          v-if="relation"
          :color="'green'"
          type="success"
        >
          <Description :description="relation" />
        </v-alert>

        <v-alert
          prominent
          type="error"
          tile
          elevation="2"
          class="mt-10 mb-0"
          v-if="response && response.errors"
        >
          <v-row align="center">
            <v-col class="grow overline"
              >Comparison could not be performed</v-col
            >
          </v-row>
        </v-alert>

        <v-sheet
          class="pt-10 pr-10 pb-8 pl-10 mb-10"
          elevation="2"
          color="red lighten-5"
          v-if="errorsEncountered()"
        >
          <div v-for="(errors, key) in response.errors" :key="key">
            <div class="overline">{{ key }}</div>
            <v-alert
              color="red lighten-1"
              tile
              border="left"
              dark
              v-for="(error, index) in errors"
              :key="index"
            >
              <div>
                {{ getMessage(error) }}
              </div>
            </v-alert>
          </div>
        </v-sheet>

        <v-expansion-panels
          focusable
          hover
          class="mt-5 mb-10"
          tile
          v-if="
            response &&
            (response.influence_lhs ||
              response.influence_rhs ||
              response.ref_seq ||
              response.lhs_seq ||
              response.rhs_seq)
          "
        >
          <v-expansion-panel>
            <v-expansion-panel-header class="overline"
              >Details</v-expansion-panel-header
            >
            <v-expansion-panel-content class="pt-5">
              <div v-if="response.ref_seq">
                <div class="overline">Reference Sequence</div>
                <div class="sequence">
                  {{ response.ref_seq }}
                </div>
              </div>
              <div v-if="response.lhs_seq">
                <div class="overline">LHS Sequence</div>
                <div class="sequence">
                  {{ response.lhs_seq }}
                </div>
              </div>
              <div v-if="response.lhs_seq">
                <div class="overline">RHS Sequence</div>
                <div class="sequence">
                  {{ response.rhs_seq }}
                </div>
              </div>
              <div v-if="response.influence_lhs">
                <div class="overline">LHS Influence Interval</div>
                <div
                  v-if="
                    response.influence_lhs.hasOwnProperty('min_pos') &&
                    response.influence_lhs.hasOwnProperty('max_pos')
                  "
                  class="sequence"
                >
                  {{ response.influence_lhs.min_pos }},
                  {{ response.influence_lhs.max_pos }}
                </div>
                <div v-else class="sequence">Equal.</div>
              </div>
              <div v-if="response.influence_rhs">
                <div class="overline">RHS Influence Interval</div>
                <div
                  v-if="
                    response.influence_rhs.hasOwnProperty('min_pos') &&
                    response.influence_rhs.hasOwnProperty('max_pos')
                  "
                  class="sequence"
                >
                  {{ response.influence_rhs.min_pos }},
                  {{ response.influence_rhs.max_pos }}
                </div>
                <div v-else class="sequence">Equal.</div>
              </div>
              <div v-if="response.view_lhs">
                <ViewVariantsCompare :view="response.view_lhs" />
              </div>
              <div v-if="response.view_rhs">
                <ViewVariantsCompare :view="response.view_rhs" />
              </div>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>

        <v-alert
          prominent
          type="error"
          tile
          elevation="2"
          class="mt-10"
          icon="mdi-network-off-outline"
          color="grey darken-4"
          v-if="connectionErrors"
        >
          <v-row align="center">
            <v-col class="grow">
              {{ connectionErrors.details }}
            </v-col>
          </v-row>
        </v-alert>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import MutalyzerService from "../services/MutalyzerService.js";
import Description from "../components/Description.vue";
import ViewVariantsCompare from "../components/ViewVariantsCompare.vue";

export default {
  components: {
    Description,
    ViewVariantsCompare,
  },
  data: () => ({
    valid: true,
    lazy: false,

    mode: "hgvs",

    loadingOverlay: false,

    reference: null,
    reference_type: null,
    lhs: null,
    lhs_type: null,
    lhs_hint: null,
    rhs: null,
    rhs_type: null,
    rhs_hint: null,

    rules: [(value) => !!value || "Required."],

    relation: null,

    response: null,
    connectionErrors: null,
  }),
  created: function () {
    this.run();
  },
  watch: {
    $route() {
      this.run();
    },
  },
  methods: {
    run: function () {
      this.setRouterParams();
      this.compare();
    },
    setRouterParams: function () {
      if (
        this._equals(this.$route.query.reference_type, "sequence") &&
        (this._equals(this.$route.query.lhs_type, "sequence") ||
          this._equals(this.$route.query.lhs_type, "variant")) &&
        (this._equals(this.$route.query.rhs_type, "sequence") ||
          this._equals(this.$route.query.rhs_type, "variant"))
      ) {
        this.mode = "sequence";
        this.reference = this.$route.query.reference;
        this.reference_type = this.$route.query.reference_type;
        this.lhs = this.$route.query.lhs;
        this.lhs_type = this.$route.query.lhs_type;
        this.rhs = this.$route.query.rhs;
        this.rhs_type = this.$route.query.rhs_type;
      } else if (
        !this.$route.query.reference_type &&
        this._equals(this.$route.query.lhs_type, "hgvs") &&
        this._equals(this.$route.query.rhs_type, "hgvs")
      ) {
        this.mode = "hgvs";
        this.lhs = this.$route.query.lhs;
        this.lhs_type = this.$route.query.lhs_type;
        this.rhs = this.$route.query.rhs;
        this.rhs_type = this.$route.query.rhs_type;
      } else if (
        !this.$route.query.reference &&
        !this.$route.query.reference_type &&
        !this.$route.query.lhs &&
        !this.$route.query.lhs_type &&
        !this.$route.query.rhs &&
        !this.$route.query.rhs_type
      ) {
        this.mode = "hgvs";
        this.reset();
      } else {
        this.mode = "hgvs";
        this.reset();
        this.$router.push({
          name: "Algebra",
        });
      }
    },
    _equals: function (p, e) {
      if (p && 0 !== p.length && p == e) {
        return true;
      } else {
        return false;
      }
    },
    reset: function () {
      this.reference = null;
      this.reference_type = null;
      this.lhs = null;
      this.lhs_type = "hgvs";
      this.rhs = null;
      this.rhs_type = "hgvs";
      this.relation = null;
      this.response = null;
    },
    compare: function () {
      if (this.lhs && this.lhs_type && this.rhs && this.rhs_type) {
        this.loadingOverlay = true;
        this.response = null;
        this.relation = null;
        this.connectionErrors = null;
        MutalyzerService.compare(this.getParams())
          .then((response) => {
            this.loadingOverlay = false;
            if (response.data) {
              this.response = response.data;
              if (response.data.relation) {
                this.relation = response.data.relation;
              }
            }
          })
          .catch((error) => {
            this.loadingOverlay = false;
            if (error.response) {
              this.connectionErrors = {
                details: "Some response error occured.",
              };
            } else if (error.request) {
              this.connectionErrors = {
                details: "Some connection or server error occured.",
              };
            } else {
              this.connectionErrors = { details: "Some error occured." };
            }
          });
      }
    },
    switchMode: function () {
      if (this.mode == "sequence") {
        this.mode = "hgvs";
        this.reset();
        if (
          !(
            !this.$route.query.reference &&
            !this.$route.query.reference_type &&
            !this.$route.query.lhs &&
            !this.$route.query.lhs_type &&
            !this.$route.query.rhs &&
            !this.$route.query.rhs_type
          )
        ) {
          this.$router.push({
            name: "Algebra",
          });
        }
      } else if (this.mode == "hgvs") {
        this.mode = "sequence";
        this.reset();
        this.reference_type = "sequence";
        this.lhs_type = "variant";
        this.rhs_type = "variant";
      }
      this.relation = null;
    },
    getSwitchText: function () {
      if (this.mode == "hgvs") {
        return "Switch to sequence mode";
      } else if (this.mode == "sequence") {
        return "Switch to HGVS mode";
      }
    },
    getTitleText: function () {
      if (this.mode == "hgvs") {
        return "HGVS Mode";
      } else if (this.mode == "sequence") {
        return "Sequence Mode";
      }
    },
    getLhsHintText: function (hs_type) {
      if (this.mode == "hgvs") {
        return "E.g. NG_012337.3:g.274del";
      } else if (this.mode == "sequence") {
        if (hs_type == null || hs_type == "variant") {
          return "E.g. 2_3del";
        } else if (hs_type == "sequence") {
          return "E.g. ATTGAAT";
        }
      }
    },
    setExample: function () {
      if (this.mode == "hgvs") {
        this.lhs = "NG_012337.3:g.274T>A";
        this.lhs_type = "hgvs";
        this.rhs = "NG_012337.3:g.274del";
        this.rhs_type = "hgvs";
      } else if (this.mode == "sequence") {
        this.reference = "AAAAA";
        this.reference_type = "sequence";
        if (this.lhs_type == "sequence") {
          this.lhs = "ATAAAAA";
        } else {
          this.lhs = "1_2insTA";
        }
        if (this.rhs_type == "sequence") {
          this.rhs = "AATAAA";
        } else {
          this.rhs = "2_3insT";
        }
      }
    },
    getParams: function () {
      if (this.lhs && this.lhs_type && this.rhs && this.rhs_type) {
        if (this.reference && this.reference_type) {
          return {
            reference: this.reference,
            reference_type: this.reference_type,
            lhs: this.lhs,
            lhs_type: this.lhs_type,
            rhs: this.rhs,
            rhs_type: this.rhs_type,
          };
        }
        return {
          lhs: this.lhs,
          lhs_type: this.lhs_type,
          rhs: this.rhs,
          rhs_type: this.rhs_type,
        };
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
        return message.details + " (" + message.code + ")";
      }
      return message;
    },
  },
};
</script>

<style scoped src="../assets/main.css"></style>
<style lang="scss" scoped>
.sequence {
  margin-left: 5px;
  padding: 10px;
  text-decoration: none;
  font-family: monospace;
  display: block;
  color: #000000;
  background-color: #efefef;
  overflow-wrap: break-word;
}
</style>
