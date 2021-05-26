<template>
  <div>
    <v-progress-linear
      indeterminate
      v-if="progress"
    ></v-progress-linear>

    <div v-for="(variant, v_i) in variants" :key="v_i">
      <div class="variant">{{ variant.description }}</div>
      <div class="wrapper">
        <!-- before -->
        <div class="seq" v-if="get_before_length(variant) > 0">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <span class="seq-elem" v-bind="attrs" v-on="on">
                <span>...</span></span
              ></template
            >
            <span
              >other
              {{ get_before_length(variant) }}
              bases</span
            >
          </v-tooltip>
        </div>

        <!-- left -->
        <div class="seq">
          <span class="seq-elem" v-for="(s, s_i) in variant.left" :key="s_i">
            <v-list-item-action class="ma-0 pa-0" style="min-width: unset">
              <v-menu>
                <template #activator="{ on: onMenu }">
                  <v-tooltip bottom>
                    <template #activator="{ on: onTooltip }">
                      <span v-on="{ ...onMenu, ...onTooltip }">{{
                        s
                      }}</span></template
                    ><span>{{ get_left_position(variant, s_i) }}</span>
                  </v-tooltip>
                </template>
                <v-list>
                  <v-list-item class="text-right">
                    <v-btn small text color="primary" @click="map(false)">
                      Get HGVS location
                    </v-btn>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-list-item-action>
          </span>
        </div>
        <div class="seq-variant">
          <!-- equal not shrunk -->
          <div class="seq" v-if="variant.equal && variant.equal.seq">
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
          <!-- equal shrunk left-->
          <div class="seq" v-if="variant.equal && variant.equal.left">
            <span
              class="seq-elem"
              v-for="(s, s_i) in variant.equal.left"
              :key="s_i"
            >
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <span v-bind="attrs" v-on="on">
                    <span>{{ s }}</span></span
                  ></template
                >
                <span>{{ get_shrunk_left_position(variant, s_i) }}</span>
              </v-tooltip>
            </span>
          </div>
          <!-- equal shrunk middle dots-->
          <div class="seq" v-if="variant.equal && variant.equal.right">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <span class="seq-elem" v-bind="attrs" v-on="on">
                  <span>...</span></span
                ></template
              >
              <span
                >other
                {{ get_shrunk_not_included_bases(variant, "equal") }}
                bases</span
              >
            </v-tooltip>
          </div>
          <!-- equal shrunk right-->
          <div class="seq" v-if="variant.equal && variant.equal.right">
            <span
              class="seq-elem"
              v-for="(s, s_i) in variant.equal.right"
              :key="s_i"
            >
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <span v-bind="attrs" v-on="on">
                    <span>{{ s }}</span></span
                  ></template
                >
                <span>{{
                  get_shrunk_right_position(variant, s_i, "equal")
                }}</span>
              </v-tooltip>
            </span>
          </div>
          <!-- deleted & inserted -->
          <div class="seq" v-if="variant.deleted || variant.inserted">
            <!-- deleted not shrunk -->
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
                  <span>{{
                    get_deleted_not_shrunk_position(variant, s_i)
                  }}</span>
                </v-tooltip>
              </span>
            </div>
            <!-- deleted shrunk left-->
            <div class="seqdel" v-if="variant.deleted && variant.deleted.left">
              <span
                class="seq-elem"
                v-for="(s, s_i) in variant.deleted.left"
                :key="s_i"
              >
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <span v-bind="attrs" v-on="on">
                      <span>{{ s }}</span></span
                    ></template
                  >
                  <span>{{ get_shrunk_left_position(variant, s_i) }}</span>
                </v-tooltip>
              </span>
            </div>
            <!-- deleted shrunk middle dots-->
            <div class="seqdel" v-if="variant.deleted && variant.deleted.right">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <span class="seq-elem" v-bind="attrs" v-on="on">
                    <span>...</span></span
                  ></template
                >
                <span
                  >other
                  {{ get_shrunk_not_included_bases(variant, "deleted") }}
                  bases</span
                >
              </v-tooltip>
            </div>
            <!-- deleted shrunk right-->
            <div class="seqdel" v-if="variant.deleted && variant.deleted.right">
              <span
                class="seq-elem"
                v-for="(s, s_i) in variant.deleted.right"
                :key="s_i"
              >
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <span v-bind="attrs" v-on="on">
                      <span>{{ s }}</span></span
                    ></template
                  >
                  <span>{{
                    get_shrunk_right_position(variant, s_i, "deleted")
                  }}</span>
                </v-tooltip>
              </span>
            </div>
            <!-- deleted empty-->
            <div v-if="!variant.deleted.seq && !variant.deleted.shrunk">
              <span class="seq">-</span>
            </div>
            <v-divider></v-divider>
            <!-- inserted not shrunk -->
            <div class="seqins" v-if="variant.inserted && variant.inserted.seq">
              <span
                class="seq-elem"
                v-for="(s, s_i) in variant.inserted"
                :key="s_i"
                >{{ s }}</span
              >
            </div>
            <!-- inserted shrunk left-->
            <div
              class="seqins"
              v-if="variant.inserted && variant.inserted.left"
            >
              <span
                class="seq-elem"
                v-for="(s, s_i) in variant.inserted.left"
                :key="s_i"
                >{{ s }}</span
              >
            </div>
            <!-- inserted shrunk middle dots-->
            <div
              class="seqins"
              v-if="variant.inserted && variant.inserted.right"
            >
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <span class="seq-elem" v-bind="attrs" v-on="on">
                    <span>...</span></span
                  ></template
                >
                <span
                  >other
                  {{ get_shrunk_not_included_bases(variant, "inserted") }}
                  bases</span
                >
              </v-tooltip>
            </div>
            <!-- inserted shrunk right-->
            <div
              class="seqins"
              v-if="variant.inserted && variant.inserted.right"
            >
              <span
                class="seq-elem"
                v-for="(s, s_i) in variant.inserted.right"
                :key="s_i"
                >{{ s }}</span
              >
            </div>
            <!-- inserted empty -->
            <div v-if="!variant.inserted.seq && !variant.inserted.shrunk">
              <span class="seq">-</span>
            </div>
          </div>
        </div>
        <!-- right -->
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
        <div class="seq" v-if="get_after_length(variant) > 0">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <span class="seq-elem" v-bind="attrs" v-on="on">
                <span>...</span></span
              ></template
            >
            <span
              >other
              {{ get_after_length(variant) }}
              bases</span
            >
          </v-tooltip>
        </div>
      </div>
    </div>
    <v-expansion-panels
      focusable
      hover
      flat
      class="mt-5 mb-10"
      v-if="variants && false"
    >
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
      progress: true,
    };
  },
  created: function () {
    this.get_variants();
  },
  methods: {
    get_variants: function () {
      if (this.description) {
        MutalyzerService.view(this.description).then((response) => {
          this.progress = false;
          if (response.data) {
            this.variants = response.data;
          }
        });
      }
    },
    get_left_position: function (variant, seq_index) {
      if (variant.inverted) {
        return variant.start - seq_index;
      }
      return seq_index + variant.start;
    },
    get_deleted_not_shrunk_position: function (variant, seq_index) {
      if (variant.inverted) {
        return variant.start - variant.left.length - seq_index;
      }
      return seq_index + variant.start + variant.left.length;
    },
    get_shrunk_not_included_bases: function (variant, type) {
      let part = null;
      if (type == "deleted") {
        part = variant.deleted;
      } else if (type == "inserted") {
        part = variant.inserted;
      } else if (type == "equal") {
        part = variant.equal;
      }
      return part.original_length - part.left.length - part.right.length;
    },
    get_shrunk_left_position: function (variant, seq_index) {
      if (variant.inverted) {
        return variant.start - variant.left.length - seq_index;
      }
      return variant.start + variant.left.length + seq_index;
    },
    get_shrunk_right_position: function (variant, seq_index, type) {
      let part = null;
      if (type == "deleted") {
        part = variant.deleted;
      } else if (type == "inserted") {
        part = variant.inserted;
      } else if (type == "equal") {
        part = variant.equal;
      }
      if (variant.inverted) {
        return (
          variant.start -
          variant.left.length -
          (part.original_length - part.right.length) -
          seq_index
        );
      }
      return (
        variant.start +
        variant.left.length +
        part.original_length -
        part.right.length +
        seq_index
      );
    },
    get_right_position: function (variant, seq_index) {
      let middle_length = this.get_middle_length(variant);
      if (variant.inverted) {
        return variant.start - variant.left.length - middle_length - seq_index;
      }
      return variant.start + variant.left.length + middle_length + seq_index;
    },
    get_middle_length: function (variant) {
      let middle_length = 0;
      if (variant.deleted) {
        return this.get_seq_length(variant.deleted);
      } else if (variant.equal) {
        return this.get_seq_length(variant.equal);
      }
      return middle_length;
    },
    get_seq_length: function (seq) {
      if (seq.seq) {
        return seq.seq.length;
      } else if (seq.original_length) {
        return seq.original_length;
      }
      return 0;
    },
    get_before_length: function (variant) {
      if (variant.inverted) {
        return variant.seq_length - variant.start - 1;
      }
      return variant.start;
    },
    get_after_length: function (variant) {
      let middle_length = this.get_middle_length(variant);
      if (variant.inverted) {
        return (
          variant.start -
          variant.left.length -
          middle_length -
          variant.right.length +
          1
        );
      }
      return (
        variant.seq_length -
        (variant.start + variant.left.length + middle_length)
      );
    },
  },
};
</script>

<style scoped src="../assets/main.css"></style>
<style scoped>
.wrapper {
  overflow-x: auto;
  white-space: nowrap;
  margin-top: 5px;
  margin-left: 5px;
  padding: 5px;
  background-color: var(--grey-lighten-5);
}

.variant {
  font-family: monospace;
  margin-top: 15px;
  padding: 5px;
  background-color: var(--blue-grey-lighten-5);
}

.seq-variant {
  background-color: var(--blue-grey-lighten-5);
  display: inline-block;
  vertical-align: middle;
  text-align: center;
  padding: 5px;
  margin: 0 auto;
  font-family: monospace;
}

.seq {
  letter-spacing: 2px;
  text-indent: 2px;
  display: inline-block;
  vertical-align: middle;
  text-align: center;
  margin: 0 auto;
  font-family: monospace;
  color: #000000;
}

.seq-elem {
  text-align: center;
}

.seq-elem:hover {
  background-color: #b8b8b8;
  cursor: pointer;
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
