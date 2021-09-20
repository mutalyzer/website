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
                    <v-btn
                      small
                      text
                      color="primary"
                      @click="switchReferenceType()"
                      >{{ getSwitchText() }}</v-btn
                    >
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-row>
          </v-sheet>
          <v-sheet class="pa-10">
            <v-form ref="form" v-model="valid" :lazy-validation="lazy">
              <v-row v-if="referenceType == 'sequence'" class="pl-2 pr-2">
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
              <v-row v-if="referenceType == 'sequence'" class="pl-2 pr-2">
                <v-col cols="12" sm="9" lg="9">
                  <v-text-field
                    :rules="rules"
                    v-model="lhs"
                    :label="'LHS'"
                    :hint="'E.g. ATTAA'"
                    :clearable="true"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" sm="3" lg="3">
                  <v-select
                    v-model="lhsType"
                    :rules="rules"
                    :items="['sequence', 'variant']"
                    :clearable="true"
                    label="Type"
                  ></v-select>
                </v-col>
              </v-row>

              <v-row v-if="referenceType == 'id'" class="pl-2 pr-2">
                <v-col cols="12">
                  <v-text-field
                    :rules="rules"
                    v-model="lhs"
                    :label="'LHS'"
                    :hint="'E.g. NG_012337.3:g.274T>A'"
                    :clearable="true"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row v-if="referenceType == 'sequence'" class="pl-2 pr-2">
                <v-col cols="12" sm="9" lg="9">
                  <v-text-field
                    v-model="rhs"
                    :rules="rules"
                    :label="'RHS'"
                    :hint="'E.g. TTTTT'"
                    :clearable="true"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" sm="3" lg="3">
                  <v-select
                    v-model="rhsType"
                    :rules="rules"
                    :items="['sequence', 'variant']"
                    :clearable="true"
                    label="Type"
                  ></v-select>
                </v-col>
              </v-row>

              <v-row v-if="referenceType == 'id'" class="pl-2 pr-2">
                <v-col cols="12">
                  <v-text-field
                    :rules="rules"
                    v-model="rhs"
                    :label="'RHS'"
                    :hint="'E.g. NG_012337.3:g.274del'"
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
                  query: {
                    reference: reference,
                    referenceType: referenceType,
                    lhs: lhs,
                    lhsType: lhsType,
                    rhs: rhs,
                    rhsType: rhsType,
                  },
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
          class="pt-10 pr-10 pb-8 pl-10"
          elevation="2"
          color="red lighten-5"
          v-if="errorsEncountered()"
        >
          <v-alert
            color="red lighten-1"
            tile
            border="left"
            dark
            v-for="(error, index) in response.errors"
            :key="index"
          >
            <div>
              {{ getMessage(error) }}
            </div>
          </v-alert>
        </v-sheet>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import MutalyzerService from "../services/MutalyzerService.js";
import Description from "../components/Description.vue";

