<template>
  <div>
    <div v-for="(variant, v_i) in variants" :key="v_i">
      <div class="variant">{{ variant.description }}</div>
      <div class="wrapper">
        <div class="seq">
          <span class="seq-elem" v-for="(s, s_i) in variant.left" :key="s_i">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <span v-bind="attrs" v-on="on">
                  <span>{{ s }}</span></span
                ></template
              >
              <span>{{ s_i + variant.start }}</span>
            </v-tooltip>
          </span>
        </div>
        <div class="seq" v-if="variant.equal">
          <span
            class="seq-elem"
            v-for="(s, s_i) in variant.equal.seq"
            :key="s_i"
          >
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <span v-bind="attrs" v-on="on">
                  <span>{{ s }}</span></span
                ></template
              >
              <span>{{ s_i + variant.start + variant.left.length }}</span>
            </v-tooltip>
          </span>
        </div>
        <div class="seq" v-if="variant.deleted || variant.inserted">
          <div class="seqdel" v-if="variant.deleted && variant.deleted.seq">
            <span
              class="seq-elem"
              v-for="(s, s_i) in variant.deleted.seq"
              :key="s_i"
            >
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <span v-bind="attrs" v-on="on">
                    <span>{{ s }}</span></span
                  ></template
                >
                <span>{{ s_i + variant.start + variant.left.length }}</span>
              </v-tooltip>
            </span>
          </div>
          <div v-else><span class="seq">-</span></div>
          <v-divider></v-divider>
          <div class="seqins" v-if="variant.inserted && variant.inserted.seq">
            <span
              class="seq-elem"
              v-for="(s, s_i) in variant.inserted"
              :key="s_i"
              >{{ s }}</span
            >
          </div>
          <div v-else><span class="seq">-</span></div>
        </div>
        <div class="seq">
          <span class="seq-elem" v-for="(s, s_i) in variant.right" :key="s_i">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <span v-bind="attrs" v-on="on">
                  <span>{{ s }}</span></span
                ></template
              >
              <span>{{ get_right_position(variant, s_i) }}</span>
            </v-tooltip>
          </span>
        </div>
      </div>
    </div>
    <v-expansion-panels focusable hover flat class="mt-5 mb-10" v-if="variants">
      <v-expansion-panel>
        <v-expansion-panel-header>View as a tree</v-expansion-panel-header>
        <v-expansion-panel-content>
          <JsonPretty :summary="variants" />
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script>
import MutalyzerService from "../services/MutalyzerService.js";
import JsonPretty from "./JsonPretty.vue";

export default {
  name: "ViewVariants",
  components: {
    JsonPretty,
  },
  props: {
    description: null,
  },
  data() {
    return {
      variants: [],
    };
  },
  created: function () {
    this.get_variants();
  },
  methods: {
    get_variants: function () {
      if (this.description) {
        MutalyzerService.view(this.description).then((response) => {
          if (response.data) {
            this.variants = response.data;
          }
        });
      }
    },
    get_right_position: function (variant, seq_index) {
      let position = variant.start + variant.left.length;
      if (variant.deleted) {
        if (variant.deleted.seq) {
          position += variant.deleted.seq.length;
        }
      } else if (variant.equal) {
        position += variant.equal.seq.length;
      }
      position += seq_index;
      return position;
    },
  },
};
</script>

<style scoped src="../assets/main.css"></style>
<style scoped>
.wrapper {
  overflow-x: auto;
  white-space: nowrap;
}

.variant {
  font-family: monospace;
  margin-top: 15px;
  padding: 2px;
  background-color: #efefef;
}

.seq {
  display: inline-block;
  vertical-align: middle;
  text-align: center;
  margin: 0 auto;
  font-family: monospace;
  color: #000000;
  background-color: #ffffff;
}

.seq-elem {
  padding: 1px;
  text-align: center;
}

.seq-elem:hover {
  background-color: #b8b8b8;
}

.seq-elem {
  padding: 1px;
  text-align: center;
}

.seqdel {
  display: inline-block;
  text-align: center;
  font-family: monospace;
  color: #b71c1c;
}

.seqins {
  display: inline-block;
  text-align: center;
  font-family: monospace;
  color: #1c1fb7;
}
</style>
