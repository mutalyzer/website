<template>
  <div>
    <div class="variant">
      <span v-for="(v, v_i) in view.views" :key="v_i">
        <span
          v-if="v.type == 'variant'"
          @mouseover="
            hover_variants[v_i] = true;
            hover_sequence[v_i] = true;
          "
          @mouseleave="
            hover_variants[v_i] = false;
            hover_sequence[v_i] = false;
          "
          :class="
            hover_variants[v_i] || hover_sequence[v_i]
              ? 'variant-s-hover'
              : 'variant-s'
          "
          @click="scroll_to_variant(v_i)"
          >{{ v.description }}</span
        >
        <span v-if="v.type == 'variant' && v_i < view.views.length - 2">;</span>
      </span>
    </div>
    <div class="wrapper">
      <v-icon v-if="!view.inverted" class="mr-2">mdi-arrow-right-bold</v-icon>
      <v-icon v-if="view.inverted" class="mr-2">mdi-arrow-left-bold</v-icon>
      <div v-for="(v, v_i) in view.views" :key="'v' + v_i" class="seq">
        <!-- outside sequence -->
        <div v-if="v.type == 'outside' && v.sequence">
          <span v-for="(s, s_i) in v.sequence" :key="'s' + s_i">
            <v-list-item-action class="ma-0 pa-0" style="min-width: unset">
              <v-menu>
                <template #activator="{ on: onMenu }">
                  <v-tooltip bottom>
                    <template #activator="{ on: onTooltip }">
                      <span
                        :class="get_seq_class(v, s_i, 'sequence')"
                        v-on="{ ...onMenu, ...onTooltip }"
                        >{{ s }}</span
                      ></template
                    ><span>{{ get_position(v, s_i, "sequence") + 1 }}</span>
                  </v-tooltip>
                </template>
                <v-list>
                  <v-list-item class="text-right">
                    <v-btn small text color="primary">
                      Get HGVS location
                    </v-btn>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-list-item-action>
          </span>
        </div>
        <!-- outside non sequence-->
        <div v-if="v.type == 'outside' && v.left">
          <!-- left -->
          <span v-for="(s, s_i) in v.left" :key="'l' + s_i">
            <v-list-item-action class="ma-0 pa-0" style="min-width: unset">
              <v-menu>
                <template #activator="{ on: onMenu }">
                  <v-tooltip bottom>
                    <template #activator="{ on: onTooltip }">
                      <span
                        :class="get_seq_class(v, s_i, 'left')"
                        v-on="{ ...onMenu, ...onTooltip }"
                        >{{ s }}</span
                      ></template
                    ><span>{{ get_position(v, s_i, "left") + 1 }}</span>
                  </v-tooltip>
                </template>
                <v-list>
                  <v-list-item class="text-right">
                    <v-btn small text color="primary">
                      Get HGVS location
                    </v-btn>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-list-item-action>
          </span>
          <div class="seq">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <span class="seq-elem" v-bind="attrs" v-on="on"
                  >...</span
                ></template
              >
              <span>other {{ get_position(v, null, "other") }} bases</span>
            </v-tooltip>
          </div>
          <!-- right -->
          <span v-for="(s, s_i) in v.right" :key="'r' + s_i">
            <v-list-item-action class="ma-0 pa-0" style="min-width: unset">
              <v-menu>
                <template #activator="{ on: onMenu }">
                  <v-tooltip bottom>
                    <template #activator="{ on: onTooltip }">
                      <span
                        :class="get_seq_class(v, s_i, 'right')"
                        v-on="{ ...onMenu, ...onTooltip }"
                        >{{ s }}</span
                      ></template
                    ><span>{{ get_position(v, s_i, "right") + 1 }}</span>
                  </v-tooltip>
                </template>
                <v-list>
                  <v-list-item class="text-right">
                    <v-btn small text color="primary">
                      Get HGVS location
                    </v-btn>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-list-item-action>
          </span>
        </div>
        <!-- variant: deleted & inserted -->
        <div
          class="seq"
          :id="d_id + '_variant_' + v_i"
          v-if="v.type == 'variant'"
          @mouseover="
            hover_variants[v_i] = true;
            hover_sequence[v_i] = true;
          "
          @mouseleave="
            hover_variants[v_i] = false;
            hover_sequence[v_i] = false;
          "
          :class="
            hover_variants[v_i] || hover_sequence[v_i]
              ? 'seq-variant'
              : 'seq-variant-hover'
          "
        >
          <div
            v-if="
              (v.deleted || v.inserted) &&
              v.description &&
              !v.description.includes('=')
            "
          >
            <!-- deleted sequence -->
            <div class="seqdel" v-if="v.deleted && v.deleted.sequence">
              <span
                class="seq-elem"
                v-for="(s, s_i) in v.deleted.sequence"
                :key="'ds' + s_i"
              >
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <span v-bind="attrs" v-on="on">
                      <span>{{ s }}</span></span
                    ></template
                  >
                  <span>{{ get_position(v, s_i, "sequence") + 1 }}</span>
                </v-tooltip>
              </span>
            </div>
            <!-- deleted left-->
            <div class="seqdel" v-if="v.deleted && v.deleted.left">
              <span
                class="seq-elem"
                v-for="(s, s_i) in v.deleted.left"
                :key="s_i"
              >
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <span v-bind="attrs" v-on="on">
                      <span>{{ s }}</span></span
                    ></template
                  >
                  <span>{{ get_position(v, s_i, "left") + 1 }}</span>
                </v-tooltip>
              </span>
            </div>
            <!-- deleted middle dots-->
            <div class="seqdel" v-if="v.deleted && v.deleted.right">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <span class="seq-elem" v-bind="attrs" v-on="on">
                    <span>...</span></span
                  ></template
                >
                <span
                  >other
                  {{ get_position(v, null, "other-deleted") }} bases</span
                >
              </v-tooltip>
            </div>
            <!-- deleted right-->
            <div class="seqdel" v-if="v.deleted && v.deleted.right">
              <span
                class="seq-elem"
                v-for="(s, s_i) in v.deleted.right"
                :key="s_i"
              >
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <span v-bind="attrs" v-on="on">
                      <span>{{ s }}</span></span
                    ></template
                  >
                  <span>{{ get_position(v, s_i, "right-deleted") + 1 }}</span>
                </v-tooltip>
              </span>
            </div>
            <!-- deleted empty-->
            <div v-if="!v.deleted">
              <span class="seq">-</span>
            </div>
            <v-divider></v-divider>
            <!-- inserted sequence -->
            <div class="seqins" v-if="v.inserted && v.inserted.sequence">
              <span
                class="seq-elem"
                v-for="(s, s_i) in v.inserted.sequence"
                :key="s_i"
                >{{ s }}</span
              >
            </div>
            <!-- inserted left-->
            <div class="seqins" v-if="v.inserted && v.inserted.left">
              <span
                class="seq-elem"
                v-for="(s, s_i) in v.inserted.left"
                :key="s_i"
                >{{ s }}</span
              >
            </div>
            <!-- inserted middle dots-->
            <div class="seqins" v-if="v.inserted && v.inserted.right">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <span class="seq-elem" v-bind="attrs" v-on="on">
                    <span>...</span></span
                  ></template
                >
                <span
                  >other
                  {{ get_position(v, null, "other-inserted") }} bases</span
                >
              </v-tooltip>
            </div>
            <!-- inserted right-->
            <div class="seqins" v-if="v.inserted && v.inserted.right">
              <span
                class="seq-elem"
                v-for="(s, s_i) in v.inserted.right"
                :key="s_i"
                >{{ s }}</span
              >
            </div>
            <!-- inserted empty -->
            <div v-if="!v.inserted">
              <span class="seq">-</span>
            </div>
          </div>
          <div v-else>
            <!-- equal -->
            <div class="seqdelequal" v-if="v.deleted && v.deleted.sequence">
              <span
                class="seq-elem"
                v-for="(s, s_i) in v.deleted.sequence"
                :key="'ds' + s_i"
              >
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <span v-bind="attrs" v-on="on">
                      <span>{{ s }}</span></span
                    ></template
                  >
                  <span>{{ get_position(v, s_i, "sequence") + 1 }}</span>
                </v-tooltip>
              </span>
            </div>
            <!-- equal left-->
            <div class="seqdelequal" v-if="v.deleted && v.deleted.left">
              <span
                class="seq-elem"
                v-for="(s, s_i) in v.deleted.left"
                :key="s_i"
              >
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <span v-bind="attrs" v-on="on">
                      <span>{{ s }}</span></span
                    ></template
                  >
                  <span>{{ get_position(v, s_i, "left") + 1 }}</span>
                </v-tooltip>
              </span>
            </div>
            <!-- equal middle dots-->
            <div class="seqdelequal" v-if="v.deleted && v.deleted.right">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <span class="seq-elem" v-bind="attrs" v-on="on">
                    <span>...</span></span
                  ></template
                >
                <span
                  >other
                  {{ get_position(v, null, "other-deleted") }} bases</span
                >
              </v-tooltip>
            </div>
            <!-- equal right-->
            <div class="seqdelequal" v-if="v.deleted && v.deleted.right">
              <span
                class="seq-elem"
                v-for="(s, s_i) in v.deleted.right"
                :key="s_i"
              >
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <span v-bind="attrs" v-on="on">
                      <span>{{ s }}</span></span
                    ></template
                  >
                  <span>{{ get_position(v, s_i, "right-deleted") + 1 }}</span>
                </v-tooltip>
              </span>
            </div>
          </div>
        </div>
      </div>
      <v-icon v-if="!view.inverted" class="ml-2">mdi-arrow-right-bold</v-icon>
      <v-icon v-if="view.inverted" class="ml-2">mdi-arrow-left-bold</v-icon>
    </div>
  </div>