export default {
  components: {
    Description,
  },
  data: () => ({
    valid: true,
    lazy: false,

    loadingOverlay: false,

    reference: null,
    referenceType: null,
    lhs: null,
    lhsType: null,
    rhs: null,
    rhsType: null,

    rules: [(value) => !!value || "Required."],

    relation: null,

    response: null,
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
      if (
        this.$route.query.reference &&
        0 !== this.$route.query.reference.length &&
        this.$route.query.referenceType &&
        0 !== this.$route.query.referenceType.length &&
        this.$route.query.lhs &&
        0 !== this.$route.query.lhs.length &&
        this.$route.query.lhsType &&
        0 !== this.$route.query.lhsType.length &&
        this.$route.query.rhs &&
        0 !== this.$route.query.rhs.length &&
        this.$route.query.rhsType &&
        0 !== this.$route.query.rhsType.length
      ) {
        this.compare();
      }
    },
    setRouterParams: function () {
      if (
        this.$route.query.referenceType &&
        0 !== this.$route.query.referenceType.length
      ) {
        if (this.$route.query.referenceType == "sequence") {
          this.referenceType = this.$route.query.referenceType;
        } else if (this.$route.query.referenceType == "id") {
          this.referenceType = this.$route.query.referenceType;
        } else {
          this.referenceType = "id";
        }
      } else {
        this.referenceType = "id";
      }
      if (
        this.$route.query.reference &&
        0 !== this.$route.query.reference.length
      ) {
        this.reference = this.$route.query.reference;
      }
      if (this.$route.query.lhs && 0 !== this.$route.query.lhs.length) {
        this.lhs = this.$route.query.lhs;
      }
      if (this.$route.query.lhsType && 0 !== this.$route.query.lhsType.length) {
        if (
          (this.referenceType == "sequence" &&
            (this.$route.query.lhsType == "sequence" ||
              this.$route.query.lhsType == "variant")) ||
          (this.referenceType == "id" && this.$route.query.lhsType == "hgvs")
        ) {
          this.lhsType = this.$route.query.lhsType;
        } else {
          this.lhsType = null;
        }
      }
      if (this.$route.query.rhs && 0 !== this.$route.query.rhs.length) {
        this.rhs = this.$route.query.rhs;
      }
      if (this.$route.query.rhsType && 0 !== this.$route.query.rhsType.length) {
        if (
          (this.referenceType == "sequence" &&
            (this.$route.query.rhsType == "sequence" ||
              this.$route.query.rhsType == "variant")) ||
          (this.referenceType == "id" && this.$route.query.rhsType == "hgvs")
        ) {
          this.rhsType = this.$route.query.rhsType;
        } else {
          this.rhsType = null;
        }
      }
    },
    switchReferenceType: function () {
      if (this.referenceType == "sequence") {
        this.$router.push({
          name: "Algebra",
          query: {
            referenceType: "id",
            lhsType: "hgvs",
            rhsType: "hgvs",
          },
        });
        // this.referenceType = "id";
        // this.lhsType = "hgvs";
        // this.rhsType = "hgvs";
      } else if (this.referenceType == "id") {
        this.$router.push({
          name: "Algebra",
          query: {
            referenceType: "sequence",
          },
        });
        // this.referenceType = "sequence";
        // this.lhsType = null;
        // this.rhsType = null;
      }
      this.relation = null;
      // this.reference = null;
      // this.lhs = null;
      // this.rhs = null;
    },
    getSwitchText: function () {
      if (this.referenceType == "id") {
        return "Switch to sequence mode";
      } else if (this.referenceType == "sequence") {
        return "Switch to HGVS mode";
      }
    },
    getTitleText: function () {
      if (this.referenceType == "id") {
        return "HGVS Mode";
      } else if (this.referenceType == "sequence") {
        return "Sequence Mode";
      }
    },
    setExample: function () {
      if (this.referenceType == "id") {
        this.reference = "NG_012337.3";
        this.referenceType = "id";
        this.lhs = "NG_012337.3:g.274T>A";
        this.lhsType = "hgvs";
        this.rhs = "NG_012337.3:g.274del";
        this.rhsType = "hgvs";
      } else if (this.referenceType == "sequence") {
        this.reference = "AAAAA";
        this.referenceType = "sequence";
        this.lhs = "ATAAAAA";
        this.lhsType = "sequence";
        this.rhs = "2_3insT";
        this.rhsType = "variant";
      }
    },
    compare: function () {
      this.errorMessages = [];
      if (
        this.reference !== null &&
        this.referenceType !== null &&
        this.lhs &&
        this.lhsType &&
        this.rhs &&
        this.rhsType
      ) {
        this.loadingOverlay = true;
        this.response = null;
        this.relation = null;
        const params = {
          reference: this.reference,
          reference_type: this.referenceType,
          lhs: this.lhs,
          lhs_type: this.lhsType,
          rhs: this.rhs,
          rhs_type: this.rhsType,
        };
        MutalyzerService.compare(params)
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