</template>

<script>
export default {
  name: "ViewVariantsCore",
  props: {
    view: null,
    influence: null,
    d_id: null,
  },
  data: function () {
    return {
      hover_variants: null,
      hover_sequence: null,
    };
  },
  created: function () {
    this.hover_init();
    console.log(this.view.views);
  },
  methods: {
    get_position: function (view, s_i, key) {
      let position = null;
      if (key == "sequence") {
        position = s_i + view.start;
      } else if (key == "left") {
        position = s_i + view.start;
      } else if (key == "right") {
        position = view.end - view.right.length + s_i;
      } else if (key == "right-deleted") {
        position = view.end - view.deleted.right.length + s_i;
      } else if (key == "other") {
        position =
          view.end - view.start - (view.left.length + view.right.length);
      } else if (key == "other-deleted") {
        position =
          view.end -
          view.start -
          (view.deleted.left.length + view.deleted.right.length);
      } else if (key == "other-inserted") {
        position =
          view.inserted.length -
          (view.inserted.left.length + view.inserted.right.length);
      } else {
        position = s_i;
      }
      if (this.view.inverted) {
        return this.view.seq_length - position - 1;
      } else {
        return position;
      }
    },
    hover_init: function () {
      let h_v = {};
      let h_s = {};
      if (this.view && this.view.views) {
        for (const [i, v] of this.view.views.entries()) {
          if (v.type == "variant") {
            h_v[i] = false;
            h_s[i] = false;
          }
        }
      }
      this.hover_variants = h_v;
      this.hover_sequence = h_s;
    },
    scroll_to_variant: function (v_i) {
      var elmnt = document.getElementById(this.d_id + "_variant_" + v_i);
      elmnt.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    },
    get_seq_class: function (v, s_i, key) {
      if (
        this.influence &&
        (this.influence.min_pos || this.influence.min_pos == 0) &&
        this.influence.max_pos &&
        this.influence.min_pos <= this.get_position(v, s_i, key) &&
        this.get_position(v, s_i, key) < this.influence.max_pos
      ) {
        return "seq-elem-influence";
      }
      return "seq-elem";
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
  word-break: break-all;
  background-color: var(--blue-grey-lighten-5);
}

.variant-s {
  font-family: monospace;
  padding: 5px;
  background-color: var(--blue-grey-lighten-5);
}

.variant-s-hover {
  font-family: monospace;
  padding: 5px;
  background-color: var(--blue-grey-lighten-4);
  cursor: pointer;
}

.seq-variant {
  background-color: var(--blue-grey-lighten-4);
  display: inline-block;
  vertical-align: middle;
  text-align: center;
  padding: 5px;
  margin: 0 auto;
  font-family: monospace;
}

.seq-variant-hover {
  background-color: var(--blue-grey-lighten-5);
  display: inline-block;
  vertical-align: middle;
  text-align: center;
  padding: 5px;
  margin: 0 auto;
  font-family: monospace;
}

.seq {
  display: inline-block;
  vertical-align: middle;
  text-align: center;
  margin: 0 auto;
  font-family: monospace;
  color: #000000;
}

.seq-elem {
  padding: 5px;
  text-align: center;
}

.seq-elem:hover {
  padding: 5px;
  background-color: #b8b8b8;
  cursor: pointer;
}

.seq-elem-influence {
  padding: 5px;
  background-color: var(--blue-grey-lighten-5);
  text-align: center;
}

.seq-elem-influence:hover {
  padding: 5px;
  background-color: #b8b8b8;
  cursor: pointer;
}

.seqdel {
  display: inline-block;
  text-align: center;
  font-family: monospace;
  color: #b71c1c;
}

.seqdelequal {
  display: inline-block;
  text-align: center;
  font-family: monospace;
  color: #004d40;
}

.seqins {
  display: inline-block;
  text-align: center;
  font-family: monospace;
  color: #1c1fb7;
}
</style>
